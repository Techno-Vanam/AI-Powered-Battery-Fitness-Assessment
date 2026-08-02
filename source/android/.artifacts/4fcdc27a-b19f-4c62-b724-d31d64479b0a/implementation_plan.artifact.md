# Fix CMake NDK Toolchain Issue

The project is encountering a CMake error during Gradle sync because it's attempting to use NDK version `27.0.12077973`, which appears to be corrupted or incorrectly installed on the system (the toolchain file is missing). Although the main application is configured to use NDK `27.1.12297006`, some subprojects (like `op-sqlite`) may be falling back to the AGP default or using a stale cache.

## User Review Required

> [!IMPORTANT]
> The NDK installation at `C:\Users\moham\AppData\Local\Android\Sdk\ndk\27.0.12077973` seems corrupted. While this plan fixes the project configuration to avoid using it, you may want to eventually uninstall and reinstall that NDK version through the Android Studio SDK Manager if you need it for other projects.

## Proposed Changes

### Build Configuration

#### [MODIFY] [build.gradle](file:///C:/Users/moham/AI-Powered-Battery-Fitness-Assessment/source/android/build.gradle)
- Add a `subprojects` block to ensure all modules (including those in `node_modules`) use the NDK version specified in the root project's `ext`.

### Cache Cleanup

- Delete all `.cxx` and `build` directories to clear stale CMake and Gradle caches.

## Verification Plan

### Automated Tests
- Run `./gradlew :prepareKotlinBuildScriptModel` to verify that the sync error is resolved.
- Run a full build of the app: `./gradlew :app:assembleDebug`.

### Manual Verification
- Verify that the Gradle sync finishes successfully in Android Studio.
