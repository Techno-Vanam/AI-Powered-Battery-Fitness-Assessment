package com.sports.pose

import android.graphics.Bitmap
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.core.Delegate
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarker
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarkerOptions
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarkerResult
import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
import com.mrousavy.camera.frameprocessors.VisionCameraProxy
import java.nio.ByteBuffer
import java.util.concurrent.atomic.AtomicLong

private const val TAG = "PoseModule"
private const val MODEL_ASSET = "pose_landmarker_full.task"
private const val NUM_POSES = 1
private const val MIN_DETECTION_CONF = 0.5f
private const val MIN_PRESENCE_CONF  = 0.5f
private const val MIN_TRACKING_CONF  = 0.5f

// ─── Shared result holder ─────────────────────────────────────────────────────
// The LIVE_STREAM callback fires on a MediaPipe internal thread.
// The Frame Processor reads the latest result on the camera thread.
// We use @Volatile for safe cross-thread visibility without locking.
private object PoseResultHolder {
    @Volatile var latestResult: Map<String, Any> = mapOf("detected" to false, "status" to "INITIALIZING")
    @Volatile var latestTimestampMs: Long = 0L
}

class PoseModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var landmarker: PoseLandmarker? = null
    private val frameTimestamp = AtomicLong(0L)

    override fun getName() = "PoseModule"

    override fun initialize() {
        super.initialize()
        initLandmarker()
    }

    private fun initLandmarker() {
        try {
            val baseOptions = BaseOptions.builder()
                .setModelAssetPath(MODEL_ASSET)
                .setDelegate(Delegate.GPU)          // GPU first; falls back to CPU automatically
                .build()

            val options = PoseLandmarkerOptions.builder()
                .setBaseOptions(baseOptions)
                .setRunningMode(RunningMode.LIVE_STREAM)
                .setNumPoses(NUM_POSES)
                .setMinPoseDetectionConfidence(MIN_DETECTION_CONF)
                .setMinPosePresenceConfidence(MIN_PRESENCE_CONF)
                .setMinTrackingConfidence(MIN_TRACKING_CONF)
                .setResultListener { result, _ -> onPoseResult(result) }
                .setErrorListener { error -> Log.e(TAG, "MediaPipe error: ${error.message}") }
                .build()

            landmarker = PoseLandmarker.createFromOptions(reactContext, options)
            Log.d(TAG, "PoseLandmarker initialized (LIVE_STREAM, GPU delegate)")
        } catch (e: Exception) {
            Log.e(TAG, "PoseLandmarker init failed: ${e.message}")
            // Retry with CPU delegate
            try {
                val baseOptions = BaseOptions.builder()
                    .setModelAssetPath(MODEL_ASSET)
                    .setDelegate(Delegate.CPU)
                    .build()
                val options = PoseLandmarkerOptions.builder()
                    .setBaseOptions(baseOptions)
                    .setRunningMode(RunningMode.LIVE_STREAM)
                    .setNumPoses(NUM_POSES)
                    .setMinPoseDetectionConfidence(MIN_DETECTION_CONF)
                    .setMinPosePresenceConfidence(MIN_PRESENCE_CONF)
                    .setMinTrackingConfidence(MIN_TRACKING_CONF)
                    .setResultListener { result, _ -> onPoseResult(result) }
                    .setErrorListener { error -> Log.e(TAG, "MediaPipe error: ${error.message}") }
                    .build()
                landmarker = PoseLandmarker.createFromOptions(reactContext, options)
                Log.d(TAG, "PoseLandmarker initialized (LIVE_STREAM, CPU delegate)")
            } catch (e2: Exception) {
                Log.e(TAG, "PoseLandmarker CPU init also failed: ${e2.message}")
            }
        }
    }

    // ─── LIVE_STREAM result callback (MediaPipe internal thread) ─────────────
    private fun onPoseResult(result: PoseLandmarkerResult) {
        if (result.landmarks().isEmpty()) {
            PoseResultHolder.latestResult = mapOf("detected" to false, "status" to "NO_PERSON")
            return
        }

        val landmarks = result.landmarks()[0]
        val worldLandmarks = result.worldLandmarks()
        val worldLmks = if (worldLandmarks.isNotEmpty()) worldLandmarks[0] else null

        val lmList = ArrayList<Map<String, Any>>(landmarks.size)
        var visibleCount = 0
        var visibilitySum = 0.0

        for (i in landmarks.indices) {
            val lm = landmarks[i]
            val vis = lm.visibility().orElse(0f).toDouble()
            val pre = lm.presence().orElse(0f).toDouble()
            val worldZ = worldLmks?.getOrNull(i)?.z()?.toDouble() ?: lm.z().toDouble()

            lmList.add(mapOf(
                "x"          to lm.x().toDouble(),
                "y"          to lm.y().toDouble(),
                "z"          to worldZ,
                "visibility" to vis,
                "presence"   to pre
            ))

            if (vis >= MIN_PRESENCE_CONF) visibleCount++
            visibilitySum += vis
        }

        val overallConfidence = if (landmarks.isNotEmpty())
            (visibilitySum / landmarks.size * 100.0) else 0.0

        PoseResultHolder.latestResult = mapOf(
            "detected"          to true,
            "status"            to "OK",
            "landmarks"         to lmList,
            "visibleCount"      to visibleCount,
            "overallConfidence" to overallConfidence,
            "timestampMs"       to PoseResultHolder.latestTimestampMs,
            "processingTimeMs"  to 0L   // filled by the frame processor
        )
    }

    // ─── Called from PoseFrameProcessorPlugin on the camera thread ───────────
    fun detectInFrame(frame: Frame): Map<String, Any> {
        val lm = landmarker ?: return mapOf("detected" to false, "status" to "NOT_INITIALIZED")

        return try {
            val image = frame.image
            val startMs = System.currentTimeMillis()

            // Build ARGB_8888 Bitmap from YUV_420_888 Y+UV planes
            val bitmap = yuvToBitmap(
                image.planes[0].buffer, image.planes[0].rowStride,
                image.planes[1].buffer, image.planes[1].rowStride, image.planes[1].pixelStride,
                image.planes[2].buffer, image.planes[2].rowStride, image.planes[2].pixelStride,
                image.width, image.height
            )

            val ts = frameTimestamp.incrementAndGet()
            PoseResultHolder.latestTimestampMs = ts

            val mpImage = BitmapImageBuilder(bitmap).build()
            lm.detectAsync(mpImage, ts)

            // Return the most recent completed result immediately (non-blocking)
            val result = PoseResultHolder.latestResult.toMutableMap()
            result["processingTimeMs"] = System.currentTimeMillis() - startMs
            result
        } catch (e: Exception) {
            Log.e(TAG, "detectInFrame error: ${e.message}")
            mapOf("detected" to false, "status" to "FRAME_ERROR", "error" to (e.message ?: "UNKNOWN"))
        }
    }

    // ─── YUV_420_888 → ARGB_8888 Bitmap ─────────────────────────────────────
    private fun yuvToBitmap(
        yBuf: ByteBuffer, yStride: Int,
        uBuf: ByteBuffer, uStride: Int, uPixelStride: Int,
        vBuf: ByteBuffer, vStride: Int, vPixelStride: Int,
        width: Int, height: Int
    ): Bitmap {
        val argb = IntArray(width * height)
        val yArr = ByteArray(yBuf.remaining()).also { yBuf.get(it) }
        val uArr = ByteArray(uBuf.remaining()).also { uBuf.get(it) }
        val vArr = ByteArray(vBuf.remaining()).also { vBuf.get(it) }

        for (row in 0 until height) {
            for (col in 0 until width) {
                val yVal = (yArr[row * yStride + col].toInt() and 0xFF)
                val uvRow = row / 2
                val uvCol = col / 2
                val uIdx = uvRow * uStride + uvCol * uPixelStride
                val vIdx = uvRow * vStride + uvCol * vPixelStride
                val uVal = (uArr[uIdx].toInt() and 0xFF) - 128
                val vVal = (vArr[vIdx].toInt() and 0xFF) - 128

                val r = (yVal + 1.370705f * vVal).toInt().coerceIn(0, 255)
                val g = (yVal - 0.698001f * vVal - 0.337633f * uVal).toInt().coerceIn(0, 255)
                val b = (yVal + 1.732446f * uVal).toInt().coerceIn(0, 255)

                argb[row * width + col] = (0xFF shl 24) or (r shl 16) or (g shl 8) or b
            }
        }

        val bmp = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        bmp.setPixels(argb, 0, width, 0, 0, width, height)
        return bmp
    }

    @ReactMethod
    fun isReady(promise: Promise) {
        promise.resolve(landmarker != null)
    }

    override fun onCatalystInstanceDestroy() {
        landmarker?.close()
        landmarker = null
    }
}

// ─── Vision Camera Frame Processor Plugin ────────────────────────────────────
class PoseFrameProcessorPlugin(
    proxy: VisionCameraProxy,
    options: Map<String, Any>?
) : FrameProcessorPlugin(proxy, options) {

    private val module: PoseModule? by lazy {
        try {
            val ctx = proxy.context as? ReactApplicationContext
            ctx?.getNativeModule(PoseModule::class.java)
        } catch (e: Exception) {
            Log.e(TAG, "Could not get PoseModule: ${e.message}")
            null
        }
    }

    override fun callback(frame: Frame, arguments: Map<String, Any>?): Any {
        return module?.detectInFrame(frame)
            ?: mapOf("detected" to false, "status" to "MODULE_NULL")
    }
}
