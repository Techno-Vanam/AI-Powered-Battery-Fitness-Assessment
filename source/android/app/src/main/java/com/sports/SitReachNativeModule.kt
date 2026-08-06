package com.sports

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class SitReachNativeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "SitReachNative"

  @ReactMethod
  fun isModelAvailable(promise: Promise) {
    try {
      val am = reactApplicationContext.assets
      val modelFile = "models/movenet_singlepose_lightning.tflite"
      val fd = am.openFd(modelFile)
      fd.close()
      promise.resolve(true)
    } catch (e: Exception) {
      promise.resolve(false)
    }
  }
}
