# Height Test (Test No. 1) — AI Camera Measurement

Complete rebuild: offline-first, on-device inference, ArUco-calibrated height from video.

## Deleted files (old implementation)

### Mobile (`source/`)

| File | Reason |
|------|--------|
| `src/height/HeelDetector.ts` | Replaced by `IPoseEstimator` segmentation vertex |
| `src/height/HeadVertexDetector.ts` | Replaced by segmentation-based vertex |
| `src/height/HeightCalculator.ts` | Replaced by pure `calculation/heightCalculation.ts` |
| `src/height/heightCalculator.ts` | Duplicate calculator removed |
| `src/height/HeightValidator.ts` | Validation folded into pipeline + calculation |
| `src/height/HeightSmoother.ts` | Stability via frame std-dev in calculation module |
| `src/height/GuidanceSystem.ts` | Replaced by capture overlay + instructions |
| `src/height/HeightTypes.ts` (old) | Replaced by `types/HeightTypes.ts` |
| `src/height/aggregatePhotoAttempts.ts` | Photo-based flow replaced by video |
| `src/height/HeightOverlay.tsx` | Replaced by `HeightCaptureOverlay.tsx` |
| `src/height/HeightGuidanceOverlay.tsx` | Replaced by `HeightCaptureOverlay.tsx` |
| `src/height/StaticMeasurementOverlay.tsx` | Replaced by video flow overlay |
| `src/height/qualityChecks.ts` | Logic moved to calculation module |
| `src/camera/useHeightFrameProcessor.ts` | Replaced by video pipeline |
| `src/hooks/useArUcoHeightMeasurement.ts` | Replaced by `useHeightMeasurement.ts` |
| `src/hooks/useHeightCalculation.ts` | Replaced by pipeline + hook |
| `src/hooks/usePose.ts` | Replaced by `IPoseEstimator` interface |
| `src/repository/heightRepository.ts` | Duplicate of DB repository |
| `src/services/heightService.ts` | Logic in use cases + pipeline |
| `src/vision/**` (entire folder) | Replaced by interfaces + mocks |

### Tests removed

- `__tests__/height/height.test.ts`
- `__tests__/height/guidanceSystem.test.ts`
- `__tests__/integration/heightPipeline.test.ts`
- `__tests__/unit/heightMath.test.ts`
- `__tests__/unit/aruco.test.ts`
- `__tests__/unit/pose.test.ts`
- `__tests__/stress/stress1000Measurements.test.ts`

### Android native

- `android/.../height/HeightMeasurementModule.kt`
- `android/.../height/HeightMeasurementPackage.kt`

### Backend (legacy route retained for athletes only)

- Old `POST /api/height-tests` removed; replaced by `POST /api/tests/height`
- `height_tests` table replaced by `height_measurements` in server DB migrations

---

## New / changed files

| File | Description |
|------|-------------|
| `source/src/height/types/HeightTypes.ts` | Shared types for frames, results, pipeline I/O |
| `source/src/height/config/heightTestConfig.ts` | Marker size (15 cm default), video 10–30 s limits |
| `source/src/height/interfaces/IPoseEstimator.ts` | Swappable pose/segmentation interface |
| `source/src/height/interfaces/IMarkerDetector.ts` | Swappable ArUco marker interface |
| `source/src/height/detection/MockPoseEstimator.ts` | Stub pose detector with `TODO(native-model)` |
| `source/src/height/detection/MockMarkerDetector.ts` | Stub marker detector with `TODO(native-model)` |
| `source/src/height/calculation/heightCalculation.ts` | **Pure** scale math, averaging, confidence (0–100) |
| `source/src/height/services/HeightMeasurementPipeline.ts` | Fuses stubs → calculation; no cloud calls |
| `source/src/height/components/HeightCaptureOverlay.tsx` | Recording UI overlay |
| `source/src/hooks/useHeightMeasurement.ts` | Video record state + pipeline trigger |
| `source/src/screens/CameraScreen.tsx` | End-to-end capture → measure → save flow |
| `source/src/screens/HeightTestInstructionsScreen.tsx` | ArUco + offline checklist |
| `source/src/screens/HeightResultScreen.tsx` | Result + re-measure without losing attempts |
| `source/src/database/repositories/HeightRepository.ts` | New schema with `measurementId` idempotency key |
| `source/src/database/database.ts` | Migration v3 — new `height_tests` columns |
| `source/src/network/HeightApi.ts` | `POST /api/tests/height` sync |
| `source/src/domain/usecases/HeightTestUseCases.ts` | Offline save + sync enqueue |
| `source/__tests__/unit/heightCalculation.test.ts` | Unit tests for pure calculation |
| `source/__tests__/integration/heightMeasurementPipeline.test.ts` | Stub pipeline E2E test |
| `backend/src/routes/testRoutes.js` | `POST /api/tests/height` route |
| `backend/src/controllers/heightTestController.js` | Upload + idempotent HEAD/GET |
| `backend/src/services/heightTestService.js` | Idempotent upsert by `measurementId` |
| `backend/src/schemas/heightTestSchemas.js` | Zod validation for sync payload |
| `backend/src/repositories/heightTestRepository.js` | `height_measurements` table access |
| `backend/src/database/migrations.js` | Server DDL for `height_measurements` |

