package com.sports

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

/**
 * SevenSegmentAnalyzerPackage
 *
 * Registers SevenSegmentAnalyzerModule with React Native's package registry.
 * Added to MainApplication.kt so it is available via NativeModules.SevenSegmentAnalyzer in JS.
 */
class SevenSegmentAnalyzerPackage : ReactPackage {

    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ): List<NativeModule> = listOf(SevenSegmentAnalyzerModule(reactContext))

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> = emptyList()
}
