package com.sports.jump

import android.media.Image
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap

/**
 * Vision Camera JSI Frame Processor Plugin.
 * Processes YUV/RGB buffers strictly in RAM and purges buffers immediately after landmark extraction.
 * No images or videos are ever written to disk.
 */
class JumpFrameProcessorPlugin {

    private val poseDetector = MediaPipePoseDetector()
    private val calibrationDetector = OpenCVCalibrationDetector()

    /**
     * Executes per frame in RAM
     */
    fun processFrame(image: Image): WritableMap {
        val result = Arguments.createMap()

        try {
            // 1. Extract 17 keypoint pose landmarks from RAM buffer
            val poseMap = poseDetector.detectPose(image)
            result.putMap("pose", poseMap)

            // 2. Perform ArUco / A4 paper calibration scan
            val calibrationMap = calibrationDetector.detectCalibration(image)
            result.putMap("calibration", calibrationMap)

            result.putBoolean("success", true)
        } catch (e: Exception) {
            result.putBoolean("success", false)
            result.putString("error", e.localizedMessage)
        } finally {
            // CRITICAL PRIVACY GUARANTEE:
            // Discard and release image frame buffer immediately after extraction.
            image.close()
        }

        return result
    }
}
