/** MoveNet single-pose COCO keypoint indices (17 keypoints). */
export const MOVENET_KEYPOINT = {
  NOSE: 0,
  LEFT_SHOULDER: 5,
  RIGHT_SHOULDER: 6,
  LEFT_ANKLE: 15,
  RIGHT_ANKLE: 16,
} as const;

/**
 * Head vertex extrapolation above the nose using shoulder midpoint.
 * vertexY = noseY - (shoulderMidY - noseY) * VERTEX_OFFSET_FACTOR
 *
 * Tunable during field calibration (typical range 0.4–0.8).
 */
export const VERTEX_OFFSET_FACTOR = 0.6;

/** Minimum per-keypoint confidence (0–1) to accept a pose frame. */
export const POSE_MIN_KEYPOINT_CONFIDENCE = 0.25;

/** MoveNet Lightning input resolution. */
export const MOVENET_INPUT_SIZE = 192;

/** Target on-device pose inference rate inside the frame processor worklet. */
export const POSE_INFERENCE_INTERVAL_MS = 200;
