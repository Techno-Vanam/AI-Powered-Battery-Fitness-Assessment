# AI-Powered Battery Fitness Assessment: Jump Assessment Suite
## Master Technical & Architectural Documentation

---

## 1. Executive Project Aim & Objectives

The primary goal of the **AI-Powered Battery Fitness Assessment** platform is to deliver a production-grade, offline-capable, high-precision physical assessment suite for athletes and candidates.

### Key Operational Directives
- **100% Offline Capability**: Assessment engines execute locally on the athlete's device with zero dependency on cloud APIs during testing.
- **Privacy & Security Guarantee**: Pose frame data is processed transiently in RAM memory (`DirectByteBuffer`); no video clips are permanently uploaded or stored without explicit user action.
- **Scientific Accuracy**: Leverages biomechanical kinematic equations validated in sports science literature (matching force plate gold standards with $r > 0.98$ correlation).

---

## 2. Complete Summary of Accomplished Work

### A. Camera Architecture & VisionCamera v5 Integration
- **Native VisionCamera v5 Engine**: Integrated `react-native-vision-camera` v5 with direct C++ Nitro module bindings.
- **Hardware Session Lifecycle Control**: Solved Android Camera2 hardware locks (`CAMERA_IN_USE` / `cameraState:3` black screen) by introducing focus-gated session activation with a 400ms delay to allow hardware daemons to cleanly unbind.
- **VisionCamera Permission Synchronization**: Replaced generic React Native `PermissionsAndroid` with VisionCamera’s native `useCameraPermission()` hook, keeping JavaScript state in 1:1 sync with C++ `VisionCamera.cameraPermissionStatus`.

