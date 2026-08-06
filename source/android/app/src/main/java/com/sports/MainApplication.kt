package com.sports

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.sports.aruco.ArucoPackage
import com.sports.pose.PosePackage
import com.sports.jump.JumpNativePackage
import com.sports.sync.SyncWorker
import com.sports.SevenSegmentAnalyzerPackage

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          add(SevenSegmentAnalyzerPackage())
          add(ArucoPackage())
          add(PosePackage())
          add(JumpNativePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
    SyncWorker.schedule(this)
  }
}
