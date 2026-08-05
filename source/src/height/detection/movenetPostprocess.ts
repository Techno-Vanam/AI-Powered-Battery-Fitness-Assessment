import {
  MOVENET_KEYPOINT,
  POSE_MIN_KEYPOINT_CONFIDENCE,
  VERTEX_OFFSET_FACTOR,
} from './poseConstants';

export interface MoveNetKeypoint {
  y: number;
  x: number;
  confidence: number;
}

/** Parse MoveNet output tensor [1,1,17,3] or flat 51 floats — order is y, x, confidence. */
export function parseMoveNetOutput(output: ArrayBuffer): MoveNetKeypoint[] {
  const floats = new Float32Array(output);
  const keypoints: MoveNetKeypoint[] = [];

  for (let i = 0; i < 17; i++) {
    const base = i * 3;
    keypoints.push({
      y: floats[base] ?? 0,
      x: floats[base + 1] ?? 0,
      confidence: floats[base + 2] ?? 0,
    });
  }

  return keypoints;
}

export interface PosePixelResult {
  vertexY: number;
  heelY: number;
  visibility: number;
}

/**
 * Convert normalized MoveNet keypoints to pixel-space vertex + heel.
 * Returns null when required keypoints are below confidence threshold.
 */
export function keypointsToPosePixels(
  keypoints: MoveNetKeypoint[],
  frameWidth: number,
  frameHeight: number,
): PosePixelResult | null {
  const nose = keypoints[MOVENET_KEYPOINT.NOSE];
  const leftShoulder = keypoints[MOVENET_KEYPOINT.LEFT_SHOULDER];
  const rightShoulder = keypoints[MOVENET_KEYPOINT.RIGHT_SHOULDER];
  const leftAnkle = keypoints[MOVENET_KEYPOINT.LEFT_ANKLE];
  const rightAnkle = keypoints[MOVENET_KEYPOINT.RIGHT_ANKLE];

  const required = [nose, leftShoulder, rightShoulder, leftAnkle, rightAnkle];
  if (required.some(kp => !kp || kp.confidence < POSE_MIN_KEYPOINT_CONFIDENCE)) {
    return null;
  }

  const noseY = nose.y * frameHeight;
  const shoulderMidY =
    ((leftShoulder.y + rightShoulder.y) / 2) * frameHeight;
  const vertexY = noseY - (shoulderMidY - noseY) * VERTEX_OFFSET_FACTOR;
  const heelY = ((leftAnkle.y + rightAnkle.y) / 2) * frameHeight;

  const visibility =
    required.reduce((sum, kp) => sum + kp.confidence, 0) / required.length;

  if (!Number.isFinite(vertexY) || !Number.isFinite(heelY) || heelY <= vertexY) {
    return null;
  }

  return { vertexY, heelY, visibility };
}
