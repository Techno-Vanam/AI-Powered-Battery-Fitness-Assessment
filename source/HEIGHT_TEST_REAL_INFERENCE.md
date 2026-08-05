# Real On-Device Height Test Inference

This document describes the real-time pose + marker detection wired into `CameraScreen.tsx` (maps to the user's `HeightTestScreen.tsx`).

## Packages installed (exact versions)

| Package | Version | Purpose |
|---------|---------|---------|
| `react-native-vision-camera` | ^4.6.4 (pre-existing) | Camera + frame processors |
| `react-native-worklets-core` | ^1.3.3 (pre-existing) | Worklet runtime |
| `react-native-fast-tflite` | **3.0.1** | MoveNet TFLite inference |
| `react-native-nitro-modules` | **0.36.5** | Required peer for fast-tflite + model boxing (VC v4) |
| `vision-camera-resize-plugin` | **3.2.0** | GPU/CPU frame resize → 192×192 RGB |

**Not installed (flagged):**
- `vision-camera-code-scanner` — unmaintained; not used.
- `react-native-vision-camera-barcode-scanner` — requires VisionCamera **v5**; project stays on v4.6.4. QR uses built-in `codeScanner` on `<Camera>` instead.

## Pose model

| Field | Value |
|-------|-------|
| File | `source/assets/models/movenet_lightning.tflite` (~2.89 MB) |
| Source | https://tfhub.dev/google/lite-model/movenet/singlepose/lightning/tflite/int8/4?lite-format=tflite |
| License | Apache 2.0 (Google / TensorFlow Hub model terms) |
| Input | 192×192×3 uint8 RGB |
| Output | 17 COCO keypoints × (y, x, confidence) normalized 0–1 |

## Marker detection

| Platform | Method | Notes |
|----------|--------|-------|
| **Android** | Native OpenCV ArUco frame processor (`detectAruco`) | DICT_MIP_36h12, 15 cm default; uses printed assets in `aruco_mip_36h12_dict/` |
| **iOS** | VisionCamera v4 built-in `codeScanner` (QR) | Payload e.g. `HEIGHT_MARKER_15CM`; falls back to 15 cm constant |

## VERTEX_OFFSET_FACTOR

- **File:** `source/src/height/detection/poseConstants.ts`
- **Default:** `0.6`
- **Formula:** `vertexY = noseY - (shoulderMidY - noseY) * VERTEX_OFFSET_FACTOR`

## Physical device requirement

Frame processors **do not run on emulators/simulators**. Test on a physical Android device (API 24+, camera permission granted).

## How to test on Android

```bash
cd source
npm install
npx react-native run-android
```

1. Print a 15×15 cm ArUco MIP_36h12 marker (ID 0 recommended) from `aruco_mip_36h12_dict/`.
2. Place marker on floor near subject's feet, full body visible.
3. Open app → athlete → Height Test Instructions → Open Camera.
4. **Start Recording** for 10–30 s while standing still.
5. **Stop & Measure** — pipeline uses live captured frames (not synthetic stubs).
6. Compare result to tape-measure height; tune `VERTEX_OFFSET_FACTOR` if vertex is consistently off.

## Validation checklist (manual)

- [ ] Pose keypoints visible in log (`__DEV__` inference warnings only on failure)
- [ ] ArUco detected on Android (marker in lower frame)
- [ ] `stableFrameCount` ≥ 5 in result
- [ ] Confidence ≥ 60 for acceptable measurement
- [ ] Re-measure within ±1 cm of reference height after calibration

## What is real vs stubbed

| Component | Status |
|-----------|--------|
| MoveNet TFLite pose (frame processor) | **Real** |
| ArUco marker (Android native) | **Real** |
| QR marker (iOS codeScanner) | **Real** |
| Video file encode/decode | **Stub** — duration timer; inference from live frames during recording |
| Emulator fallback | **Stub** — empty capture → pipeline falls back to synthetic frames + mocks in tests only |
| `heightCalculation.ts` | **Unchanged** |

## Native rebuild required

After `npm install`, rebuild native apps:

```bash
cd source/android && ./gradlew clean   # Windows: gradlew.bat clean
cd source && npx react-native run-android
# iOS: cd ios && pod install && cd .. && npx react-native run-ios
```

## Babel / Metro

- `babel.config.js` — already includes `react-native-worklets-core/plugin` and Reanimated.
- `metro.config.js` — `.tflite` added to `assetExts`.
- `react-native.config.js` — links `assets/models/`.