---

## Architecture decisions

1. **Video, not photos** — 10–30 s recording; duration validated before inference.
2. **Pure calculation layer** — `heightCalculation.ts` has zero React/native imports; fully unit-tested.
3. **Interface-driven ML** — `IPoseEstimator` + `IMarkerDetector` with mock impls; native TFLite/OpenCV plug in at `createPoseEstimator()` / `createMarkerDetector()`.
4. **Segmentation-first** — Types model `vertexY` from mask boundary (stub simulates production shape).
5. **Offline-first** — SQLite local store → sync queue → `POST /api/tests/height`; raw video never uploaded.
6. **Idempotent sync** — Client UUID `measurementId` dedupes retries (server returns 200 if exists).
7. **Re-measurement** — Low confidence (&lt;60%) shows retry; prior attempts kept in hook state + DB rows.
8. **Conventions** — Same folders as before (`src/height/`, `HeightTestUseCases`, `HeightRepository`, navigator routes).

---

## What is real vs stubbed

| Component | Status |
|-----------|--------|
| Pure height math + confidence | **Real** — production logic |
| Unit tests for calculation | **Real** |
| SQLite offline storage + sync queue | **Real** |
| Express `POST /api/tests/height` | **Real** |
| Camera preview (Vision Camera) | **Real** |
| Video file encoding to disk | **Not wired** — duration timer simulates clip length |
| TFLite pose segmentation | **Stub** — `MockPoseEstimator` |
| OpenCV ArUco detection | **Stub** — `MockMarkerDetector` |
| Frame extraction from video | **Stub** — synthetic frames from duration |

---

## Production next steps

1. Implement native `NativePoseEstimator` (TFLite segmentation) — see `MockPoseEstimator.ts` `TODO(native-model)`.
2. Implement native `NativeArucoDetector` (DICT_MIP_36h12, 15 cm default) — see `MockMarkerDetector.ts`.
3. Decode recorded video frames on-device (MediaCodec / ffmpeg-kit) without network.
4. Wire `HeightMeasurementPipeline` to real frame buffers instead of `buildVideoFrames()`.
5. Optional: user opt-in to keep video locally; default delete after measurement.

---

## How to run / demo

### Unit tests (calculation module)

```bash
cd source
npm test -- __tests__/unit/heightCalculation.test.ts
npm test -- __tests__/integration/heightMeasurementPipeline.test.ts
```

### Mobile app flow

```bash
cd source
npm start
# Android
npm run android
```

1. Log in as athlete (or coach → athlete list).
2. **Measure Height** → select athlete → **Height Test Instructions**.
3. Complete checklist → **Open Camera**.
4. **Start Recording** → hold 10+ seconds → **Stop & Measure**.
5. On-device stub inference runs → result saved locally → **Height Result** screen.
6. **Sync Queue** uploads numeric result when online (`POST /api/tests/height`).

### Backend

```bash
cd backend
npm install
npm start
```

Health: `GET http://localhost:3000/api/health`

Upload (example):

```bash
curl -X POST http://localhost:3000/api/tests/height \
  -H "Content-Type: application/json" \
  -d '{"measurementId":"550e8400-e29b-41d4-a716-446655440000","athleteId":"NSRS-001","heightCm":162.4,"confidence":88,"deviceModel":"Pixel 6","timestamp":1720000000000,"calibrationMethod":"aruco_15cm"}'
```

Repeat same `measurementId` → idempotent 200 response.

---

## ArUco marker assets

Printed markers: `aruco_mip_36h12_dict/` (DICT_MIP_36h12). Default physical size: **15 cm × 15 cm** (configurable in `heightTestConfig.ts`).
