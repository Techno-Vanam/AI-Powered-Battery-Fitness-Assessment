import type { ArucoResult, Landmark, QualityCheck } from '../utils/types';
import { LandmarkIndex } from '../utils/types';

const CONFIDENCE_THRESHOLD = 0.6;
const VISIBILITY_THRESHOLD = 0.5;
const MAX_TILT_DEGREES = 15;

export function runQualityChecks(
  aruco: ArucoResult,
  landmarks: Landmark[],
): QualityCheck {
  if (!aruco.detected) {
    return { passed: false, reason: 'ArUco marker not detected. Place the 21cm marker on the floor.' };
  }
  if (aruco.confidence < CONFIDENCE_THRESHOLD) {
    return { passed: false, reason: 'Marker confidence too low. Improve lighting.' };
  }
  if (Math.abs(aruco.rotation) > MAX_TILT_DEGREES) {
    return { passed: false, reason: 'Camera is tilted. Hold the phone upright.' };
  }
  if (landmarks.length < 33) {
    return { passed: false, reason: 'Body not fully detected. Step back.' };
  }

  const required = [
    LandmarkIndex.NOSE,
    LandmarkIndex.LEFT_EAR,
    LandmarkIndex.RIGHT_EAR,
    LandmarkIndex.LEFT_SHOULDER,
    LandmarkIndex.RIGHT_SHOULDER,
    LandmarkIndex.LEFT_HIP,
    LandmarkIndex.RIGHT_HIP,
    LandmarkIndex.LEFT_HEEL,
    LandmarkIndex.RIGHT_HEEL,
  ];

  for (const idx of required) {
    if (landmarks[idx].visibility < VISIBILITY_THRESHOLD) {
      return { passed: false, reason: 'Body not fully visible. Ensure full body is in frame.' };
    }
  }

  // Check person is standing upright: shoulders above hips above heels
  const shoulderY = (landmarks[LandmarkIndex.LEFT_SHOULDER].y + landmarks[LandmarkIndex.RIGHT_SHOULDER].y) / 2;
  const hipY = (landmarks[LandmarkIndex.LEFT_HIP].y + landmarks[LandmarkIndex.RIGHT_HIP].y) / 2;
  const heelY = (landmarks[LandmarkIndex.LEFT_HEEL].y + landmarks[LandmarkIndex.RIGHT_HEEL].y) / 2;

  if (!(shoulderY < hipY && hipY < heelY)) {
    return { passed: false, reason: 'Person must be standing upright.' };
  }

  return { passed: true };
}
