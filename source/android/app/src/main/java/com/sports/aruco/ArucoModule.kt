package com.sports.aruco

import android.media.Image
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
import com.mrousavy.camera.frameprocessors.VisionCameraProxy
import org.opencv.android.OpenCVLoader
import org.opencv.core.CvType
import org.opencv.core.Mat
import org.opencv.imgproc.Imgproc
import org.opencv.objdetect.ArucoDetector
import org.opencv.objdetect.DetectorParameters
import org.opencv.objdetect.Objdetect
import java.nio.ByteBuffer
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.math.abs
import kotlin.math.atan2
import kotlin.math.hypot
import kotlin.math.min

private const val TAG = "ArucoModule"

/** Physical printed marker side length (cm) — DICT_MIP_36h12, default 15×15 cm print. */
private const val MARKER_CM = 15.0
private const val MIN_MARKER_PX = 28.0
/** DICT_MIP_36h12 supports IDs 0–249. */
private const val MAX_MARKER_ID = 249

/**
 * Shared OpenCV ArUco detector — used by both the RN module and the
 * VisionCamera Frame Processor (which often cannot resolve NativeModules).
 */
object ArucoDetectorEngine {
    private val ready = AtomicBoolean(false)
    @Volatile private var detector: ArucoDetector? = null
    @Volatile private var initError: String? = null
    private var frameCount = 0

    fun ensureReady(): Boolean {
        if (ready.get()) return true
        synchronized(this) {
            if (ready.get()) return true
            return try {
                val ok = OpenCVLoader.initLocal()
                if (!ok) {
                    initError = "OPENCV_INIT_FAILED"
                    Log.e(TAG, "OpenCVLoader.initLocal() returned false")
                    false
                } else {
                    detector = buildDetector()
                    ready.set(true)
                    initError = null
                    Log.i(TAG, "OpenCV ready — DICT_ARUCO_MIP_36h12")
                    true
                }
            } catch (e: Exception) {
                initError = e.message ?: "INIT_EXCEPTION"
                Log.e(TAG, "OpenCV init failed", e)
                false
            }
        }
    }

    fun statusError(): String? = if (ready.get()) null else (initError ?: "NOT_READY")

    private fun buildDetector(): ArucoDetector {
        val dictionary = Objdetect.getPredefinedDictionary(Objdetect.DICT_ARUCO_MIP_36h12)
        val params = DetectorParameters().apply {
            // Tuned for DICT_MIP_36h12 on phone cameras
            set_adaptiveThreshWinSizeMin(3)
            set_adaptiveThreshWinSizeMax(45)
            set_adaptiveThreshWinSizeStep(6)
            set_adaptiveThreshConstant(7.0)
            set_minMarkerPerimeterRate(0.01)
            set_maxMarkerPerimeterRate(4.0)
            set_polygonalApproxAccuracyRate(0.05)
            set_minCornerDistanceRate(0.03)
            set_minDistanceToBorder(0)
            set_minMarkerDistanceRate(0.025)
            set_cornerRefinementMethod(Objdetect.CORNER_REFINE_SUBPIX)
            set_cornerRefinementWinSize(5)
            set_cornerRefinementMaxIterations(50)
            set_cornerRefinementMinAccuracy(0.05)
            set_markerBorderBits(1)
            set_perspectiveRemovePixelPerCell(8)
            set_perspectiveRemoveIgnoredMarginPerCell(0.13)
            set_maxErroneousBitsInBorderRate(0.35)
            set_minOtsuStdDev(2.0)
            // DICT_4X4_50 has max hamming distance 5 — tighter correction rate
            set_errorCorrectionRate(0.6)
        }
        return ArucoDetector(dictionary, params)
    }

    fun detect(frame: Frame): Map<String, Any> {
        if (!ensureReady()) {
            return mapOf("detected" to false, "error" to (statusError() ?: "OPENCV_NOT_INIT"))
        }
        val det = detector
            ?: return mapOf("detected" to false, "error" to "DETECTOR_NULL")

        var gray: Mat? = null
        var enhanced: Mat? = null

        return try {
            val image = frame.image
            gray = imageYPlaneToGray(image)
            enhanced = Mat()
            Imgproc.equalizeHist(gray, enhanced)

            val corners = ArrayList<Mat>()
            val ids = Mat()
            val rejected = ArrayList<Mat>()
            det.detectMarkers(enhanced, corners, ids, rejected)

            if (ids.total() >= 1 && corners.isNotEmpty()) {
                return finishDetection(image.width, image.height, corners, ids, rejected)
            }

            // Second pass on raw gray (equalizeHist can hurt high-contrast prints)
            corners.forEach { it.release() }
            corners.clear()
            rejected.forEach { it.release() }
            rejected.clear()
            ids.release()

            val corners2 = ArrayList<Mat>()
            val ids2 = Mat()
            val rejected2 = ArrayList<Mat>()
            det.detectMarkers(gray, corners2, ids2, rejected2)
            finishDetection(image.width, image.height, corners2, ids2, rejected2)
        } catch (e: Exception) {
            Log.e(TAG, "detect error: ${e.message}", e)
            mapOf("detected" to false, "error" to (e.message ?: "UNKNOWN"))
        } finally {
            gray?.release()
            enhanced?.release()
        }
    }

