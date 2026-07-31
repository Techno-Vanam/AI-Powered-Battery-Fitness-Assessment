#include <jni.h>
#include <android/log.h>
#include <cmath>
#include <vector>

#ifdef __has_include
#  if __has_include(<opencv2/objdetect/aruco_detector.hpp>)
#    include <opencv2/core.hpp>
#    include <opencv2/imgproc.hpp>
#    include <opencv2/objdetect/aruco_detector.hpp>
#    define HAVE_OPENCV 1
#  endif
#endif

#define TAG "ArucoJNI"
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, TAG, __VA_ARGS__)

// ─── Result layout (flat double[]):
//   [0]  detected   (1.0 = yes, 0.0 = no)
//   [1]  markerId
//   [2]  centerX
//   [3]  centerY
//   [4]  markerWidthPixels
//   [5]  markerHeightPixels
//   [6]  rotationAngle  (degrees)
//   [7]  cmPerPixel
//   [8]  confidence     (0–100)
//   [9]  tlX  [10] tlY
//   [11] trX  [12] trY
//   [13] brX  [14] brY
//   [15] blX  [16] blY
static constexpr int RESULT_SIZE = 17;
static constexpr double MARKER_CM = 21.0;
static constexpr int EXPECTED_ID  = 0;   // change if your printed marker has a different ID
static constexpr double MIN_MARKER_PX = 40.0;

#ifdef HAVE_OPENCV

static cv::Ptr<cv::aruco::ArucoDetector> g_detector;

static void ensureDetector() {
    if (!g_detector) {
        cv::aruco::Dictionary dict =
            cv::aruco::getPredefinedDictionary(cv::aruco::DICT_ARUCO_MIP_36h12);
        cv::aruco::DetectorParameters params;
        params.cornerRefinementMethod = cv::aruco::CORNER_REFINE_SUBPIX;
        g_detector = cv::makePtr<cv::aruco::ArucoDetector>(dict, params);
    }
}

static double edgeLen(const cv::Point2f& a, const cv::Point2f& b) {
    double dx = b.x - a.x, dy = b.y - a.y;
    return std::sqrt(dx * dx + dy * dy);
}

// Laplacian variance — proxy for sharpness
static double sharpness(const cv::Mat& gray, const cv::Rect& roi) {
    cv::Mat crop = gray(roi);
    cv::Mat lap;
    cv::Laplacian(crop, lap, CV_64F);
    cv::Scalar mu, sigma;
    cv::meanStdDev(lap, mu, sigma);
    return sigma[0] * sigma[0];
}

static double clamp01(double v) { return v < 0.0 ? 0.0 : (v > 1.0 ? 1.0 : v); }

