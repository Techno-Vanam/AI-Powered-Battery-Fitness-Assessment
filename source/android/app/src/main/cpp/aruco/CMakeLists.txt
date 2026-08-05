# OpenCV SDK path — set via env var OPENCV_ANDROID_SDK
set(OPENCV_SDK_DIR "$ENV{OPENCV_ANDROID_SDK}")
set(OPENCV_LIBS "")

if(EXISTS "${OPENCV_SDK_DIR}/sdk/native/jni/include")
    include_directories("${OPENCV_SDK_DIR}/sdk/native/jni/include")
    add_library(opencv_java4 SHARED IMPORTED)
    set_target_properties(opencv_java4 PROPERTIES
        IMPORTED_LOCATION "${OPENCV_SDK_DIR}/sdk/native/libs/${ANDROID_ABI}/libopencv_java4.so")
    set(OPENCV_LIBS opencv_java4)
else()
    # Optional: use exploded AAR headers if Gradle already unpacked them.
    # If none found, build stub JNI (ArUco returns detected=false at runtime).
    file(GLOB_RECURSE OPENCV_INCLUDE_SEARCH
        "${CMAKE_SOURCE_DIR}/../../../../../build/intermediates/**/jni/include")
    list(LENGTH OPENCV_INCLUDE_SEARCH _opencv_include_count)
    if(_opencv_include_count GREATER 0)
        list(GET OPENCV_INCLUDE_SEARCH 0 OPENCV_INCLUDE_DIR)
        if(EXISTS "${OPENCV_INCLUDE_DIR}")
            include_directories("${OPENCV_INCLUDE_DIR}")
        endif()
    else()
        message(STATUS "OpenCV headers not found — building aruco_jni stub")
    endif()
endif()

add_library(aruco_jni SHARED aruco_jni.cpp)

find_library(log-lib log)
find_library(jnigraphics-lib jnigraphics)

target_link_libraries(aruco_jni
    ${OPENCV_LIBS}
    ${log-lib}
    ${jnigraphics-lib})
