/**
 * MediaPipe Pose 17 Keypoint Landmarks Definitions
 */

export enum PoseLandmarkIndex {
  NOSE = 0,
  LEFT_SHOULDER = 1,
  RIGHT_SHOULDER = 2,
  LEFT_ELBOW = 3,
  RIGHT_ELBOW = 4,
  LEFT_WRIST = 5,
  RIGHT_WRIST = 6,
  LEFT_INDEX = 7,
  RIGHT_INDEX = 8,
  LEFT_HIP = 9,
  RIGHT_HIP = 10,
  LEFT_KNEE = 11,
  RIGHT_KNEE = 12,
  LEFT_ANKLE = 13,
  RIGHT_ANKLE = 14,
  LEFT_HEEL = 15,
  RIGHT_HEEL = 16,
}

export interface Landmark2D {
  x: number; // Normalized [0.0, 1.0] relative to frame width
  y: number; // Normalized [0.0, 1.0] relative to frame height
  z?: number; // Estimated depth in meters or arbitrary scale
  visibility: number; // Confidence score [0.0, 1.0]
}

export type PoseLandmarks = Record<PoseLandmarkIndex, Landmark2D>;

export interface FramePoseData {
  timestampMs: number;
  landmarks: PoseLandmarks;
  confidenceScore: number;
  personDetected: boolean;
  feetVisible: boolean;
  handsVisible: boolean;
}