extern "C"
JNIEXPORT jdoubleArray JNICALL
Java_com_sports_aruco_ArucoModule_nativeDetect(
        JNIEnv* env,
        jobject /* this */,
        jbyteArray yPlane,
        jint width,
        jint height,
        jint rowStride) {

    jdoubleArray out = env->NewDoubleArray(RESULT_SIZE);
    double buf[RESULT_SIZE] = {};
    // default: not detected
    env->SetDoubleArrayRegion(out, 0, RESULT_SIZE, buf);

    ensureDetector();

    jbyte* yData = env->GetByteArrayElements(yPlane, nullptr);
    if (!yData) return out;

    // Build gray Mat from Y plane (handle row stride padding)
    cv::Mat gray(height, width, CV_8UC1);
    if (rowStride == width) {
        std::memcpy(gray.data, yData, (size_t)(width * height));
    } else {
        for (int r = 0; r < height; ++r) {
            std::memcpy(gray.ptr(r), yData + r * rowStride, (size_t)width);
        }
    }
    env->ReleaseByteArrayElements(yPlane, yData, JNI_ABORT);

    std::vector<std::vector<cv::Point2f>> corners, rejected;
    std::vector<int> ids;
    g_detector->detectMarkers(gray, corners, ids, rejected);

    // Find the expected marker ID
    int foundIdx = -1;
    for (int i = 0; i < (int)ids.size(); ++i) {
        if (ids[i] == EXPECTED_ID) { foundIdx = i; break; }
    }
    if (foundIdx < 0) {
        env->SetDoubleArrayRegion(out, 0, RESULT_SIZE, buf);
        return out;
    }

    const auto& c = corners[foundIdx];
    // corners: TL=0, TR=1, BR=2, BL=3
    cv::Point2f tl = c[0], tr = c[1], br = c[2], bl = c[3];

    // Reject if any corner is outside the frame
    for (const auto& pt : c) {
        if (pt.x < 0 || pt.y < 0 || pt.x >= width || pt.y >= height) {
            env->SetDoubleArrayRegion(out, 0, RESULT_SIZE, buf);
            return out;
        }
    }

    double topEdge    = edgeLen(tl, tr);
    double bottomEdge = edgeLen(bl, br);
    double leftEdge   = edgeLen(tl, bl);
    double rightEdge  = edgeLen(tr, br);

    double markerW = (topEdge + bottomEdge) / 2.0;
    double markerH = (leftEdge + rightEdge) / 2.0;

    // Reject if too small
    if (markerH < MIN_MARKER_PX || markerW < MIN_MARKER_PX) {
        env->SetDoubleArrayRegion(out, 0, RESULT_SIZE, buf);
        return out;
    }

    double cx = (tl.x + tr.x + br.x + bl.x) / 4.0;
    double cy = (tl.y + tr.y + br.y + bl.y) / 4.0;

    double dx = tr.x - tl.x, dy = tr.y - tl.y;
    double rotation = std::atan2(dy, dx) * 180.0 / M_PI;

    double cmPerPixel = MARKER_CM / markerH;

    // ── Confidence (0–100) ──────────────────────────────────────────────────
    // 1. Corner quality: ratio of accepted / (accepted + rejected)
    int total = (int)(corners.size() + rejected.size());
    double cornerScore = total > 0 ? (double)corners.size() / total : 1.0;

    // 2. Size score: larger = better, saturates at 200 px
    double sizeScore = clamp01(markerH / 200.0);

    // 3. Sharpness score
    int x0 = (int)std::min({tl.x, tr.x, br.x, bl.x});
    int y0 = (int)std::min({tl.y, tr.y, br.y, bl.y});
    int x1 = (int)std::max({tl.x, tr.x, br.x, bl.x});
    int y1 = (int)std::max({tl.y, tr.y, br.y, bl.y});
    x0 = std::max(0, x0); y0 = std::max(0, y0);
    x1 = std::min(width - 1, x1); y1 = std::min(height - 1, y1);
    double sharpScore = 0.0;
    if (x1 > x0 && y1 > y0) {
        double lap = sharpness(gray, cv::Rect(x0, y0, x1 - x0, y1 - y0));
        sharpScore = clamp01(lap / 500.0);   // 500 = empirical "sharp" threshold
    }

    // 4. Viewing angle: compare aspect ratio to expected square
    double aspectRatio = (markerW > 0) ? markerH / markerW : 0.0;
    double angleScore  = clamp01(1.0 - std::abs(1.0 - aspectRatio));

    double confidence = (cornerScore * 0.35 + sizeScore * 0.25 +
                         sharpScore  * 0.25 + angleScore * 0.15) * 100.0;

    buf[0]  = 1.0;
    buf[1]  = (double)EXPECTED_ID;
    buf[2]  = cx;
    buf[3]  = cy;
    buf[4]  = markerW;
    buf[5]  = markerH;
    buf[6]  = rotation;
    buf[7]  = cmPerPixel;
    buf[8]  = confidence;
    buf[9]  = tl.x; buf[10] = tl.y;
    buf[11] = tr.x; buf[12] = tr.y;
    buf[13] = br.x; buf[14] = br.y;
    buf[15] = bl.x; buf[16] = bl.y;

    env->SetDoubleArrayRegion(out, 0, RESULT_SIZE, buf);
    return out;
}

#else // HAVE_OPENCV not available — stub so the build succeeds without the SDK

extern "C"
JNIEXPORT jdoubleArray JNICALL
Java_com_sports_aruco_ArucoModule_nativeDetect(
        JNIEnv* env, jobject, jbyteArray, jint, jint, jint) {
    LOGE("OpenCV headers not found — ArUco detection disabled");
    jdoubleArray out = env->NewDoubleArray(RESULT_SIZE);
    double buf[RESULT_SIZE] = {};
    env->SetDoubleArrayRegion(out, 0, RESULT_SIZE, buf);
    return out;
}

#endif