    /**
     * Single-shot static-image detection for HeightMeasurementModule.
     * Accepts a pre-loaded (and already downscaled) grayscale [Mat].
     * Caller is responsible for releasing [grayMat] after this call.
     *
     * @return Detection result map identical to [detect].
     */
    fun detectOnGrayMat(grayMat: Mat): Map<String, Any> {
        if (!ensureReady()) {
            return mapOf("detected" to false, "error" to (statusError() ?: "OPENCV_NOT_INIT"))
        }
        val det = detector
            ?: return mapOf("detected" to false, "error" to "DETECTOR_NULL")

        var enhanced: Mat? = null
        return try {
            val w = grayMat.cols()
            val h = grayMat.rows()
            enhanced = Mat()
            Imgproc.equalizeHist(grayMat, enhanced)

            val corners = ArrayList<Mat>()
            val ids = Mat()
            val rejected = ArrayList<Mat>()
            det.detectMarkers(enhanced, corners, ids, rejected)

            if (ids.total() >= 1 && corners.isNotEmpty()) {
                return finishDetection(w, h, corners, ids, rejected)
            }

            corners.forEach { it.release() }
            corners.clear()
            rejected.forEach { it.release() }
            rejected.clear()
            ids.release()

            val corners2 = ArrayList<Mat>()
            val ids2 = Mat()
            val rejected2 = ArrayList<Mat>()
            det.detectMarkers(grayMat, corners2, ids2, rejected2)
            finishDetection(w, h, corners2, ids2, rejected2)
        } catch (e: Exception) {
            Log.e(TAG, "detectOnGrayMat error: ${e.message}", e)
            mapOf("detected" to false, "error" to (e.message ?: "UNKNOWN"))
        } finally {
            enhanced?.release()
        }
    }

    private fun finishDetection(
        width: Int,
        height: Int,
        corners: ArrayList<Mat>,
        ids: Mat,
        rejected: ArrayList<Mat>,
    ): Map<String, Any> {
        try {
            frameCount++
            if (ids.total() < 1 || corners.isEmpty()) {
                if (frameCount % 30 == 0) {
                    Log.d(TAG, "no marker (rejected=${rejected.size}) frame=$frameCount")
                }
                return mapOf(
                    "detected" to false,
                    "rejectedCount" to rejected.size,
                )
            }

            var bestIdx = 0
            for (i in 0 until ids.rows()) {
                val id = ids.get(i, 0)[0].toInt()
                if (id == 0) {
                    bestIdx = i
                    break
                }
            }

            val markerId = ids.get(bestIdx, 0)[0].toInt()
            if (markerId !in 0..MAX_MARKER_ID) {
                return mapOf("detected" to false, "error" to "WRONG_MARKER_ID", "markerId" to markerId)
            }

            val pts = readCorners(corners[bestIdx])
                ?: return mapOf("detected" to false, "error" to "BAD_CORNERS")

            for (p in pts) {
                if (p.first < -2 || p.second < -2 || p.first > width + 2 || p.second > height + 2) {
                    return mapOf("detected" to false, "error" to "PARTIAL_MARKER")
                }
            }

            val (tl, tr, br, bl) = pts
            val topEdge = hypot(tr.first - tl.first, tr.second - tl.second)
            val bottomEdge = hypot(br.first - bl.first, br.second - bl.second)
            val leftEdge = hypot(bl.first - tl.first, bl.second - tl.second)
            val rightEdge = hypot(br.first - tr.first, br.second - tr.second)
            val markerW = (topEdge + bottomEdge) / 2.0
            val markerH = (leftEdge + rightEdge) / 2.0

            if (markerW < MIN_MARKER_PX || markerH < MIN_MARKER_PX) {
                return mapOf("detected" to false, "error" to "MARKER_TOO_SMALL", "markerWidthPixels" to markerW)
            }

            val cx = (tl.first + tr.first + br.first + bl.first) / 4.0
            val cy = (tl.second + tr.second + br.second + bl.second) / 4.0
            val rotation = Math.toDegrees(atan2(tr.second - tl.second, tr.first - tl.first))
            // ─── Spec Step A: Ratio_px/cm = H_marker_px / L_real ───────────────────────
            // Use vertical (left+right edge average) height, NOT horizontal width.
            val ratioPxPerCm = markerH / MARKER_CM        // px per cm
            val cmPerPixel   = MARKER_CM / markerH        // cm per px (for downstream TS code)

            val aspect = if (markerW > 0) markerH / markerW else 0.0
            val angleScore = (1.0 - abs(1.0 - aspect)).coerceIn(0.0, 1.0)
            val sizeScore = (markerW / 160.0).coerceIn(0.0, 1.0)
            val acceptScore =
                if (corners.size + rejected.size > 0) {
                    corners.size.toDouble() / (corners.size + rejected.size).coerceAtLeast(1)
                } else {
                    1.0
                }
            val confidence = (acceptScore * 0.35 + sizeScore * 0.4 + angleScore * 0.25) * 100.0

            Log.i(TAG, "detected id=$markerId w=${"%.1f".format(markerW)} conf=${"%.0f".format(confidence)}")

            return mapOf(
                "detected" to true,
                "markerId" to markerId,
                "centerX" to cx,
                "centerY" to cy,
                "markerWidthPixels" to markerW,
                "markerHeightPixels" to markerH,
                "rotationAngle" to rotation,
                "cmPerPixel" to cmPerPixel,
                "ratioPxPerCm" to ratioPxPerCm,
                "confidence" to confidence,
                "dictionary" to "DICT_ARUCO_MIP_36h12",
                "corners" to listOf(
                    mapOf("x" to tl.first, "y" to tl.second),
                    mapOf("x" to tr.first, "y" to tr.second),
                    mapOf("x" to br.first, "y" to br.second),
                    mapOf("x" to bl.first, "y" to bl.second),
                ),
            )
        } finally {
            ids.release()
            corners.forEach { it.release() }
            rejected.forEach { it.release() }
        }
    }

