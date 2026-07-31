cmake_minimum_required(VERSION 3.22.1)
project(aruco_jni)

# OpenCV SDK path — set via local.properties or env var OPENCV_ANDROID_SDK
# Fallback: bundled AAR exposes headers via the :opencv gradle module.
# For header-only access during CMake, point to the unpacked SDK if available.
set(OPENCV_SDK_DIR "$ENV{OPENCV_ANDROID_SDK}")

if(EXISTS "${OPENCV_SDK_DIR}/sdk/native/jni/include")
    include_directories("${OPENCV_SDK_DIR}/sdk/native/jni/include")
    add_library(opencv_java4 SHARED IMPORTED)
    set_target_properties(opencv_java4 PROPERTIES
        IMPORTED_LOCATION "${OPENCV_SDK_DIR}/sdk/native/libs/${ANDROID_ABI}/libopencv_java4.so")
    set(OPENCV_LIBS opencv_java4)
else()
    # Headers bundled with the AAR are extracted by Gradle into the build intermediates.
    # The include path below is resolved at Gradle sync time.
    file(GLOB_RECURSE OPENCV_INCLUDE_SEARCH
        "${CMAKE_SOURCE_DIR}/../../../../../build/intermediates/exploded-aar/*/jni/include")
    list(GET OPENCV_INCLUDE_SEARCH 0 OPENCV_INCLUDE_DIR)
    if(EXISTS "${OPENCV_INCLUDE_DIR}")
        include_directories("${OPENCV_INCLUDE_DIR}")
    endif()
    set(OPENCV_LIBS)
endif()

add_library(aruco_jni SHARED aruco_jni.cpp)

find_library(log-lib log)
find_library(jnigraphics-lib jnigraphics)

target_link_libraries(aruco_jni
    ${OPENCV_LIBS}
    ${log-lib}
    ${jnigraphics-lib})
