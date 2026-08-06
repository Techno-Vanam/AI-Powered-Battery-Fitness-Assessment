package com.margelo.nitro.camera.hybrids.outputs

import android.graphics.Bitmap
import android.graphics.Matrix
import android.util.Log
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.resolutionselector.ResolutionSelector
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.margelo.nitro.camera.CameraOrientation
import com.margelo.nitro.camera.FrameDroppedReason
import com.margelo.nitro.camera.FrameOutputOptions
import com.margelo.nitro.camera.HybridCameraFrameOutputSpec
import com.margelo.nitro.camera.HybridFrameSpec
import com.margelo.nitro.camera.HybridNativeThreadSpec
import com.margelo.nitro.camera.MediaType
import com.margelo.nitro.camera.MirrorMode
import com.margelo.nitro.camera.Size
import com.margelo.nitro.camera.TargetVideoPixelFormat
import com.margelo.nitro.camera.extensions.converters.toSize
import com.margelo.nitro.camera.extensions.orientation
import com.margelo.nitro.camera.extensions.setAllowDroppingLateFrames
import com.margelo.nitro.camera.extensions.sortedByClosestTo
import com.margelo.nitro.camera.extensions.surfaceRotation
import com.margelo.nitro.camera.hybrids.HybridNativeThread
import com.margelo.nitro.camera.hybrids.instances.HybridFrame
import com.margelo.nitro.camera.public.NativeCameraOutput
import com.margelo.nitro.camera.utils.IdentifiableExecutor
import org.tensorflow.lite.Interpreter
import java.nio.ByteBuffer
import java.nio.ByteOrder
import androidx.camera.core.ImageProxy
import com.facebook.react.bridge.WritableMap
// MediaPipe imports
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarker
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarkerResult
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.components.containers.NormalizedLandmark
// App-owned calibration detector (BoofCV lives in com.sports, NOT here)

