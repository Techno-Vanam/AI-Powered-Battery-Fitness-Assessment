// ─── Landmark ─────────────────────────────────────────────────────────────────
export interface Landmark {
  x: number;          // normalized 0–1 (horizontal)
  y: number;          // normalized 0–1 (vertical)
  z: number;          // world-space depth (metres, relative to hip midpoint)
  visibility: number; // 0–1
  presence: number;   // 0–1
}

// ─── MediaPipe BlazePose 33-landmark indices ──────────────────────────────────
export const LM = {
  NOSE:              0,
  LEFT_EYE_INNER:    1,
  LEFT_EYE:          2,
  LEFT_EYE_OUTER:    3,
  RIGHT_EYE_INNER:   4,
  RIGHT_EYE:         5,
  RIGHT_EYE_OUTER:   6,
  LEFT_EAR:          7,
  RIGHT_EAR:         8,
  MOUTH_LEFT:        9,
  MOUTH_RIGHT:       10,
  LEFT_SHOULDER:     11,
  RIGHT_SHOULDER:    12,
  LEFT_ELBOW:        13,
  RIGHT_ELBOW:       14,
  LEFT_WRIST:        15,
  RIGHT_WRIST:       16,
  LEFT_PINKY:        17,
  RIGHT_PINKY:       18,
  LEFT_INDEX:        19,
  RIGHT_INDEX:       20,
  LEFT_THUMB:        21,
  RIGHT_THUMB:       22,
  LEFT_HIP:          23,
  RIGHT_HIP:         24,
  LEFT_KNEE:         25,
  RIGHT_KNEE:        26,
  LEFT_ANKLE:        27,
  RIGHT_ANKLE:       28,
  LEFT_HEEL:         29,
  RIGHT_HEEL:        30,
  LEFT_FOOT_INDEX:   31,
  RIGHT_FOOT_INDEX:  32,
} as const;

export type LandmarkIndex = typeof LM[keyof typeof LM];

// ─── Required landmarks for height measurement ────────────────────────────────
export const REQUIRED_LANDMARKS: LandmarkIndex[] = [
  LM.NOSE,
  LM.LEFT_EAR,   LM.RIGHT_EAR,
  LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER,
  LM.LEFT_HIP,   LM.RIGHT_HIP,
  LM.LEFT_KNEE,  LM.RIGHT_KNEE,
  LM.LEFT_ANKLE, LM.RIGHT_ANKLE,
  LM.LEFT_HEEL,  LM.RIGHT_HEEL,
  LM.LEFT_FOOT_INDEX, LM.RIGHT_FOOT_INDEX,
];

// ─── Skeleton connections (pairs of landmark indices) ─────────────────────────
export const SKELETON_CONNECTIONS: [LandmarkIndex, LandmarkIndex][] = [
  // Face
  [LM.LEFT_EAR,       LM.LEFT_EYE],
  [LM.LEFT_EYE,       LM.NOSE],
  [LM.NOSE,           LM.RIGHT_EYE],
  [LM.RIGHT_EYE,      LM.RIGHT_EAR],
  // Torso
  [LM.LEFT_SHOULDER,  LM.RIGHT_SHOULDER],
  [LM.LEFT_SHOULDER,  LM.LEFT_HIP],
  [LM.RIGHT_SHOULDER, LM.RIGHT_HIP],
  [LM.LEFT_HIP,       LM.RIGHT_HIP],
  // Left arm
  [LM.LEFT_SHOULDER,  LM.LEFT_ELBOW],
  [LM.LEFT_ELBOW,     LM.LEFT_WRIST],
  // Right arm
  [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW],
  [LM.RIGHT_ELBOW,    LM.RIGHT_WRIST],
  // Left leg
  [LM.LEFT_HIP,       LM.LEFT_KNEE],
  [LM.LEFT_KNEE,      LM.LEFT_ANKLE],
  [LM.LEFT_ANKLE,     LM.LEFT_HEEL],
  [LM.LEFT_HEEL,      LM.LEFT_FOOT_INDEX],
  // Right leg
  [LM.RIGHT_HIP,      LM.RIGHT_KNEE],
  [LM.RIGHT_KNEE,     LM.RIGHT_ANKLE],
  [LM.RIGHT_ANKLE,    LM.RIGHT_HEEL],
  [LM.RIGHT_HEEL,     LM.RIGHT_FOOT_INDEX],
];

// ─── Result types ─────────────────────────────────────────────────────────────
export interface PoseDetection {
  detected: true;
  status: 'OK';
  landmarks: Landmark[];           // 33 landmarks, normalized coords
  visibleCount: number;
  overallConfidence: number;       // 0–100
  timestampMs: number;
  processingTimeMs: number;
}

export interface PoseMiss {
  detected: false;
  status: PoseErrorCode;
  reason: string;
}

export type PoseResult = PoseDetection | PoseMiss;

export type PoseErrorCode =
  | 'NO_PERSON'
  | 'MULTIPLE_PEOPLE'
  | 'PARTIAL_BODY'
  | 'HEAD_NOT_DETECTED'
  | 'HEEL_NOT_DETECTED'
  | 'LOW_CONFIDENCE'
  | 'NOT_INITIALIZED'
  | 'FRAME_ERROR'
  | 'INITIALIZING'
  | 'UNKNOWN';

// ─── Thresholds ───────────────────────────────────────────────────────────────
export const VISIBILITY_THRESHOLD = 0.5;
export const MIN_POSE_CONFIDENCE  = 40;   // percent
export const MIN_VISIBLE_COUNT    = 15;   // out of 33
