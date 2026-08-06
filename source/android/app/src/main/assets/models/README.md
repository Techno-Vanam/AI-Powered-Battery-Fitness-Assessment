Place your on-device pose model here as `pose_landmarker.tflite`.

Recommended:
- Use a MediaPipe / TensorFlow Lite pose landmarker model compatible with Android.
- Put the `.tflite` file at `android/app/src/main/assets/models/pose_landmarker.tflite`.

The native scaffold added a module `SitReachNative.isModelAvailable()` to detect this file.

IMPORTANT: After adding the model, you'll need to implement inference in `SitReachFrameProcessorPlugin.kt`.
