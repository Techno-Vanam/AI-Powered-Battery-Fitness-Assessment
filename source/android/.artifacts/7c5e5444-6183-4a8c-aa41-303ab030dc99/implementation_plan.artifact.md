# Implementation Plan - Fix CMake Sync Error

The project is encountering a `CMake Error` during Gradle sync. This error is triggered when CMake attempts to run `./gradlew :prepareKotlinBuildScriptModel` but fails. Research has revealed that the `gradlew` shell script was empty (0 bytes), which caused the command to fail immediately. Additionally, there are mismatches in Android Gradle Plugin (AGP) and Kotlin versions across the project, which may be contributing to sync instabilities.

## User Review Required

> [!IMPORTANT]
> The `gradlew` shell script was found to be empty. This script is essential for the IDE's CMake integration to function correctly. I have restored it to its standard content.

> [!NOTE]
> I have identified a recurring error: `Failed to create service 'AndroidLocationsBuildService'`. This often happens on Windows if there's a conflict with the `.android` directory or a mismatch in Java versions. While the fixes below address the CMake error, you should ensure you are using the **JetBrains Runtime (JDK)** within Android Studio for the best compatibility.

## Proposed Changes

### Build Configuration

#### [MODIFY] [build.gradle](file:///C:/Users/moham/AI-Powered-Battery-Fitness-Assessment/source/android/build.gradle)
- Explicitly define the version for `kotlin-gradle-plugin` to match `kotlinVersion`.
- Ensure a consistent `compileSdkVersion` (changed from 36 to 35 for better stability).
- Maintain the `subprojects` block to enforce a single NDK version across all modules (including autolinked libraries).

#### [MODIFY] [gradlew](file:///C:/Users/moham/AI-Powered-Battery-Fitness-Assessment/source/android/gradlew)
- [ALREADY DONE] Restored the shell script from a standard template to ensure CMake can execute it.

### Cache Management
- Delete `.gradle`, `app/build`, and `.cxx` directories to clear stale artifacts and lock files.

## Verification Plan

### Automated Tests
- Run `./gradlew :app:help` to verify that the `AndroidLocationsBuildService` error is resolved or manageable.
- Run `./gradlew :prepareKotlinBuildScriptModel` to ensure the task can now be executed by the IDE/CMake.

### Manual Verification
- Perform a **Sync Project with Gradle Files** in Android Studio.
- Verify that the `CMake Error` no longer appears in the Build/Sync tab.