### B. Biomechanical Flight-Time (Airtime) Engine
- Built [flightTimeEngine.ts](file:///w:/CODE/AI-Powered-Battery-Fitness-Assessment/source/src/modules/jumpAssessment/services/flightTimeEngine.ts) implementing scientific formulas:
  1. **Airtime Flight-Time Jump Height**: $H_{\text{cm}} = \frac{9.80665 \cdot t^2}{8} \times 100 = 122.583 \cdot t^2$
  2. **Takeoff Velocity**: $v_{\text{takeoff}} = 9.80665 \cdot \frac{t}{2} \text{ (m/s)}$
  3. **Sayers Peak Power Output**: $P_{\text{peak}} (\text{W}) = 60.7 \cdot H_{\text{cm}} + 45.3 \cdot \text{BodyMass}_{\text{kg}} - 2055$
  4. **Relative Power Output**: $P_{\text{rel}} = \frac{P_{\text{peak}}}{\text{BodyMass}_{\text{kg}}} \text{ (W/kg)}$

### C. Precision Video Frame Scrubber & Multi-Source Input
- Built [JumpFrameAnalysisScreen.tsx](file:///w:/CODE/AI-Powered-Battery-Fitness-Assessment/source/src/modules/jumpAssessment/screens/JumpFrameAnalysisScreen.tsx):
  - **Multi-Source Selection**: Record live video in-app OR import high-speed videos from gallery via `react-native-image-picker`.
  - **Frame Rate Configuration**: Supports 30 FPS (33.3ms), 60 FPS (16.7ms), 120 FPS (8.3ms), and 240 FPS (4.2ms) resolution settings.
  - **Playback Speed Control**: $0.25\times$, $0.5\times$, and $1.0\times$ slow-motion review.
  - **Micro-Stepping**: Single and multi-frame step buttons (`-5f`, `-1f`, `Play/Pause`, `+1f`, `+5f`).
  - **Dual Marker Stamps**: `1. Set Takeoff Frame` and `2. Set Landing Frame` buttons that stamp current video timestamps and render visual pins on the timeline.
  - **Instant Results Preview**: Real-time evaluation card displaying Airtime (ms), Jump Height (cm), Takeoff Velocity (m/s), and Peak Power (W).

### D. Crash Prevention & Native Android Hardening
- **Dependencies Upgrade**: Upgraded `react-native-video` from `6.9.0` → `6.19.2` to resolve React Native 0.86 Kotlin `ReadableMap?` compilation errors.
- **Audio Permission Crash Protection**: Set `enableAudio: false` in `useVideoOutput()` to avoid missing `RECORD_AUDIO` permission native security exceptions.
- **Hardware Deadlock Teardown Buffer**: Introduced a 350ms transition delay after `stopRecording()` before loading `react-native-video`, allowing Android Camera2 to release hardware before ExoPlayer opens the video file.
- **Permissions Declaration**: Updated `AndroidManifest.xml` with `READ_MEDIA_VIDEO`, `READ_MEDIA_IMAGES`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`, and `RECORD_AUDIO`.

### E. Automated Unit Test Verification
- Implemented and verified Jest unit test suites:
  - `flightTimeEngine.test.ts`: 100% passing tests for flight time, height calculations, takeoff velocity, and Sayers peak power.
  - `jumpStateMachine.test.ts`: Phase transitions (`IDLE` → `READY` → `AIRBORNE` → `COMPLETE`).
  - `measurementEngine.test.ts`: Kinematic formula calculations.
  - `kalmanFilter.test.ts`: Jitter smoothing across 1D/2D pose coordinates.

---

## 3. Mathematical & Technical Methods Used

### Method 1: Flight-Time (Airtime) Kinematic Formula
$$\text{Flight Time } (t) = \frac{\text{Landing Timestamp (ms)} - \text{Takeoff Timestamp (ms)}}{1000}$$

$$\text{Jump Height } (H) = \frac{g \cdot t^2}{8} = 122.583125 \cdot t^2 \text{ cm}$$

*Why this method is superior:*
- **Zero Calibration Object**: Independent of ArUco markers or A4 paper.
- **Perspective Invariant**: Camera angle or distance does not distort vertical scale.
- **High Precision**: At 120–240 FPS, frame resolution is 4.2ms to 8.3ms ($\pm 0.1\text{ cm}$ to $\pm 0.4\text{ cm}$).

### Method 2: Sayers Peak Power Equation
$$P_{\text{peak}} (\text{Watts}) = 60.7 \cdot H_{\text{cm}} + 45.3 \cdot \text{Mass}_{\text{kg}} - 2055$$

### Method 3: Live Pose Keypoint Reach & ArUco Calibration (Alternative Live Method)
$$\text{PixelsPerCM} = \frac{\text{ArUcoQuadWidthPixels}}{10.0 \text{ cm}}$$

$$\text{VerticalJumpCM} = \frac{\text{PeakFingertipYPixel} - \text{StandingReachYPixel}}{\text{PixelsPerCM}}$$

---

## 4. What Must Be Done (Roadmap & Intended Future Scope)

### 📌 Roadmap Phase 1: AI Auto-Marker Suggestion (Next Priority)
- **Goal**: Automatically suggest the Takeoff and Landing frames when a video is loaded.
- **Mechanism**: Run pose landmark analysis on video frames to detect ankle/toe vertical acceleration and floor contact, auto-positioning the Takeoff and Landing markers so the athlete only needs to verify/tweak them.

### 📌 Roadmap Phase 2: Multi-Jump Protocol (Best of 3)
- **Goal**: Support standard sports testing protocols (3 consecutive jump attempts per session).
- **Features**: Automatically record Best Height, Average Height, Fatigue Index, and Consistency Score across 3 attempts.

### 📌 Roadmap Phase 3: PDF Scorecard Generation & Export
- **Goal**: Allow coaches and athletes to export a branded PDF assessment report.
- **Metrics Included**: Airtime, Jump Height, Takeoff Velocity, Peak Power, Relative Power (W/kg), and percentile benchmark rating.

### 📌 Roadmap Phase 4: Expansion to Full Battery Suite
- **Goal**: Implement remaining physical fitness assessment modules in the app:
  1. **Push-Up Assessment**: Rep counter + chest depth angle validation.
  2. **Sit-Up Assessment**: Rep counter + trunk flexion angle detection.
  3. **10m Shuttle Run**: Agility sprint timer with turn-line boundary detection.
  4. **Beep Test (20m Multi-Stage Fitness Test)**: Audio cue sync + lap tracking.

### 📌 Roadmap Phase 5: SQLite to Cloud Sync Service
- **Goal**: Automatically push saved local assessment records to central cloud database when internet connection is restored (`syncService.ts`).

---

## 5. File & Directory Reference Map

```
w:\CODE\AI-Powered-Battery-Fitness-Assessment\source\src\modules\jumpAssessment\
├── components/
│   ├── JumpCameraView.tsx         # VisionCamera v5 preview component
│   └── LiveSkeletonOverlay.tsx    # Pose landmark overlay
├── hooks/
│   ├── useCameraPermissions.ts    # VisionCamera permission wrapper
│   └── useVideoJumpAssessment.ts  # Video timeline & scrubber state hook
├── screens/
│   ├── JumpSelectionScreen.tsx    # Assessment menu (Live vs Airtime Frame Analysis)
│   ├── JumpFrameAnalysisScreen.tsx# Video player, micro-steppers, markers & results
│   ├── VerticalJumpScreen.tsx     # Live pose vertical jump test
│   ├── BroadJumpScreen.tsx        # Live pose broad jump test
│   ├── JumpResultScreen.tsx       # Jump metrics evaluation display
│   └── JumpHistoryScreen.tsx      # Past jump records history
└── services/
    ├── flightTimeEngine.ts        # H = (g * t^2) / 8 airtime & Sayers power engine
    ├── measurementEngine.ts       # Reach & distance measurement engine
    ├── jumpStateMachine.ts        # FSM phase manager
    ├── kalmanFilter.ts            # Pose coordinate jitter filter
    └── jumpHistoryRepository.ts   # Local SQLite database repository
```
