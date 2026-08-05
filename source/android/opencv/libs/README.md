# OpenCV Android

This module pulls OpenCV from Maven Central:

```gradle
api 'org.opencv:opencv:4.10.0'
```

No local `opencv-4.10.0.aar` is required for the Gradle build.

## Optional: native C++ SDK (ArUco headers)

For full native ArUco CMake linking, download the Android SDK and set:

```powershell
$env:OPENCV_ANDROID_SDK="C:\path\to\OpenCV-android-sdk"
```

If unset, the app still builds; ArUco JNI falls back to a stub when headers/libs are missing.
