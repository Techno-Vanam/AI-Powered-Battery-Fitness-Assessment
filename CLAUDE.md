# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a hackathon submission (NeGD / MYAS, July 2026) for an offline, AI-powered physical fitness assessment app. It is a **monorepo** with three independently-versioned Node projects:

```
├── source/     # React Native 0.86 mobile app (the actual product) — has its own package.json
├── backend/    # Node/Express API server (auth + cloud sync only) — has its own package.json
├── app/        # Release APK + install instructions for submission (not source)
├── models/     # AI model files (TFLite/ONNX)
├── docs/       # HLD, LLD, model cards, validation report, API spec — check these before assuming architecture
└── compliance/ # Data protection declaration, consent forms
```

The root `package.json` only contains convenience scripts that shell out to `source/` and `backend/` — there is no shared root `node_modules` install for app code.

## Commands

Run from the **repository root**:

```sh
npm run install:all       # installs source/ and backend/ deps
npm run source:start      # Metro bundler
npm run source:android    # build & run on Android
npm run source:test       # jest tests (source/)
npm run source:lint       # eslint (source/)
npm run backend:dev       # backend with --watch
npm run android:all       # runs backend + metro + android concurrently (useful for full-stack local dev)
```

Or from `source/` directly:

```sh
npm start                 # Metro
npm run android           # react-native run-android
npm test                  # jest
npm run lint              # eslint .
npx jest src/modules/jumpAssessment          # run only the jump-assessment module tests
npx jest src/modules/jumpAssessment/__tests__/kalmanFilter.test.ts   # single test file
```

From `backend/`:

```sh
npm start                 # node src/server.js
npm run dev                # node --watch src/server.js
```

Android release build (from `source/android/`): `./gradlew assembleRelease` — output goes to `app/build/outputs/apk/release/`, then gets copied to `../../app/` for submission.

There is no TypeScript project-reference build step for `source/` — Metro/Babel transpile on the fly; `tsc` is used for type-checking only (via editors/CI), not a build artifact.

## Architecture

### Mobile app (`source/`) — offline-first, local-first auth

- **Local DB is the source of truth.** `src/db/schema.ts` defines an `op-sqlite` (`@op-engineering/op-sqlite`) database (`SportsApp.db`) with `users`, `sync_queue`, and `otp_verifications` tables. All auth/registration writes go to local SQLite first (`src/db/userRepository.ts`, `src/db/otpService.ts`).
- **Sync is asynchronous and queue-based**, not request/response. Any local mutation that needs to reach the server is appended to `sync_queue`; `src/services/syncService.ts` drains the queue whenever `NetInfo` reports connectivity, POSTs to `${API_BASE_URL}/sync/users`, and reconciles per-item `synced | updated | conflict | failed` statuses back into local rows (`src/db/syncQueueRepository.ts`). Never assume a network round-trip is synchronous in this app — write local-first, queue-second.
- `src/config/api.ts` picks the API host: `10.0.2.2` for the Android emulator, `localhost` for iOS, dev vs. prod switched on `__DEV__`.
- Navigation is a single `NativeStackNavigator` (`src/navigation/AppNavigator.tsx`) with one `RootStackParamList` typing every screen's params — add new screens here and keep the param types accurate, since screens read route params by key.
- Two parallel role-based flows: `screens/athlete/*` and `screens/coach/*`, sharing `screens/shared/*` (role select, password reset, terms).

### Jump Assessment module (`source/src/modules/jumpAssessment/`)

Self-contained feature module (components/screens/hooks/services/types/utils) implementing offline standing vertical-jump and standing broad-jump tests via on-device pose detection. Full design doc: `docs/VERTICAL_BROAD_JUMP_MODULE.md` (also see `docs/JUMP_ASSESSMENT_MASTER_DOCUMENTATION.md`).

Key facts that aren't obvious from file names alone:
- **Strict on-device/RAM-only privacy guarantee**: camera frames are processed entirely in native memory and never written to disk (no `MediaRecorder`, no bitmap caching, no temp files). The Kotlin frame processor plugin (`source/android/app/src/main/java/com/sports/jump/JumpFrameProcessorPlugin.kt`) calls `image.close()` in a `finally` block immediately after extracting pose landmarks — preserve this pattern in any change that touches frame handling.
- Native Android pieces: `MediaPipePoseDetector.kt` (17-keypoint pose extraction via MediaPipe) and `OpenCVCalibrationDetector.kt` (ArUco marker / A4-paper calibration to compute a `pixelsPerCm` ratio), wired into JS via a `react-native-vision-camera` frame processor plugin (`JumpNativePackage.kt`). The bridge only ever passes numeric coordinates/metrics across JSI, never image data.
- Business logic pipeline: `services/kalmanFilter.ts` smooths noisy pose coordinates → `services/jumpStateMachine.ts` drives the FSM (`IDLE → READY → COUNTDOWN → TAKEOFF → AIRBORNE → PEAK → LANDING → COMPLETE`, see the doc for the mermaid diagram) → `services/measurementEngine.ts` applies the kinematic formulas (vertical jump height = peak reach − standing reach in cm; broad jump = horizontal heel displacement in cm) → `services/jumpValidationService.ts` validates results → `services/jumpHistoryRepository.ts` persists them.
- `hooks/useVerticalJump.ts` / `hooks/useBroadJump.ts` orchestrate the state machine + measurement engine per test type; `hooks/useJumpCalibration.ts` handles the calibration step; `hooks/usePoseProcessor.ts` bridges frame-processor output into React state.
- Module-local tests live in `__tests__/` next to the module (not under a top-level `__tests__/`), run with `npx jest src/modules/jumpAssessment`.

### Backend (`backend/`)

Plain layered Express app (ESM, `"type": "module"`): `routes/ → controllers/ → services/ → repositories/`, with `schemas/` (Zod) validated by `middleware/validate.js`, and `database/` (libSQL/Turso client + `migrations.js`) as the persistence layer. `app.js` wires helmet, CORS (`env.CORS_ORIGINS`), morgan logging, and JSON body parsing; `server.js` is the entrypoint. Its sole responsibilities are athlete/coach auth (OTP-based) and receiving synced records from the mobile app's `sync_queue` — it is not the mobile app's primary datastore.

## Conventions

- ESLint config extends `@react-native` (`source/.eslintrc.js`); Prettier via `source/.prettierrc.js`. TypeScript config extends `@react-native/typescript-config`.
- Jest uses the `@react-native/jest-preset`.
- When adding a new jump-assessment metric or state, update `docs/VERTICAL_BROAD_JUMP_MODULE.md` alongside the code — it's treated as the authoritative spec for this module, not just a README.
