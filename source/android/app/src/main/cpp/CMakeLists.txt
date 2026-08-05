# React Native New Architecture requires appmodules + OnLoad.
# Custom aruco_jni lives in a subdirectory so *.cpp here does not
# replace the default OnLoad.cpp from React Native.
cmake_minimum_required(VERSION 3.13)

project(appmodules)

include(${REACT_ANDROID_DIR}/cmake-utils/ReactNative-application.cmake)

add_subdirectory(aruco)
