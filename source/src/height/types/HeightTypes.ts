/** Shared types for the AI-powered height measurement flow. */

export interface Point2D {
  x: number;
  y: number;
}

/** Single video frame passed to native/stub detectors. */
export interface VideoFrameInput {
  frameIndex: number;
  timestampMs: number;
  width: number;
  height: number;
  /** Opaque native buffer reference — stubs ignore this. */
  pixelBufferRef?: unknown;
}

/** Segmentation-based pose output (preferred over skeletal keypoints). */
export interface PoseSegmentationResult {
  /** Top-of-head vertex Y in pixels (image space, Y down). */
  vertexY: number;
  /** Heel contact Y in pixels. */
  heelY: number;
  /** 0–1 visibility of body segmentation mask. */
  visibility: number;
  frameIndex: number;
  timestampMs: number;
}

/** ArUco (or other) reference marker detection. */
export interface MarkerDetectionResult {
  markerId: number;
  /** Marker height in pixels (vertical edge). */
  heightPx: number;
  /** 0–100 detection confidence. */
  confidence: number;
  corners: Point2D[];
}

/** Per-frame fused measurement before aggregation. */
export interface FrameMeasurement {
  vertexY: number;
  heelY: number;
  markerHeightPx: number;
  markerPhysicalCm: number;
  poseVisibility: number;
  markerConfidence: number;
}

export interface HeightCalculationInput {
  frames: FrameMeasurement[];
  /** Minimum frames required after stability filtering. */
  minStableFrames?: number;
  /** Max coefficient of variation (std/mean) for stable subset. */
  maxHeightVariation?: number;
}

export interface HeightCalculationResult {
  heightCm: number;
  confidence: number;
  stableFrameCount: number;
  rejectedFrameCount: number;
  pixelsPerCm: number;
  heightPixels: number;
  heightStdDevCm: number;
}

export type HeightMeasurementStatus =
  | 'idle'
  | 'recording'
  | 'processing'
  | 'complete'
  | 'error';

export interface HeightMeasurementAttempt {
  measurementId: string;
  heightCm: number;
  confidence: number;
  timestamp: number;
  calibrationMethod: string;
  stableFrameCount: number;
  videoDurationSec: number;
}

export interface HeightPipelineResult {
  measurementId: string;
  heightCm: number;
  confidence: number;
  calibrationMethod: string;
  deviceModel: string;
  timestamp: number;
  stableFrameCount: number;
  rejectedFrameCount: number;
  videoDurationSec: number;
  pixelsPerCm: number;
}

export type CalibrationMethod = 'aruco_15cm' | 'aruco_custom';
