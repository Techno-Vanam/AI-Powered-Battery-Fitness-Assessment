export interface ArucoResult {
  detected: boolean;
  markerId: number;
  centerX: number;
  centerY: number;
  markerPixelHeight: number;
  confidence: number;
  rotation: number;
}

export interface Landmark {
  x: number; // normalized 0–1
  y: number; // normalized 0–1
  z: number;
  visibility: number;
  presence: number;
}

// MediaPipe BlazePose 33-landmark indices
export const LandmarkIndex = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

export interface PoseResult {
  landmarks: Landmark[];
}

export interface HeightMeasurement {
  id?: number;
  athleteName: string;
  heightCm: number;
  timestamp: number;
  confidence: number;
  markerId: number;
  syncStatus: 'pending' | 'synced';
}

export interface QualityCheck {
  passed: boolean;
  reason?: string;
}