class HybridFrameOutput(
  private val options: FrameOutputOptions,
) : HybridCameraFrameOutputSpec(),
  NativeCameraOutput {
  private val executor = IdentifiableExecutor("com.margelo.camera.frame")

  override val mediaType: MediaType = MediaType.VIDEO
  override val thread: HybridNativeThreadSpec by lazy { HybridNativeThread(executor) }
  override var outputOrientation: CameraOrientation = CameraOrientation.UP
    set(value) {
      field = value
      imageAnalysis?.targetRotation = value.surfaceRotation
    }
  override val currentResolution: Size?
    get() = imageAnalysis?.resolutionInfo?.resolution?.toSize()
  override var mirrorMode: MirrorMode = MirrorMode.AUTO

  // Pose Estimator fields
  private var interpreter: Interpreter? = null
  private var isModelInitialized = false
  private var isInferenceRunning = false
  private var lastInferenceTime = 0L

  private var modelInputSize = 192
  private var modelInputDataType: org.tensorflow.lite.DataType = org.tensorflow.lite.DataType.UINT8
  private var modelOutputShape = intArrayOf(1, 1, 17, 3)

  // Hand Landmarker fields
  private var handLandmarker: HandLandmarker? = null
  private var isHandModelInitialized = false
  private var lastLogTime = 0L

  private fun initHandModel() {
    if (isHandModelInitialized) return
    try {
      val reactContext = com.margelo.nitro.NitroModules.applicationContext ?: return
      val baseOptions = BaseOptions.builder()
        .setModelAssetPath("models/hand_landmarker.task")
        .build()

      val options = HandLandmarker.HandLandmarkerOptions.builder()
        .setBaseOptions(baseOptions)
        .setRunningMode(RunningMode.IMAGE)
        .setNumHands(1)
        .build()

      handLandmarker = HandLandmarker.createFromOptions(reactContext, options)
      isHandModelInitialized = true
      Log.d("SitReachHand", "MediaPipe HandLandmarker loaded successfully")
    } catch (e: Exception) {
      Log.e("SitReachHand", "Failed to load Hand Landmarker model: ${e.message}", e)
    }
  }

  private fun runHandLandmarkerInference(bitmap: Bitmap): HandLandmarkerResult? {
    initHandModel()
    val landmarker = handLandmarker ?: return null
    return try {
      val mpImage = BitmapImageBuilder(bitmap).build()
      landmarker.detect(mpImage)
    } catch (e: Exception) {
      Log.e("SitReachHand", "MediaPipe inference error: ${e.message}", e)
      null
    }
  }

  private fun createPointMap(x: Float, y: Float, score: Float): WritableMap {
    val pt = Arguments.createMap()
    pt.putDouble("x", x.toDouble())
    pt.putDouble("y", y.toDouble())
    pt.putDouble("score", score.toDouble())
    return pt
  }

  private var imageAnalysis: ImageAnalysis? = null
    set(value) {
      field = value
      updateAnalyzer()
    }
  private var onFrame: ((HybridFrameSpec) -> Boolean)? = null
    set(value) {
      field = value
      updateAnalyzer()
    }

  private fun initModel() {
    if (isModelInitialized) return
    try {
      val reactContext = com.margelo.nitro.NitroModules.applicationContext ?: return
      val modelFile = "models/movenet_singlepose_lightning.tflite"
      val modelStream = reactContext.assets.open(modelFile)
      val modelBytes = modelStream.readBytes()
      modelStream.close()

      val buffer = ByteBuffer.allocateDirect(modelBytes.size).order(ByteOrder.nativeOrder())
      buffer.put(modelBytes)
      buffer.rewind()

      val tflite = Interpreter(buffer)

      val inputTensor = tflite.getInputTensor(0)
      val inputShape = inputTensor.shape()
      val inputDataType = inputTensor.dataType()
      val outputTensor = tflite.getOutputTensor(0)
      val outputShape = outputTensor.shape()
      val outputDataType = outputTensor.dataType()

      Log.d("SitReachPose", "MoveNet loaded")
      Log.d("SitReachPose", "Input shape = ${inputShape.contentToString()}")
      Log.d("SitReachPose", "Input datatype = $inputDataType")
      Log.d("SitReachPose", "Output shape = ${outputShape.contentToString()}")
      Log.d("SitReachPose", "Output datatype = $outputDataType")

      modelInputSize = inputShape[1]
      modelInputDataType = inputDataType
      modelOutputShape = outputShape

      interpreter = tflite
      isModelInitialized = true
    } catch (e: Exception) {
      Log.e("SitReachPose", "Failed to load MoveNet model: ${e.message}", e)
    }
  }

  private data class LandmarkData(val x: Double, val y: Double, val score: Double)

  private fun yuv420ToBitmap(image: ImageProxy): Bitmap {
    val width = image.width
    val height = image.height

    val yPlane = image.planes[0]
    val uPlane = image.planes[1]
    val vPlane = image.planes[2]

    val yBuffer = yPlane.buffer
    val uBuffer = uPlane.buffer
    val vBuffer = vPlane.buffer

    val yRowStride = yPlane.rowStride
    val uRowStride = uPlane.rowStride
    val vRowStride = vPlane.rowStride

    val uPixelStride = uPlane.pixelStride
    val vPixelStride = vPlane.pixelStride

    val argb = IntArray(width * height)

    for (y in 0 until height) {
      val yRow = y * yRowStride
      val uRow = (y / 2) * uRowStride
      val vRow = (y / 2) * vRowStride

      for (x in 0 until width) {
        val yIndex = yRow + x
        val uIndex = uRow + (x / 2) * uPixelStride
        val vIndex = vRow + (x / 2) * vPixelStride

        val yValue = yBuffer.get(yIndex).toInt() and 0xFF
        val uValue = (uBuffer.get(uIndex).toInt() and 0xFF) - 128
        val vValue = (vBuffer.get(vIndex).toInt() and 0xFF) - 128

        var r = (yValue + 1.370705f * vValue).toInt()
        var g = (yValue - 0.337633f * uValue - 0.698001f * vValue).toInt()
        var b = (yValue + 1.732446f * uValue).toInt()

        r = r.coerceIn(0, 255)
        g = g.coerceIn(0, 255)
        b = b.coerceIn(0, 255)

        argb[y * width + x] = (0xFF shl 24) or (r shl 16) or (g shl 8) or b
      }
    }

    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    bitmap.setPixels(argb, 0, width, 0, 0, width, height)

    val rotation = image.imageInfo.rotationDegrees
    if (rotation != 0) {
      val matrix = Matrix()
      matrix.postRotate(rotation.toFloat())
      val rotated = Bitmap.createBitmap(bitmap, 0, 0, width, height, matrix, true)
      if (rotated !== bitmap) {
        bitmap.recycle()
      }
      return rotated
    }
    return bitmap
  }

  private fun runMoveNetInference(bitmap: Bitmap, tflite: Interpreter): List<LandmarkData>? {
    var inputBitmap: Bitmap? = null
    try {
      inputBitmap = Bitmap.createScaledBitmap(bitmap, modelInputSize, modelInputSize, true)

      val numBytesPerChannel = when (modelInputDataType) {
        org.tensorflow.lite.DataType.UINT8, org.tensorflow.lite.DataType.INT8 -> 1
        org.tensorflow.lite.DataType.INT32, org.tensorflow.lite.DataType.FLOAT32 -> 4
        else -> 1
      }

      val buffer = ByteBuffer.allocateDirect(modelInputSize * modelInputSize * 3 * numBytesPerChannel)
        .order(ByteOrder.nativeOrder())

      buffer.rewind()
      for (y in 0 until modelInputSize) {
        for (x in 0 until modelInputSize) {
          val px = inputBitmap.getPixel(x, y)
          val r = (px shr 16) and 0xFF
          val g = (px shr 8) and 0xFF
          val b = px and 0xFF

          when (modelInputDataType) {
            org.tensorflow.lite.DataType.UINT8 -> {
              buffer.put(r.toByte())
              buffer.put(g.toByte())
              buffer.put(b.toByte())
            }
            org.tensorflow.lite.DataType.INT8 -> {
              buffer.put((r - 128).toByte())
              buffer.put((g - 128).toByte())
              buffer.put((b - 128).toByte())
            }
            org.tensorflow.lite.DataType.INT32 -> {
              buffer.putInt(r)
              buffer.putInt(g)
              buffer.putInt(b)
            }
            org.tensorflow.lite.DataType.FLOAT32 -> {
              buffer.putFloat((r / 127.5f) - 1.0f)
              buffer.putFloat((g / 127.5f) - 1.0f)
              buffer.putFloat((b / 127.5f) - 1.0f)
            }
            else -> {
              buffer.put(r.toByte())
              buffer.put(g.toByte())
              buffer.put(b.toByte())
            }
          }
        }
      }
      buffer.rewind()

      val rawPoints: Array<FloatArray> = when {
        modelOutputShape.contentEquals(intArrayOf(1, 1, 17, 3)) -> {
          val output = Array(1) { Array(1) { Array(17) { FloatArray(3) } } }
          tflite.run(buffer, output)
          output[0][0]
        }
        modelOutputShape.contentEquals(intArrayOf(1, 17, 3)) -> {
          val output = Array(1) { Array(17) { FloatArray(3) } }
          tflite.run(buffer, output)
          output[0]
        }
        else -> {
          throw IllegalStateException("Unsupported output shape")
        }
      }

      val landmarks = mutableListOf<LandmarkData>()
      for (i in 0 until 17) {
        val normalizedY = rawPoints[i][0].toDouble()
        val normalizedX = rawPoints[i][1].toDouble()
        val score = rawPoints[i][2].toDouble()
        landmarks.add(LandmarkData(normalizedX, normalizedY, score))
      }

      Log.d("SitReachPose", "Inference completed. Keypoints=17. Valid keypoints=${landmarks.count { it.score >= 0.35 }}")
      return landmarks
    } catch (e: Exception) {
      Log.e("SitReachPose", "Error during MoveNet inference: ${e.message}", e)
      return null
    } finally {
      if (inputBitmap != null && inputBitmap !== bitmap && !inputBitmap.isRecycled) {
        inputBitmap.recycle()
      }
    }
  }

  override fun createUseCase(
    mirrorMode: MirrorMode,
    config: NativeCameraOutput.Config,
  ): NativeCameraOutput.PreparedUseCase {
    val resolutionSelector =
      ResolutionSelector
        .Builder()
        .setResolutionFilter { sizes, _ ->
          val targetSize = options.targetResolution.toSize()
          return@setResolutionFilter sizes.sortedByClosestTo(targetSize)
        }.build()

    val imageAnalysis =
      ImageAnalysis
        .Builder()
        .apply {
          setResolutionSelector(resolutionSelector)
          setAllowDroppingLateFrames(options.dropFramesWhileBusy)
          setBackgroundExecutor(executor)
          setTargetRotation(outputOrientation.surfaceRotation)
          setOutputImageRotationEnabled(options.enablePhysicalBufferRotation)

          when (options.pixelFormat) {
            TargetVideoPixelFormat.YUV -> {
              setOutputImageFormat(ImageAnalysis.OUTPUT_IMAGE_FORMAT_YUV_420_888)
            }
            TargetVideoPixelFormat.RGB -> {
              setOutputImageFormat(ImageAnalysis.OUTPUT_IMAGE_FORMAT_RGBA_8888)
            }
            TargetVideoPixelFormat.NATIVE -> {
              if (options.enablePhysicalBufferRotation) {
                throw Error(
                  "Cannot enable physical buffer rotation when `enableGpuBuffers` is set to true! " +
                    "Set `enablePhysicalBufferRotation={false}` to use GPU buffers, or disable GPU buffers if physical buffer rotation is necessary.",
                )
              }
              setOutputImageFormat(ImageAnalysis.OUTPUT_IMAGE_FORMAT_PRIVATE)
            }
          }
        }.build()

    return NativeCameraOutput.PreparedUseCase(imageAnalysis) {
      this.imageAnalysis = imageAnalysis
      this.mirrorMode = mirrorMode
    }
  }

  private fun updateAnalyzer() {
    val imageAnalysis = imageAnalysis ?: return

    // Always set analyzer so native MoveNet pose detection runs
    imageAnalysis.setAnalyzer(executor) { image ->
      var bitmap: Bitmap? = null
      try {
        val currentTime = System.currentTimeMillis()
        if (!isInferenceRunning && (currentTime - lastInferenceTime >= 70)) {
          isInferenceRunning = true
          lastInferenceTime = currentTime
          initModel()

          val tflite = interpreter
          if (tflite != null) {
            bitmap = yuv420ToBitmap(image)

            val landmarks = runMoveNetInference(bitmap, tflite)
            val handResult = runHandLandmarkerInference(bitmap)

            if (landmarks != null) {
              val reactContext = com.margelo.nitro.NitroModules.applicationContext
              if (reactContext != null) {
                val eventMap = Arguments.createMap()
                val arr = Arguments.createArray()
                for (lm in landmarks) {
                  val pt = Arguments.createMap()
                  pt.putDouble("x", lm.x)
                  pt.putDouble("y", lm.y)
                  pt.putDouble("score", lm.score)
                  arr.pushMap(pt)
                }
                eventMap.putArray("landmarks", arr)
                eventMap.putInt("sourceWidth", bitmap.width)
                eventMap.putInt("sourceHeight", bitmap.height)

                // Process hand landmark detection
                var handDetected = false
                val allFingertips = Arguments.createArray()

                if (handResult != null && handResult.landmarks().isNotEmpty()) {
                  handDetected = true
                  val handScore = try {
                    handResult.handednesses().firstOrNull()?.firstOrNull()?.score() ?: 1.0f
                  } catch (e: Exception) {
                    1.0f
                  }

                  val handPoints = handResult.landmarks()[0]
                  val thumb = handPoints.getOrNull(4)
                  val index = handPoints.getOrNull(8)
                  val middle = handPoints.getOrNull(12)
                  val ring = handPoints.getOrNull(16)
                  val pinky = handPoints.getOrNull(20)



val tips = listOfNotNull<NormalizedLandmark>(
    thumb,
    index,
    middle,
    ring,
    pinky
)

// Store all fingertips (debug / visualization)
for (tip in tips) {
    allFingertips.pushMap(
        createPointMap(
            tip.x(),
            tip.y(),
            handScore
        )
    )
}

val thumbMap =
    thumb?.let {
        createPointMap(it.x(), it.y(), handScore)
    } ?: Arguments.createMap()

val indexMap =
    index?.let {
        createPointMap(it.x(), it.y(), handScore)
    } ?: Arguments.createMap()

val middleMap =
    middle?.let {
        createPointMap(it.x(), it.y(), handScore)
    } ?: Arguments.createMap()

val ringMap =
    ring?.let {
        createPointMap(it.x(), it.y(), handScore)
    } ?: Arguments.createMap()

val pinkyMap =
    pinky?.let {
        createPointMap(it.x(), it.y(), handScore)
    } ?: Arguments.createMap()

// Standard Sit & Reach protocol:
// use the MIDDLE fingertip (landmark 12)
// instead of whichever fingertip is furthest forward.

val measurementFinger = middle

val measurementFingerMap =
    measurementFinger?.let {
        createPointMap(
            it.x(),
            it.y(),
            handScore
        )
    } ?: Arguments.createMap()

eventMap.putMap("thumbFingertip", thumbMap)
eventMap.putMap("indexFingertip", indexMap)
eventMap.putMap("middleFingertip", middleMap)
eventMap.putMap("ringFingertip", ringMap)
eventMap.putMap("pinkyFingertip", pinkyMap)

// Keep existing React API unchanged.
eventMap.putMap("forwardMostFingertip", measurementFingerMap)

if (currentTime - lastLogTime >= 1000) {

    lastLogTime = currentTime

    Log.d(
        "SitReachHand",
        "[SitReachHand] Hand detected"
    )

    if (measurementFinger != null) {

        Log.d(
            "SitReachHand",
            "[SitReachHand] Middle fingertip x=${measurementFinger.x()} y=${measurementFinger.y()} score=$handScore"
        )
    }
}
                // ── REFERENCE MARKER CALIBRATION ──────────────────────────────
                // Delegated entirely to app-owned MarkerCalibrationDetector via reflection.
                // BoofCV dependency lives in android/app/build.gradle, NOT here.
                val calibMap = Arguments.createMap()
                try {
                  val detectorClass = Class.forName("com.sports.MarkerCalibrationDetector")
                  val processMethod = detectorClass.getMethod("processAndPopulate", Bitmap::class.java, WritableMap::class.java)
                  processMethod.invoke(null, bitmap, calibMap)
                } catch (e: Exception) {
                  Log.e("SitReachPose", "Failed to delegate to MarkerCalibrationDetector: ${e.message}", e)
                }

                eventMap.putBoolean("handDetected", handDetected)
                if (handDetected) {
                  eventMap.putArray("allFingertips", allFingertips)
                }

                eventMap.putMap("calibration", calibMap)

                reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                  ?.emit("SitReachPoseDetected", eventMap)
              }
            }
          }
          isInferenceRunning = false
        }
      } catch (e: Exception) {
        Log.e("SitReachPose", "Inference error: ${e.message}", e)
        isInferenceRunning = false
      } finally {
        if (bitmap != null && !bitmap.isRecycled) {
          bitmap.recycle()
        }
      }

      val onFrame = onFrame
      if (onFrame != null) {
        val orientation = image.orientation
        val isMirrored = mirrorMode == MirrorMode.ON
        val frame = HybridFrame(image, orientation, isMirrored)
        onFrame(frame)
      } else {
        image.close()
      }
    }
  }

  override fun setOnFrameCallback(onFrame: ((HybridFrameSpec) -> Boolean)?) {
    require(executor.isRunningOnExecutor) { "setOnFrameCallback(...) must be called on the DepthFrameOutput's `thread`!" }
    this.onFrame = onFrame
  }

  override fun setOnFrameDroppedCallback(onFrameDropped: ((FrameDroppedReason) -> Unit)?) {
  }

  override fun dispose() {
    super.dispose()
    imageAnalysis?.clearAnalyzer()
    try {
      val detectorClass = Class.forName("com.sports.MarkerCalibrationDetector")
      val resetMethod = detectorClass.getMethod("reset")
      resetMethod.invoke(null)
    } catch (e: Exception) {
      Log.e("SitReachPose", "Failed to reset MarkerCalibrationDetector: ${e.message}", e)
    }
    try {
      interpreter?.close()
      interpreter = null
      isModelInitialized = false
    } catch (e: Exception) {
      Log.e("SitReachPose", "Error closing interpreter: ${e.message}", e)
    }
    try {
      handLandmarker?.close()
      handLandmarker = null
      isHandModelInitialized = false
    } catch (e: Exception) {
      Log.e("SitReachHand", "Error closing hand landmarker: ${e.message}", e)
    }
  }
}
