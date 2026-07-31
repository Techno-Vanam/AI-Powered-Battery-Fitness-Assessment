package com.sports.aruco

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.Arguments
import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
import com.mrousavy.camera.frameprocessors.VisionCameraProxy
import org.opencv.android.OpenCVLoader
import java.nio.ByteBuffer

private const val TAG = "ArucoModule"

// ─── Result indices (must match aruco_jni.cpp) ───────────────────────────────
private const val IDX_DETECTED   = 0
private const val IDX_MARKER_ID  = 1
private const val IDX_CX         = 2
private const val IDX_CY         = 3
private const val IDX_WIDTH_PX   = 4
private const val IDX_HEIGHT_PX  = 5
private const val IDX_ROTATION   = 6
private const val IDX_CM_PER_PX  = 7
private const val IDX_CONFIDENCE = 8
private const val IDX_TL_X       = 9
private const val IDX_TL_Y       = 10
private const val IDX_TR_X       = 11
private const val IDX_TR_Y       = 12
private const val IDX_BR_X       = 13
private const val IDX_BR_Y       = 14
private const val IDX_BL_X       = 15
private const val IDX_BL_Y       = 16

class ArucoModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var opencvReady = false

    companion object {
        init {
            try {
                System.loadLibrary("aruco_jni")
            } catch (e: UnsatisfiedLinkError) {
                Log.e(TAG, "aruco_jni .so not found: ${e.message}")
            }
        }
    }

    override fun getName() = "ArucoModule"

    override fun initialize() {
        super.initialize()
        opencvReady = OpenCVLoader.initLocal()
        if (!opencvReady) Log.e(TAG, "OpenCV failed to initialize")
    }

    // ─── JNI declaration ─────────────────────────────────────────────────────
    private external fun nativeDetect(
        yPlane: ByteArray,
        width: Int,
        height: Int,
        rowStride: Int
    ): DoubleArray

    // ─── Called from the Vision Camera Frame Processor plugin ─────────────────
    fun detectInFrame(frame: Frame): Map<String, Any> {
        if (!opencvReady) return mapOf("detected" to false, "error" to "OPENCV_NOT_INIT")

        return try {
            val image = frame.image
            val yPlane = image.planes[0]
            val yBuffer: ByteBuffer = yPlane.buffer
            val yBytes = ByteArray(yBuffer.remaining())
            yBuffer.get(yBytes)

            val result = nativeDetect(
                yBytes,
                image.width,
                image.height,
                yPlane.rowStride
            )

            if (result[IDX_DETECTED] != 1.0) {
                mapOf("detected" to false)
            } else {
                mapOf(
                    "detected"           to true,
                    "markerId"           to result[IDX_MARKER_ID].toInt(),
                    "centerX"            to result[IDX_CX],
                    "centerY"            to result[IDX_CY],
                    "markerWidthPixels"  to result[IDX_WIDTH_PX],
                    "markerHeightPixels" to result[IDX_HEIGHT_PX],
                    "rotationAngle"      to result[IDX_ROTATION],
                    "cmPerPixel"         to result[IDX_CM_PER_PX],
                    "confidence"         to result[IDX_CONFIDENCE],
                    "corners"            to listOf(
                        mapOf("x" to result[IDX_TL_X], "y" to result[IDX_TL_Y]),
                        mapOf("x" to result[IDX_TR_X], "y" to result[IDX_TR_Y]),
                        mapOf("x" to result[IDX_BR_X], "y" to result[IDX_BR_Y]),
                        mapOf("x" to result[IDX_BL_X], "y" to result[IDX_BL_Y])
                    )
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "detectInFrame error: ${e.message}")
            mapOf("detected" to false, "error" to (e.message ?: "UNKNOWN"))
        }
    }

    // ─── React method: one-shot detection from JS (for testing) ──────────────
    @ReactMethod
    fun isOpenCVReady(promise: Promise) {
        promise.resolve(opencvReady)
    }
}

// ─── Vision Camera Frame Processor Plugin ────────────────────────────────────
class ArucoFrameProcessorPlugin(
    proxy: VisionCameraProxy,
    options: Map<String, Any>?
) : FrameProcessorPlugin(proxy, options) {

    private val module: ArucoModule? by lazy {
        try {
            val ctx = proxy.context as? ReactApplicationContext
            ctx?.getNativeModule(ArucoModule::class.java)
        } catch (e: Exception) {
            Log.e(TAG, "Could not get ArucoModule: ${e.message}")
            null
        }
    }

    override fun callback(frame: Frame, arguments: Map<String, Any>?): Any {
        return module?.detectInFrame(frame) ?: mapOf("detected" to false, "error" to "MODULE_NULL")
    }
}
