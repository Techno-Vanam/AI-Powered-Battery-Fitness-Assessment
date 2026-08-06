package com.sports

import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.Matrix
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.util.Size
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.Observer
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import com.facebook.react.uimanager.events.EventDispatcher
import org.tensorflow.lite.DataType
import org.tensorflow.lite.Interpreter
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean

class NativeCameraViewManager(
    private val reactContext: ReactApplicationContext
) : SimpleViewManager<PreviewView>() {

    companion object {
        private const val TAG = "SitReachCamera"

        /*
         * MoveNet Lightning input size.
         */
        private const val MODEL_SIZE = 192

        /*
         * We intentionally DO NOT run inference on every camera frame.
         *
         * 125 ms = maximum ~8 pose inferences per second.
         *
         * This is enough for live posture feedback while keeping
         * CPU usage under control.
         */
        private const val ANALYSIS_INTERVAL_MS = 125L

        private const val LANDMARK_CONFIDENCE_THRESHOLD = 0.35
    }

    private var cameraProvider: ProcessCameraProvider? = null

    private var preview: Preview? = null

    private var imageAnalysis: ImageAnalysis? = null

    private var cameraExecutor: ExecutorService? = null

    private var interpreter: Interpreter? = null

    @Volatile
    private var activePreviewView: PreviewView? = null

    @Volatile
    private var lastAnalysisTimestamp = 0L

    @Volatile
    private var receivedAnalysisFrames = 0L

    /*
     * Prevent multiple TFLite inference calls from overlapping.
     */
    private val inferenceRunning =
        AtomicBoolean(false)


    // ============================================================
    // REACT NATIVE VIEW NAME
    // ============================================================

    override fun getName(): String =
        "NativeCameraView"


    // ============================================================
    // CREATE CAMERA VIEW
    // ============================================================

    override fun createViewInstance(
        reactContext: ThemedReactContext
    ): PreviewView {

        Log.d(TAG, "================================================")
        Log.d(TAG, "NativeCameraView CREATED")
        Log.d(TAG, "================================================")

        val previewView =
            PreviewView(reactContext).apply {

                setBackgroundColor(Color.BLACK)

                scaleType =
                    PreviewView.ScaleType.FILL_CENTER

                /*
                 * IMPORTANT
                 *
                 * Keep COMPATIBLE.
                 *
                 * This was the configuration that fixed the
                 * React Native black preview issue.
                 */
                implementationMode =
                    PreviewView.ImplementationMode.COMPATIBLE
            }

        activePreviewView =
            previewView

        lastAnalysisTimestamp =
            0L

        receivedAnalysisFrames =
            0L

        inferenceRunning.set(false)

        sendStateEvent(
            previewView,
            "cameraInitializing",
            "Initializing camera..."
        )

        /*
 * React Native/Fabric can create this PreviewView while Android
 * is still completing the portrait -> landscape transition.
 *
 * Do not start CameraX immediately.
 *
 * Wait until:
 *   1. the view is attached
 *   2. the view has a real size
 *   3. the Activity lifecycle is RESUMED
 */
fun waitForCameraReady(attempt: Int = 1) {

    if (activePreviewView !== previewView) {

        Log.w(
            TAG,
            "Camera startup cancelled because PreviewView is inactive"
        )

        return
    }

    val activity =
        reactContext.currentActivity

    val lifecycleOwner =
        activity as? LifecycleOwner

    val attached =
        previewView.isAttachedToWindow

    val laidOut =
        previewView.width > 0 &&
        previewView.height > 0

    val resumed =
        lifecycleOwner
            ?.lifecycle
            ?.currentState
            ?.isAtLeast(
                androidx.lifecycle.Lifecycle.State.RESUMED
            ) == true

    Log.d(
        TAG,
        "Camera readiness attempt=$attempt, " +
            "attached=$attached, " +
            "size=${previewView.width}x${previewView.height}, " +
            "resumed=$resumed"
    )

    if (
        attached &&
        laidOut &&
        resumed
    ) {

        /*
         * Give the landscape PreviewView one additional frame
         * before asking CameraX for its SurfaceProvider.
         */
        previewView.post {

            if (activePreviewView !== previewView) {
                return@post
            }

            Log.d(
                TAG,
                "PreviewView READY. Starting CameraX. " +
                    "size=${previewView.width}x${previewView.height}"
            )

            startCamera(
                previewView,
                reactContext
            )
        }

        return
    }

    if (attempt >= 30) {

        Log.e(
            TAG,
            "PreviewView never became ready for CameraX"
        )

        sendStateEvent(
            previewView,
            "cameraError",
            "Camera view did not become ready"
        )

        return
    }

    previewView.postDelayed(
        {
            waitForCameraReady(
                attempt + 1
            )
        },
        100L
    )
}

/*
 * Start readiness monitoring after React Native has created
 * the native view.
 */
previewView.post {
    waitForCameraReady()
}

        return previewView
    }


    // ============================================================
    // START CAMERA
    // ============================================================

    private fun startCamera(
        previewView: PreviewView,
        context: ThemedReactContext
    ) {

        Log.d(
            TAG,
            "startCamera() called"
        )

        try {

            val cameraProviderFuture =
                ProcessCameraProvider.getInstance(
                    context.applicationContext
                )

            cameraProviderFuture.addListener({

                /*
                 * The user may already have navigated away while
                 * CameraProvider was being obtained.
                 */
                if (
                    activePreviewView !==
                    previewView
                ) {

                    Log.w(
                        TAG,
                        "Ignoring CameraProvider callback because view is inactive"
                    )

                    return@addListener
                }

                try {

                    val provider =
                        cameraProviderFuture.get()

                    cameraProvider =
                        provider

                    Log.d(
                        TAG,
                        "CameraProvider obtained"
                    )


                    // ------------------------------------------------
                    // CLEAN OLD CAMERA BINDINGS
                    // ------------------------------------------------

                    try {

                        provider.unbindAll()

                        Log.d(
                            TAG,
                            "Old CameraX bindings removed"
                        )

                    } catch (e: Exception) {

                        Log.w(
                            TAG,
                            "Initial unbindAll warning",
                            e
                        )
                    }


                    // ------------------------------------------------
                    // PREVIEW
                    // ------------------------------------------------

                    val newPreview =
                        Preview.Builder()
                            .build()

                    preview =
                        newPreview

                   Log.d(
    TAG,
    "Preview SurfaceProvider attached"
)

                    


                    // ------------------------------------------------
                    // IMAGE ANALYSIS
                    // ------------------------------------------------

                    /*
                     * We do NOT need a full 1080p frame for a
                     * 192x192 MoveNet model.
                     *
                     * Requesting a smaller analysis stream greatly
                     * reduces YUV conversion work.
                     */
                    val analyzer =
                        ImageAnalysis.Builder()
                            .setTargetResolution(
                                Size(
                                    640,
                                    480
                                )
                            )
                            .setBackpressureStrategy(
                                ImageAnalysis
                                    .STRATEGY_KEEP_ONLY_LATEST
                            )
                            .build()

                    imageAnalysis =
                        analyzer


                    // ------------------------------------------------
                    // EXECUTOR
                    // ------------------------------------------------

                    cameraExecutor =
                        Executors
                            .newSingleThreadExecutor()


                    // ------------------------------------------------
                    // LOAD MOVENET
                    // ------------------------------------------------

                    interpreter =
                        loadInterpreterSafe(
                            context
                        )

                    if (
                        interpreter ==
                        null
                    ) {

                        Log.e(
                            TAG,
                            "MoveNet interpreter could not be loaded"
                        )

                        /*
                         * Camera preview can still work.
                         *
                         * Tell JS that pose model is unavailable.
                         */
                        sendStateEvent(
                            previewView,
                            "poseModelError",
                            "MoveNet pose model failed to load"
                        )

                    } else {

                        Log.d(
                            TAG,
                            "MoveNet interpreter loaded successfully"
                        )

                        sendStateEvent(
                            previewView,
                            "poseModelReady",
                            "MoveNet pose model ready"
                        )
                    }


                    // ------------------------------------------------
                    // ATTACH ANALYZER
                    // ------------------------------------------------

                    val executor =
                        cameraExecutor

                    if (
                        executor != null
                    ) {

                        analyzer.setAnalyzer(
                            executor
                        ) { image ->

                            analyzeFrame(
                                image,
                                previewView
                            )
                        }
                    }


                    // ------------------------------------------------
                    // CAMERA SELECTOR
                    // ------------------------------------------------

                    val selector =
                        CameraSelector
                            .DEFAULT_BACK_CAMERA


                    // ------------------------------------------------
                    // BIND
                    // ------------------------------------------------

                    bindCamera(
                        previewView,
                        provider,
                        selector,
                        newPreview,
                        analyzer
                    )

                } catch (e: Exception) {

                    Log.e(
                        TAG,
                        "CameraProvider initialization failed",
                        e
                    )

                    sendStateEvent(
                        previewView,
                        "cameraError",
                        "Camera provider error: ${e.message}"
                    )
                }

            }, ContextCompat.getMainExecutor(context))

        } catch (e: Exception) {

            Log.e(
                TAG,
                "startCamera failed",
                e
            )

            sendStateEvent(
                previewView,
                "cameraError",
                "Camera initialization failed: ${e.message}"
            )
        }
    }


    // ============================================================
    // ANALYZE CAMERA FRAME
    // ============================================================

    private fun analyzeFrame(
        image: ImageProxy,
        previewView: PreviewView
    ) {

        /*
         * CRITICAL:
         *
         * Every path must eventually close ImageProxy.
         */

        try {

            if (
                activePreviewView !==
                previewView
            ) {

                return
            }

            receivedAnalysisFrames += 1L

            if (
                receivedAnalysisFrames == 1L ||
                receivedAnalysisFrames % 30L == 0L
            ) {

                Log.d(
                    TAG,
                    "ImageAnalysis frame received: count=$receivedAnalysisFrames, " +
                        "size=${image.width}x${image.height}, " +
                        "rotation=${image.imageInfo.rotationDegrees}"
                )
            }


            // --------------------------------------------------------
            // MODEL AVAILABLE?
            // --------------------------------------------------------

            val currentInterpreter =
                interpreter

            if (
                currentInterpreter ==
                null
            ) {

                return
            }


            // --------------------------------------------------------
            // THROTTLING
            // --------------------------------------------------------

            val now =
                System.currentTimeMillis()

            val elapsed =
                now -
                lastAnalysisTimestamp

            if (
                elapsed <
                ANALYSIS_INTERVAL_MS
            ) {

                return
            }


            // --------------------------------------------------------
            // PREVENT OVERLAPPING INFERENCE
            // --------------------------------------------------------

            if (
                !inferenceRunning.compareAndSet(
                    false,
                    true
                )
            ) {

                return
            }


            lastAnalysisTimestamp =
                now


            try {

                val landmarks =
                    runInferenceOnImage(
                        image,
                        currentInterpreter,
                        previewView
                    )

                dispatchPoseEvent(
                    previewView,
                    landmarks
                )

            } catch (e: Exception) {

                Log.e(
                    TAG,
                    "MoveNet inference failed",
                    e
                )

            } finally {

                inferenceRunning.set(
                    false
                )
            }

        } finally {

            /*
             * ABSOLUTELY REQUIRED.
             *
             * Not closing the image eventually blocks CameraX.
             */
            image.close()
        }
    }


    // ============================================================
    // BIND CAMERA
    // ============================================================

    private fun bindCamera(
        previewView: PreviewView,
        provider: ProcessCameraProvider,
        selector: CameraSelector,
        preview: Preview,
        analyzer: ImageAnalysis,
        attempt: Int = 1
    ) {

        if (
            activePreviewView !==
            previewView
        ) {

            Log.w(
                TAG,
                "bindCamera ignored because view is inactive"
            )

            return
        }


        val themedContext =
            previewView.context
                as? ThemedReactContext


        val activity =
            themedContext
                ?.currentActivity


        val lifecycleOwner =
            activity
                as? LifecycleOwner


        if (
            lifecycleOwner ==
            null
        ) {

            if (
                attempt >
                15
            ) {

                Log.e(
                    TAG,
                    "LifecycleOwner unavailable after retries"
                )

                sendStateEvent(
                    previewView,
                    "cameraError",
                    "Unable to obtain Activity lifecycle"
                )

                return
            }


            Log.d(
                TAG,
                "LifecycleOwner unavailable. Retry $attempt"
            )


            Handler(
                Looper.getMainLooper()
            ).postDelayed({

                if (
                    activePreviewView ===
                    previewView
                ) {

                    bindCamera(
                        previewView,
                        provider,
                        selector,
                        preview,
                        analyzer,
                        attempt + 1
                    )
                }

            }, 150)

            return
        }


        Handler(
            Looper.getMainLooper()
        ).post {

            if (
                activePreviewView !==
                previewView
            ) {

                Log.w(
                    TAG,
                    "View destroyed before final camera bind"
                )

                return@post
            }


            try {

                Log.d(
                    TAG,
                    "PreviewView state before bind: " +
                        "attached=${previewView.isAttachedToWindow}, " +
                        "size=${previewView.width}x${previewView.height}, " +
                        "visibility=${previewView.visibility}, " +
                        "lifecycle=${lifecycleOwner.lifecycle.currentState}"
                )


                /*
                 * IMPORTANT:
                 *
                 * The preview-only version was the last version known
                 * to display correctly on this device. Therefore we
                 * restore that exact startup order:
                 *
                 *   1. bind Preview ONLY
                 *   2. wait until PreviewView reports STREAMING
                 *   3. only then attach ImageAnalysis
                 *
                 * This prevents the analysis pipeline from interfering
                 * with initial PreviewView surface negotiation.
                 */
                provider.unbindAll()

                preview.setSurfaceProvider(
                    previewView.surfaceProvider
                )

                Log.d(
                    TAG,
                    "Binding PREVIEW ONLY first..."
                )


                provider.bindToLifecycle(
                    lifecycleOwner,
                    selector,
                    preview
                )


                Log.d(
                    TAG,
                    "PREVIEW ONLY bound. Waiting for STREAMING..."
                )


                var analysisAttached =
                    false


                val streamObserver =
                    object : Observer<PreviewView.StreamState> {

                        override fun onChanged(
                            state: PreviewView.StreamState
                        ) {

                            if (
                                activePreviewView !==
                                previewView
                            ) {

                                previewView
                                    .previewStreamState
                                    .removeObserver(this)

                                return
                            }


                            Log.d(
                                TAG,
                                "Preview stream state=$state, " +
                                    "size=${previewView.width}x${previewView.height}, " +
                                    "attached=${previewView.isAttachedToWindow}"
                            )


                            if (
                                state ==
                                PreviewView.StreamState.STREAMING
                            ) {

                                /*
                                 * cameraReady now means the user is
                                 * actually receiving preview frames,
                                 * not merely that bindToLifecycle()
                                 * returned without throwing.
                                 */
                                sendStateEvent(
                                    previewView,
                                    "cameraReady",
                                    "Camera preview is streaming"
                                )


                                if (
                                    !analysisAttached
                                ) {

                                    analysisAttached =
                                        true


                                    try {

                                        /*
                                         * Do NOT unbind Preview here.
                                         *
                                         * Add ImageAnalysis to the same
                                         * lifecycle after Preview is known
                                         * to be healthy.
                                         */
                                        provider.bindToLifecycle(
                                            lifecycleOwner,
                                            selector,
                                            analyzer
                                        )


                                        Log.d(
                                            TAG,
                                            "ImageAnalysis attached AFTER preview reached STREAMING"
                                        )

                                    } catch (e: Exception) {

                                        Log.e(
                                            TAG,
                                            "Unable to attach ImageAnalysis after preview streaming",
                                            e
                                        )


                                        sendStateEvent(
                                            previewView,
                                            "cameraError",
                                            "Pose analysis could not start: ${e.message}"
                                        )
                                    }
                                }
                            }
                        }
                    }


                previewView
                    .previewStreamState
                    .observe(
                        lifecycleOwner,
                        streamObserver
                    )


                /*
                 * Log if CameraX bound successfully but PreviewView
                 * never transitions to STREAMING. This is much more
                 * useful than reporting cameraReady immediately.
                 */
                Handler(
                    Looper.getMainLooper()
                ).postDelayed({

                    if (
                        activePreviewView ===
                        previewView &&
                        previewView.previewStreamState.value !=
                        PreviewView.StreamState.STREAMING
                    ) {

                        Log.e(
                            TAG,
                            "Preview did NOT reach STREAMING after 3 seconds. " +
                                "Current state=${previewView.previewStreamState.value}, " +
                                "size=${previewView.width}x${previewView.height}, " +
                                "attached=${previewView.isAttachedToWindow}"
                        )


                        sendStateEvent(
                            previewView,
                            "cameraError",
                            "Camera bound but preview did not start streaming"
                        )
                    }

                }, 3000)


            } catch (e: Exception) {

                Log.e(
                    TAG,
                    "CAMERA BIND FAILED",
                    e
                )


                sendStateEvent(
                    previewView,
                    "cameraError",
                    "Camera bind exception: ${e.message}"
                )
            }
        }
    }

    // ============================================================
    // POSE EVENT
    // ============================================================

    private fun dispatchPoseEvent(
        previewView: PreviewView,
        landmarks: List<LM>
    ) {

        if (
            activePreviewView !==
            previewView
        ) {

            return
        }


        try {

            val map =
                Arguments.createMap()


            val arr: WritableArray =
                Arguments.createArray()


            for (
                lm in landmarks
            ) {

                val point: WritableMap =
                    Arguments.createMap()


                point.putDouble(
                    "x",
                    lm.x
                )


                point.putDouble(
                    "y",
                    lm.y
                )


                point.putDouble(
                    "score",
                    lm.score
                )


                arr.pushMap(
                    point
                )
            }


            map.putArray(
                "landmarks",
                arr
            )


            val visibleCount =
                landmarks.count {

                    it.score >=
                        LANDMARK_CONFIDENCE_THRESHOLD
                }


            map.putInt(
                "visibleCount",
                visibleCount
            )


            /*
             * MoveNet has 17 landmarks.
             *
             * Requiring 5 is intentionally permissive here.
             * JS performs the more meaningful posture validation.
             */
            map.putBoolean(
                "detected",
                visibleCount >= 5
            )


            val themedContext =
                previewView.context
                    as? ThemedReactContext
                    ?: return


            val eventDispatcher:
                EventDispatcher? =
                UIManagerHelper
                    .getEventDispatcher(
                        themedContext
                    )


            if (
                eventDispatcher != null
            ) {

                val surfaceId =
                    UIManagerHelper
                        .getSurfaceId(
                            themedContext
                        )


                eventDispatcher
                    .dispatchEvent(

                        PoseEvent(
                            surfaceId,
                            previewView.id,
                            map
                        )
                    )
            }

        } catch (e: Exception) {

            Log.e(
                TAG,
                "Pose event dispatch failed",
                e
            )
        }
    }


    // ============================================================
    // LANDMARK MODEL
    // ============================================================

    private data class LM(

        val x: Double,

        val y: Double,

        val score: Double
    )


    // ============================================================
    // YUV -> BITMAP
    // ============================================================

    private fun yuv420ToBitmap(
        image: ImageProxy
    ): Bitmap {

        val width =
            image.width

        val height =
            image.height


        val yPlane =
            image.planes[0]

        val uPlane =
            image.planes[1]

        val vPlane =
            image.planes[2]


        val yBuffer =
            yPlane.buffer

        val uBuffer =
            uPlane.buffer

        val vBuffer =
            vPlane.buffer


        val yRowStride =
            yPlane.rowStride

        val uRowStride =
            uPlane.rowStride

        val vRowStride =
            vPlane.rowStride


        val uPixelStride =
            uPlane.pixelStride

        val vPixelStride =
            vPlane.pixelStride


        val argb =
            IntArray(
                width *
                    height
            )


        for (
            y in 0 until height
        ) {

            val yRow =
                y *
                    yRowStride


            val uRow =
                (y / 2) *
                    uRowStride


            val vRow =
                (y / 2) *
                    vRowStride


            for (
                x in 0 until width
            ) {

                val yIndex =
                    yRow +
                        x


                val uIndex =
                    uRow +
                        (x / 2) *
                        uPixelStride


                val vIndex =
                    vRow +
                        (x / 2) *
                        vPixelStride


                val yValue =
                    yBuffer
                        .get(yIndex)
                        .toInt() and
                        0xFF


                val uValue =
                    (
                        uBuffer
                            .get(uIndex)
                            .toInt() and
                            0xFF
                        ) -
                        128


                val vValue =
                    (
                        vBuffer
                            .get(vIndex)
                            .toInt() and
                            0xFF
                        ) -
                        128


                var r =
                    (
                        yValue +
                            1.370705f *
                            vValue
                        ).toInt()


                var g =
                    (
                        yValue -
                            0.337633f *
                            uValue -
                            0.698001f *
                            vValue
                        ).toInt()


                var b =
                    (
                        yValue +
                            1.732446f *
                            uValue
                        ).toInt()


                r =
                    r.coerceIn(
                        0,
                        255
                    )


                g =
                    g.coerceIn(
                        0,
                        255
                    )


                b =
                    b.coerceIn(
                        0,
                        255
                    )


                argb[
                    y *
                        width +
                        x
                ] =
                    (0xFF shl 24) or
                        (r shl 16) or
                        (g shl 8) or
                        b
            }
        }


        val bitmap =
            Bitmap.createBitmap(
                width,
                height,
                Bitmap.Config.ARGB_8888
            )


        bitmap.setPixels(
            argb,
            0,
            width,
            0,
            0,
            width,
            height
        )


        val rotation =
            image
                .imageInfo
                .rotationDegrees


        if (
            rotation != 0
        ) {

            val matrix =
                Matrix()


            matrix.postRotate(
                rotation.toFloat()
            )


            val rotated =
                Bitmap.createBitmap(
                    bitmap,
                    0,
                    0,
                    width,
                    height,
                    matrix,
                    true
                )


            /*
             * If Android created a different bitmap,
             * release the old one.
             */
            if (
                rotated !==
                bitmap
            ) {

                bitmap.recycle()
            }


            return rotated
        }


        return bitmap
    }


    // ============================================================
    // MOVENET INFERENCE
    // ============================================================

    private fun runInferenceOnImage(
        image: ImageProxy,
        interpreter: Interpreter,
        previewView: PreviewView
    ): List<LM> {

        var bitmap: Bitmap? =
            null

        var inputBitmap: Bitmap? =
            null


        try {

            bitmap =
                yuv420ToBitmap(
                    image
                )


            inputBitmap =
                Bitmap.createScaledBitmap(
                    bitmap,
                    MODEL_SIZE,
                    MODEL_SIZE,
                    true
                )


            val inputTensor =
                interpreter
                    .getInputTensor(0)


            val dtype =
                inputTensor
                    .dataType()


            val inputShape =
                inputTensor.shape()


            val outputTensor =
                interpreter.getOutputTensor(0)


            val outputShape =
                outputTensor.shape()


            Log.d(
                TAG,
                "TFLite INPUT shape=${inputShape.contentToString()}, type=$dtype"
            )


            Log.d(
                TAG,
                "TFLite OUTPUT shape=${outputShape.contentToString()}, type=${outputTensor.dataType()}"
            )


            val buffer:
                ByteBuffer =
                when (
                    dtype
                ) {

                    /*
                     * Official MoveNet SinglePose Lightning commonly
                     * uses INT32 RGB input with shape [1,192,192,3].
                     */
                    DataType.INT32 -> {

                        val buf =
                            ByteBuffer
                                .allocateDirect(
                                    4 *
                                        MODEL_SIZE *
                                        MODEL_SIZE *
                                        3
                                )
                                .order(
                                    ByteOrder
                                        .nativeOrder()
                                )


                        for (y in 0 until MODEL_SIZE) {

                            for (x in 0 until MODEL_SIZE) {

                                val px =
                                    inputBitmap.getPixel(x, y)

                                buf.putInt((px shr 16) and 0xFF)
                                buf.putInt((px shr 8) and 0xFF)
                                buf.putInt(px and 0xFF)
                            }
                        }


                        buf.rewind()

                        buf
                    }


                    DataType.FLOAT32 -> {

                        val buf =
                            ByteBuffer
                                .allocateDirect(
                                    4 *
                                        MODEL_SIZE *
                                        MODEL_SIZE *
                                        3
                                )
                                .order(
                                    ByteOrder
                                        .nativeOrder()
                                )


                        for (
                            y in 0 until MODEL_SIZE
                        ) {

                            for (
                                x in 0 until MODEL_SIZE
                            ) {

                                val px =
                                    inputBitmap
                                        .getPixel(
                                            x,
                                            y
                                        )


                                val r =
                                    (
                                        px shr 16
                                        ) and
                                        0xFF


                                val g =
                                    (
                                        px shr 8
                                        ) and
                                        0xFF


                                val b =
                                    px and
                                        0xFF


                                /*
                                 * Preserve the normalization used
                                 * by your existing implementation.
                                 */
                                buf.putFloat(
                                    (
                                        r /
                                            127.5f
                                        ) -
                                        1f
                                )


                                buf.putFloat(
                                    (
                                        g /
                                            127.5f
                                        ) -
                                        1f
                                )


                                buf.putFloat(
                                    (
                                        b /
                                            127.5f
                                        ) -
                                        1f
                                )
                            }
                        }


                        buf.rewind()

                        buf
                    }


                    else -> {

                        val buf =
                            ByteBuffer
                                .allocateDirect(
                                    MODEL_SIZE *
                                        MODEL_SIZE *
                                        3
                                )
                                .order(
                                    ByteOrder
                                        .nativeOrder()
                                )


                        for (
                            y in 0 until MODEL_SIZE
                        ) {

                            for (
                                x in 0 until MODEL_SIZE
                            ) {

                                val px =
                                    inputBitmap
                                        .getPixel(
                                            x,
                                            y
                                        )


                                buf.put(
                                    (
                                        (
                                            px shr 16
                                            ) and
                                            0xFF
                                        ).toByte()
                                )


                                buf.put(
                                    (
                                        (
                                            px shr 8
                                            ) and
                                            0xFF
                                        ).toByte()
                                )


                                buf.put(
                                    (
                                        px and
                                            0xFF
                                        ).toByte()
                                )
                            }
                        }


                        buf.rewind()

                        buf
                    }
                }


            /*
             * MoveNet SinglePose output is normally [1,1,17,3].
             * Some converted variants expose [1,17,3].
             * Support both so the app does not silently stop emitting
             * pose events because of a tensor-shape mismatch.
             */
            val rawPoints: Array<FloatArray> =
                when {

                    outputShape.contentEquals(
                        intArrayOf(1, 1, 17, 3)
                    ) -> {

                        val output =
                            Array(1) {
                                Array(1) {
                                    Array(17) {
                                        FloatArray(3)
                                    }
                                }
                            }

                        interpreter.run(
                            buffer,
                            output
                        )

                        output[0][0]
                    }


                    outputShape.contentEquals(
                        intArrayOf(1, 17, 3)
                    ) -> {

                        val output =
                            Array(1) {
                                Array(17) {
                                    FloatArray(3)
                                }
                            }

                        interpreter.run(
                            buffer,
                            output
                        )

                        output[0]
                    }


                    else -> {

                        throw IllegalStateException(
                            "Unsupported MoveNet output shape: ${outputShape.contentToString()}"
                        )
                    }
                }


            val landmarks =
                mutableListOf<LM>()


            val viewWidth =
                previewView.width
                    .takeIf { it > 0 }
                    ?: bitmap.width


            val viewHeight =
                previewView.height
                    .takeIf { it > 0 }
                    ?: bitmap.height


            /*
             * PreviewView uses FILL_CENTER.
             * Therefore the camera image is uniformly scaled until it
             * fills the view, then equally cropped on the overflowing
             * axis. Apply the same transform to MoveNet coordinates so
             * green dots line up much more closely with the preview.
             */
            val sourceWidth =
                bitmap.width.toFloat()

            val sourceHeight =
                bitmap.height.toFloat()

            val previewScale =
                maxOf(
                    viewWidth.toFloat() / sourceWidth,
                    viewHeight.toFloat() / sourceHeight
                )

            val displayedWidth =
                sourceWidth * previewScale

            val displayedHeight =
                sourceHeight * previewScale

            val cropX =
                (displayedWidth - viewWidth) / 2f

            val cropY =
                (displayedHeight - viewHeight) / 2f


            for (i in 0 until 17) {

                val normalizedY =
                    rawPoints[i][0]

                val normalizedX =
                    rawPoints[i][1]

                val score =
                    rawPoints[i][2]


                val mappedX =
                    normalizedX * displayedWidth - cropX

                val mappedY =
                    normalizedY * displayedHeight - cropY


                landmarks.add(
                    LM(
                        x = mappedX.toDouble(),
                        y = mappedY.toDouble(),
                        score = score.toDouble()
                    )
                )
            }


            Log.d(
                TAG,
                "MoveNet inference OK: landmarks=${landmarks.size}, " +
                    "visible=${landmarks.count { it.score >= LANDMARK_CONFIDENCE_THRESHOLD }}"
            )


            return landmarks

        } finally {

            /*
             * Avoid accumulating large Bitmaps during continuous
             * camera analysis.
             */

            if (
                inputBitmap != null &&
                inputBitmap !== bitmap &&
                !inputBitmap.isRecycled
            ) {

                inputBitmap.recycle()
            }


            if (
                bitmap != null &&
                !bitmap.isRecycled
            ) {

                bitmap.recycle()
            }
        }
    }


    // ============================================================
    // LOAD TFLITE MODEL
    // ============================================================

    private fun loadInterpreterSafe(
        context: ThemedReactContext
    ): Interpreter? {

        return try {

            val modelStream =
                context.assets.open(
                    "models/movenet_singlepose_lightning.tflite"
                )


            val modelBytes =
                modelStream.readBytes()


            modelStream.close()


            Log.d(
                TAG,
                "MoveNet model loaded. Size=${modelBytes.size}"
            )


            val buffer =
                ByteBuffer
                    .allocateDirect(
                        modelBytes.size
                    )
                    .order(
                        ByteOrder
                            .nativeOrder()
                    )


            buffer.put(
                modelBytes
            )


            buffer.rewind()


            val options =
                Interpreter.Options().apply {

                    /*
                     * Keep this conservative initially.
                     *
                     * We can benchmark NNAPI/GPU later once the
                     * complete pipeline is stable.
                     */
                    setNumThreads(4)
                }


            Interpreter(
                buffer,
                options
            )

        } catch (e: Exception) {

            Log.e(
                TAG,
                "MoveNet interpreter load failed",
                e
            )


            null
        }
    }


    // ============================================================
    // CAMERA STATE EVENT
    // ============================================================

    private class CameraStateEvent(
        surfaceId: Int,
        viewTag: Int,
        private val stateName: String,
        private val message: String
    ) : Event<CameraStateEvent>(
        surfaceId,
        viewTag
    ) {

        override fun getEventName():
            String =
            "onCameraState"


        override fun getEventData():
            WritableMap {

            val map =
                Arguments.createMap()


            map.putString(
                "state",
                stateName
            )


            map.putString(
                "message",
                message
            )


            return map
        }


        override fun canCoalesce():
            Boolean =
            false
    }


    // ============================================================
    // POSE EVENT
    // ============================================================

    private class PoseEvent(
        surfaceId: Int,
        viewTag: Int,
        private val eventData: WritableMap
    ) : Event<PoseEvent>(
        surfaceId,
        viewTag
    ) {

        override fun getEventName():
            String =
            "onPose"


        override fun getEventData():
            WritableMap =
            eventData


        override fun canCoalesce():
            Boolean =
            true
    }


    // ============================================================
    // SEND CAMERA STATE EVENT
    // ============================================================

    private fun sendStateEvent(
        previewView: PreviewView,
        stateName: String,
        message: String
    ) {

        if (
            activePreviewView !==
            previewView
        ) {

            return
        }


        try {

            val context =
                previewView.context
                    as? ThemedReactContext
                    ?: return


            val dispatcher =
                UIManagerHelper
                    .getEventDispatcher(
                        context
                    )
                    ?: return


            val surfaceId =
                UIManagerHelper
                    .getSurfaceId(
                        context
                    )


            dispatcher.dispatchEvent(

                CameraStateEvent(
                    surfaceId,
                    previewView.id,
                    stateName,
                    message
                )
            )

        } catch (e: Exception) {

            Log.e(
                TAG,
                "Camera state event failed",
                e
            )
        }
    }


    // ============================================================
    // RELEASE CAMERA
    // ============================================================

    private fun releaseCamera(
        view: PreviewView
    ) {

        Log.d(TAG, "================================================")
        Log.d(TAG, "releaseCamera() CALLED")
        Log.d(TAG, "================================================")


        /*
         * Immediately invalidate this view so asynchronous
         * callbacks cannot restart it.
         */
        if (
            activePreviewView ===
            view
        ) {

            activePreviewView =
                null
        }


        inferenceRunning.set(
            false
        )


        lastAnalysisTimestamp =
            0L

        receivedAnalysisFrames =
            0L


        // --------------------------------------------------------
        // CLEAR ANALYZER
        // --------------------------------------------------------

        try {

            imageAnalysis
                ?.clearAnalyzer()


            Log.d(
                TAG,
                "ImageAnalysis analyzer cleared"
            )

        } catch (e: Exception) {

            Log.e(
                TAG,
                "Unable to clear analyzer",
                e
            )
        }


        // --------------------------------------------------------
        // UNBIND CAMERAX
        // --------------------------------------------------------

        try {

            cameraProvider
                ?.unbindAll()


            Log.d(
                TAG,
                "CameraProvider unbindAll completed"
            )

        } catch (e: Exception) {

            Log.e(
                TAG,
                "Unable to unbind CameraX",
                e
            )
        }


        // --------------------------------------------------------
        // CLEAR SURFACE PROVIDER
        // --------------------------------------------------------

        try {

            preview
                ?.setSurfaceProvider(
                    null
                )


            Log.d(
                TAG,
                "Preview SurfaceProvider cleared"
            )

        } catch (e: Exception) {

            Log.e(
                TAG,
                "Unable to clear preview surface",
                e
            )
        }


        // --------------------------------------------------------
        // STOP EXECUTOR
        // --------------------------------------------------------

        try {

            cameraExecutor
                ?.shutdownNow()


            Log.d(
                TAG,
                "Camera executor shut down"
            )

        } catch (e: Exception) {

            Log.e(
                TAG,
                "Unable to shutdown executor",
                e
            )
        }


        // --------------------------------------------------------
        // CLOSE TFLITE
        // --------------------------------------------------------

        try {

            interpreter
                ?.close()


            Log.d(
                TAG,
                "TFLite interpreter closed"
            )

        } catch (e: Exception) {

            Log.e(
                TAG,
                "Unable to close interpreter",
                e
            )
        }


        imageAnalysis =
            null


        preview =
            null


        cameraExecutor =
            null


        interpreter =
            null


        cameraProvider =
            null


        Log.d(
            TAG,
            "CAMERA RELEASE COMPLETE"
        )
    }


    // ============================================================
    // REACT NATIVE VIEW DESTROYED
    // ============================================================

    override fun onDropViewInstance(
        view: PreviewView
    ) {

        Log.d(
            TAG,
            "onDropViewInstance()"
        )


        releaseCamera(
            view
        )


        super.onDropViewInstance(
            view
        )
    }


    // ============================================================
    // EXPORTED EVENTS
    // ============================================================

    override fun
        getExportedCustomDirectEventTypeConstants():
        MutableMap<String, Any> {

        val map:
            MutableMap<String, Any> =
            HashMap()


        map["onPose"] =
            mapOf(
                "registrationName"
                    to
                    "onPose"
            )


        map["onCameraState"] =
            mapOf(
                "registrationName"
                    to
                    "onCameraState"
            )


        return map
    }
}