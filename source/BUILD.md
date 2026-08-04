# Build Instructions

Steps to reproduce the submitted release APK from source.

## Environment

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | v24.11.1 | Node >= 22.11.0 required |
| Android SDK | API 35 (Android 15) | SDK location: `Android/Sdk` |
| Gradle | 9.3.1 | Project Gradle wrapper |
| JDK | 21.0.7 | Oracle JDK 21 |
| NDK | 27.1.12297006 | CMake / C++ native build |

## Environment Variables

```powershell
$env:JAVA_HOME="C:\Program Files\Java\jdk-21"
$env:ANDROID_HOME="C:\Users\ASHWATHKRISHNAA_PV\AppData\Local\Android\Sdk"
```

## Build Steps

```bash
# 1. Install dependencies
cd source
npm install

# 2. Android release build command
cd android
.\gradlew.bat assembleRelease

# 3. Output APK location
# source/android/app/build/outputs/apk/release/app-release.apk
# Copy APK to ../app/ for submission:
Copy-Item "app/build/outputs/apk/release/app-release.apk" "../../app/BatteryFitnessAssessment_v1.0.apk"
```

## Expected Build Time

- Fresh build (with CMake/Ninja native compilation): ~25–30 minutes
- Incremental build: ~2–5 minutes

## Verify Build

- [x] APK installs on Android 10+ device
- [x] Version matches submitted APK filename (`BatteryFitnessAssessment_v1.0.apk`)
- [x] Release build (78.48 MB, optimized React Native bundle)

