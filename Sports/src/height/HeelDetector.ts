import type { Landmark } from '@vision/pose/PoseTypes';
import { LM } from '@vision/pose/PoseTypes';
import type { HeelDetection } from './HeightTypes';
import { HEEL_VISIBILITY_THRESH } from './HeightTypes';

/**
 * Detects the heel reference point from MediaPipe landmarks.
 *
 * Rules:
 *  - Both heels visible → average their Y; average their X.
 *  - Only one heel visible → use that heel.
 *  - Neither visible → reject.
 *
 * All coordinates returned in pixels.
 */
export function detectHeel(
  landmarks: Landmark[],
  frameWidth: number,
  frameHeight: number,
): HeelDetection {
  const leftHeel  = landmarks[LM.LEFT_HEEL];
  const rightHeel = landmarks[LM.RIGHT_HEEL];

  if (!leftHeel || !rightHeel) {
    return { found: false, reason: 'Heel landmarks missing from pose result' };
  }

  const leftVisible  = leftHeel.visibility  >= HEEL_VISIBILITY_THRESH &&
                       leftHeel.presence    >= HEEL_VISIBILITY_THRESH;
  const rightVisible = rightHeel.visibility >= HEEL_VISIBILITY_THRESH &&
                       rightHeel.presence   >= HEEL_VISIBILITY_THRESH;

  if (!leftVisible && !rightVisible) {
    return { found: false, reason: 'Neither heel is visible — ensure feet are in frame' };
  }

  let heelXNorm: number;
  let heelYNorm: number;

  if (leftVisible && rightVisible) {
    heelXNorm = (leftHeel.x + rightHeel.x) / 2;
    heelYNorm = (leftHeel.y + rightHeel.y) / 2;
  } else if (leftVisible) {
    heelXNorm = leftHeel.x;
    heelYNorm = leftHeel.y;
  } else {
    heelXNorm = rightHeel.x;
    heelYNorm = rightHeel.y;
  }

  return {
    found: true,
    heelX: heelXNorm * frameWidth,
    heelY: heelYNorm * frameHeight,
    leftVisible,
    rightVisible,
  };
}
