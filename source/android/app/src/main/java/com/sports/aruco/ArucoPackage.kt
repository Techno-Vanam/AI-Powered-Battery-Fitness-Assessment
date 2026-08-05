package com.sports.aruco

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import com.mrousavy.camera.frameprocessors.FrameProcessorPluginRegistry

class ArucoPackage : ReactPackage {

    companion object {
        init {
            FrameProcessorPluginRegistry.addFrameProcessorPlugin("detectAruco") { proxy, options ->
                ArucoFrameProcessorPlugin(proxy, options)
            }
        }
    }

    override fun createNativeModules(ctx: ReactApplicationContext): List<NativeModule> =
        listOf(ArucoModule(ctx))

    override fun createViewManagers(ctx: ReactApplicationContext): List<ViewManager<*, *>> =
        emptyList()
}
