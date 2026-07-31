// ─── Physical constants ───────────────────────────────────────────────────────
export const MARKER_PHYSICAL_CM = 21.0;

// ─── Thresholds ───────────────────────────────────────────────────────────────
export const MIN_MARKER_CONFIDENCE    = 40;    // percent
export const MIN_POSE_CONFIDENCE      = 40;    // percent
export const MIN_HEIGHT_CM            = 100;   // sanity lower bound
export const MAX_HEIGHT_CM            = 250;   // sanity upper bound
export const MAX_CAMERA_TILT_DEG      = 10;    // degrees
export const HEEL_VISIBILITY_THRESH   = 0.45;
export const HEAD_VERTEX_CONFIDENCE_THRESH = 0.4;

// ─── Smoothing ────────────────────────────────────────────────────────────────
export const ROLLING_WINDOW_SIZE      = 10;    // frames
export const MEDIAN_WINDOW_SIZE       = 7;     // frames (must be odd)
export const STABILITY_WINDOW_MS      = 1500;  // ms — "hold still" duration
export const STABILITY_MAX_VARIANCE   = 1.5;   // cm — max std-dev to be "stable"
export const MAX_FRAME_JUMP_CM        = 8;     // cm — reject sudden jumps

// ─── Head vertex ROI ─────────────────────────────────────────────────────────
export const HEAD_ROI_SCALE           = 1.8;   // multiplier above nose–ear distance
export const HEAD_ROI_WIDTH_SCALE     = 1.2;   // horizontal width of ROI
export const GRADIENT_THRESHOLD       = 18;    // luminance gradient edge threshold
export const PERCENTILE_REJECT        = 0.10;  // reject bottom 10% of edge candidates

// ─── Point types ─────────────────────────────────────────────────────────────
export interface Point2D {
  x: number;   // pixels
  y: number;   // pixels
}

// ─── Head vertex result ───────────────────────────────────────────────────────
export interface HeadVertexResult {
  found: true;
  vertexX: number;         // pixels
  vertexY: number;         // pixels
  vertexConfidence: number; // 0–1
}

export interface HeadVertexMiss {
  found: false;
  reason: string;
}

export type HeadVertexDetection = HeadVertexResult | HeadVertexMiss;

// ─── Heel result ──────────────────────────────────────────────────────────────
export interface HeelResult {
  found: true;
  heelX: number;   // pixels — midpoint X
  heelY: number;   // pixels — averaged Y
  leftVisible: boolean;
  rightVisible: boolean;
}

export interface HeelMiss {
  found: false;
  reason: string;
}

export type HeelDetection = HeelResult | HeelMiss;

// ─── Validation result ────────────────────────────────────────────────────────
export interface ValidationResult {
  valid: boolean;
  reason?: string;
  code?: ValidationErrorCode;
}

export type ValidationErrorCode =
  | 'NO_MARKER'
  | 'MARKER_LOW_CONFIDENCE'
  | 'MARKER_TOO_SMALL'
  | 'WRONG_MARKER'
  | 'NO_POSE'
  | 'HEAD_NOT_VISIBLE'
  | 'HEEL_NOT_VISIBLE'
  | 'BODY_NOT_UPRIGHT'
  | 'BODY_OUTSIDE_FRAME'
  | 'CAMERA_TILTED'
  | 'MULTIPLE_PEOPLE'
  | 'LOW_LIGHT'
  | 'MOTION_BLUR';

// ─── Height measurement result ────────────────────────────────────────────────
export interface HeightMeasurement {
  heightCm: number;
  heightPixels: number;
  headVertex: Point2D;
  heelPoint: Point2D;
  markerScale: number;       // cmPerPixel
  markerConfidence: number;  // 0–100
  poseConfidence: number;    // 0–100
  overallConfidence: number; // 0–100
  processingTimeMs: number;
  timestamp: number;
}

// ─── Height calculation result (success or failure) ───────────────────────────
export interface HeightSuccess {
  success: true;
  measurement: HeightMeasurement;
}

export interface HeightFailure {
  success: false;
  code: ValidationErrorCode | 'HEAD_DETECTION_FAILED' | 'HEEL_DETECTION_FAILED' | 'SANITY_FAILED' | 'UNKNOWN';
  reason: string;
}

export type HeightResult = HeightSuccess | HeightFailure;

// ─── Measurement status (drives UI) ──────────────────────────────────────────
export type MeasurementStatus =
  | 'SEARCHING'
  | 'MARKER_DETECTED'
  | 'POSE_LOCKED'
  | 'HOLD_STILL'
  | 'HEIGHT_MEASURED';

// ─── Smoothed output ─────────────────────────────────────────────────────────
export interface SmoothedHeight {
  heightCm: number;
  isStable: boolean;
  stableForMs: number;
  sampleCount: number;
}

// ─── Guidance System Types ───────────────────────────────────────────────────
export type GuidanceCondition =
  | 'MULTIPLE_PEOPLE'
  | 'MARKER_MISSING'
  | 'MARKER_TOO_SMALL'
  | 'FEET_OUTSIDE'
  | 'HEAD_OUTSIDE'
  | 'PERSON_TOO_CLOSE'
  | 'PERSON_TOO_FAR'
  | 'CAMERA_TILTED'
  | 'MOTION_BLUR'
  | 'POOR_LIGHTING';

export interface GuidanceCheckResult {
  passed: boolean;
  message: string;
}

export interface GuidanceState {
  allPassed: boolean;
  primaryMessage: string;
  countdown: number | null; // 3, 2, 1, 0, or null
  checks: Record<GuidanceCondition, GuidanceCheckResult>;
}

