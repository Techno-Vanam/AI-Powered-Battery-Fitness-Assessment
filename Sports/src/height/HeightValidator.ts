import type { Landmark } from '@vision/pose/PoseTypes';
import { LM, VISIBILITY_THRESHOLD } from '@vision/pose/PoseTypes';
import { isVisible, isInFrame } from '@vision/pose/PoseMath';
import type { ArucoDetection } from '@vision/aruco/Types';
import type { ValidationResult } from './HeightTypes';
import {
  MIN_MARKER_CONFIDENCE,
  MIN_POSE_CONFIDENCE,
  MAX_CAMERA_TILT_DEG,
} from './HeightTypes';

// ─── Individual checks ────────────────────────────────────────────────────────

function checkMarker(aruco: ArucoDetection): ValidationResult {
  if (aruco.confidence < MIN_MARKER_CONFIDENCE) {
    return {
      valid: false,
      code: 'MARKER_LOW_CONFIDENCE',
      reason: `Marker confidence ${aruco.confidence.toFixed(0)}% is below ${MIN_MARKER_CONFIDENCE}%. Improve lighting.`,
    };
  }
  return { valid: true };
}

function checkCameraTilt(aruco: ArucoDetection): ValidationResult {
  const tilt = Math.abs(aruco.rotationAngle);
  if (tilt > MAX_CAMERA_TILT_DEG) {
    return {
      valid: false,
      code: 'CAMERA_TILTED',
      reason: `Camera tilt ${tilt.toFixed(1)}° exceeds ${MAX_CAMERA_TILT_DEG}°. Hold phone upright.`,
    };
  }
  return { valid: true };
}

function checkHeadVisible(landmarks: Landmark[]): ValidationResult {
  const nose     = landmarks[LM.NOSE];
  const leftEar  = landmarks[LM.LEFT_EAR];
  const rightEar = landmarks[LM.RIGHT_EAR];

  if (!isVisible(nose, VISIBILITY_THRESHOLD)) {
    return { valid: false, code: 'HEAD_NOT_VISIBLE', reason: 'Nose not visible. Ensure head is in frame.' };
  }
  if (!isVisible(leftEar, VISIBILITY_THRESHOLD) && !isVisible(rightEar, VISIBILITY_THRESHOLD)) {
    return { valid: false, code: 'HEAD_NOT_VISIBLE', reason: 'Ears not visible. Face the camera.' };
  }
  return { valid: true };
}

function checkHeelVisible(landmarks: Landmark[]): ValidationResult {
  const leftHeel  = landmarks[LM.LEFT_HEEL];
  const rightHeel = landmarks[LM.RIGHT_HEEL];
  if (!isVisible(leftHeel, 0.4) && !isVisible(rightHeel, 0.4)) {
    return { valid: false, code: 'HEEL_NOT_VISIBLE', reason: 'Heels not visible. Ensure feet are in frame.' };
  }
  return { valid: true };
}

function checkBodyUpright(landmarks: Landmark[]): ValidationResult {
  const leftShoulder  = landmarks[LM.LEFT_SHOULDER];
  const rightShoulder = landmarks[LM.RIGHT_SHOULDER];
  const leftHip       = landmarks[LM.LEFT_HIP];
  const rightHip      = landmarks[LM.RIGHT_HIP];
  const leftHeel      = landmarks[LM.LEFT_HEEL];
  const rightHeel     = landmarks[LM.RIGHT_HEEL];

  if (
    !isVisible(leftShoulder)  || !isVisible(rightShoulder) ||
    !isVisible(leftHip)       || !isVisible(rightHip)
  ) {
    return { valid: true }; // can't check — don't block
  }

  const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
  const hipY      = (leftHip.y + rightHip.y) / 2;

  // In image coords Y increases downward: shoulders must be above hips
  if (shoulderY >= hipY) {
    return {
      valid: false,
      code: 'BODY_NOT_UPRIGHT',
      reason: 'Person must be standing upright.',
    };
  }

  // Heels must be below hips
  if (isVisible(leftHeel, 0.4) || isVisible(rightHeel, 0.4)) {
    const heelY = isVisible(leftHeel, 0.4) && isVisible(rightHeel, 0.4)
      ? (leftHeel.y + rightHeel.y) / 2
      : isVisible(leftHeel, 0.4) ? leftHeel.y : rightHeel.y;

    if (heelY <= hipY) {
      return {
        valid: false,
        code: 'BODY_NOT_UPRIGHT',
        reason: 'Heels must be below hips. Stand upright.',
      };
    }
  }

  return { valid: true };
}

function checkBodyInFrame(landmarks: Landmark[]): ValidationResult {
  const criticalIndices = [
    LM.NOSE,
    LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER,
    LM.LEFT_HIP,      LM.RIGHT_HIP,
    LM.LEFT_HEEL,     LM.RIGHT_HEEL,
  ];

  const outOfFrame = criticalIndices.filter(idx => {
    const lm = landmarks[idx];
    return isVisible(lm, VISIBILITY_THRESHOLD) && !isInFrame(lm, 0.01);
  });

  if (outOfFrame.length > 1) {
    return {
      valid: false,
      code: 'BODY_OUTSIDE_FRAME',
      reason: 'Body is partially outside the frame. Step back.',
    };
  }
  return { valid: true };
}

function checkShoulderSymmetry(landmarks: Landmark[]): ValidationResult {
  const leftShoulder  = landmarks[LM.LEFT_SHOULDER];
  const rightShoulder = landmarks[LM.RIGHT_SHOULDER];

  if (!isVisible(leftShoulder) || !isVisible(rightShoulder)) {
    return { valid: true };
  }

  // If shoulder Y difference is large, person is leaning sideways
  const shoulderYDiff = Math.abs(leftShoulder.y - rightShoulder.y);
  if (shoulderYDiff > 0.08) {
    return {
      valid: false,
      code: 'BODY_NOT_UPRIGHT',
      reason: 'Person is leaning sideways. Stand straight.',
    };
  }
  return { valid: true };
}

// ─── Main validator ───────────────────────────────────────────────────────────
/**
 * Runs all posture and quality checks in priority order.
 * Returns the first failing check, or { valid: true } if all pass.
 */
export function validateForHeight(
  aruco: ArucoDetection,
  landmarks: Landmark[],
  poseConfidence: number,
): ValidationResult {
  const checks: ValidationResult[] = [
    checkMarker(aruco),
    checkCameraTilt(aruco),
    checkHeadVisible(landmarks),
    checkHeelVisible(landmarks),
    checkBodyUpright(landmarks),
    checkBodyInFrame(landmarks),
    checkShoulderSymmetry(landmarks),
  ];

  for (const check of checks) {
    if (!check.valid) return check;
  }

  if (poseConfidence < MIN_POSE_CONFIDENCE) {
    return {
      valid: false,
      code: 'NO_POSE',
      reason: `Pose confidence ${poseConfidence.toFixed(0)}% too low. Ensure good lighting.`,
    };
  }

  return { valid: true };
}
