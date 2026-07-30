# Build Instructions

Steps to reproduce the submitted release APK from source.

## Environment

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | >= 22.11.0 | |
| Android SDK | _[To be filled]_ | |
| Gradle | _[From project wrapper]_ | |
| JDK | _[To be filled]_ | |
| NDK | _[If used]_ | |

## Environment Variables

```bash
# [List required ANDROID_HOME, JAVA_HOME, etc.]
```

## Build Steps

```bash
# 1. Install dependencies
cd app
npm install

# 2. [Android release build commands — to be completed]
cd android
./gradlew assembleRelease

# 3. Output APK location
# app/android/app/build/outputs/apk/release/
```

## Expected Build Time

_[To be filled — e.g. ~5–10 minutes on standard hardware]_

## Verify Build

- [ ] APK installs on Android 10+ device
- [ ] Version matches submitted APK filename
- [ ] Release build (not debug)
