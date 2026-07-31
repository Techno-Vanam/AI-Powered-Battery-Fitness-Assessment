package com.sports.pose

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import com.mrousavy.camera.frameprocessors.FrameProcessorPluginRegistry

class PosePackage : ReactPackage {

    companion object {
        init {
            FrameProcessorPluginRegistry.addFrameProcessorPlugin("detectPose") { proxy, options ->
                PoseFrameProcessorPlugin(proxy, options)
            }
        }
    }

    override fun createNativeModules(ctx: ReactApplicationContext): List<NativeModule> =
        listOf(PoseModule(ctx))

    override fun createViewManagers(ctx: ReactApplicationContext): List<ViewManager<*, *>> =
        emptyList()
}
