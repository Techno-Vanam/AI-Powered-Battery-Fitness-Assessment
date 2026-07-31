# OpenCV Android AAR

Place the OpenCV Android AAR here:

    android/opencv/libs/opencv-4.10.0.aar

## Download

1. Go to https://github.com/opencv/opencv/releases/tag/4.10.0
2. Download `opencv-4.10.0-android-sdk.zip`
3. Unzip it.
4. Copy `OpenCV-android-sdk/sdk/OpenCV-android-sdk.aar`
   and rename it to `opencv-4.10.0.aar`, then place it in this folder.

## OpenCV Android SDK (for C++ headers — optional but recommended for full native build)

Set the environment variable before building:

    export OPENCV_ANDROID_SDK=/path/to/OpenCV-android-sdk

This allows CMake to link against `libopencv_java4.so` directly.
If the variable is not set, the build still compiles but ArUco detection
will be disabled at runtime (stub JNI returns `detected: false`).