    /** Convert camera Y plane → grayscale Mat, handling row/pixel stride. */
    private fun imageYPlaneToGray(image: Image): Mat {
        val width = image.width
        val height = image.height
        val plane = image.planes[0]
        val buffer: ByteBuffer = plane.buffer.duplicate()
        val rowStride = plane.rowStride
        val pixelStride = plane.pixelStride

        val gray = Mat(height, width, CvType.CV_8UC1)
        val row = ByteArray(width)

        if (pixelStride == 1 && rowStride == width) {
            val data = ByteArray(width * height)
            buffer.rewind()
            val toRead = minOf(data.size, buffer.remaining())
            buffer.get(data, 0, toRead)
            gray.put(0, 0, data)
            return gray
        }

        // General path: copy Y samples one row at a time
        val rowBuf = ByteArray(rowStride)
        for (y in 0 until height) {
            buffer.position(y * rowStride)
            val toRead = minOf(rowStride, buffer.remaining())
            if (toRead <= 0) break
            buffer.get(rowBuf, 0, toRead)
            if (pixelStride == 1) {
                System.arraycopy(rowBuf, 0, row, 0, width)
            } else {
                var sx = 0
                for (x in 0 until width) {
                    row[x] = rowBuf[sx]
                    sx += pixelStride
                }
            }
            gray.put(y, 0, row)
        }
        return gray
    }

    private fun readCorners(cornerMat: Mat): List<Pair<Double, Double>>? {
        if (cornerMat.empty()) return null
        val points = ArrayList<Pair<Double, Double>>(4)
        val rows = cornerMat.rows()
        val cols = cornerMat.cols()
        when {
            rows >= 4 -> {
                for (i in 0 until 4) {
                    val v = cornerMat.get(i, 0) ?: return null
                    points.add(v[0] to v[1])
                }
            }
            cols >= 4 -> {
                for (i in 0 until 4) {
                    val v = cornerMat.get(0, i) ?: return null
                    points.add(v[0] to v[1])
                }
            }
            else -> return null
        }
        return points
    }
}

class ArucoModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "ArucoModule"

    override fun initialize() {
        super.initialize()
        ArucoDetectorEngine.ensureReady()
    }

    @ReactMethod
    fun isOpenCVReady(promise: Promise) {
        promise.resolve(ArucoDetectorEngine.ensureReady())
    }

    @ReactMethod
    fun getDictionaryName(promise: Promise) {
        promise.resolve("ARUCO_MIP_36h12")
    }
}

class ArucoFrameProcessorPlugin(
    @Suppress("UNUSED_PARAMETER") proxy: VisionCameraProxy,
    @Suppress("UNUSED_PARAMETER") options: Map<String, Any>?,
) : FrameProcessorPlugin() {

    init {
        // Init OpenCV on plugin construction (camera pipeline), not via RN module lookup
        ArucoDetectorEngine.ensureReady()
    }

    override fun callback(frame: Frame, arguments: Map<String, Any>?): Any {
        return ArucoDetectorEngine.detect(frame)
    }
}
