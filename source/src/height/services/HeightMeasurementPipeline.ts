import { v4 as uuidv4 } from 'uuid';
import type { IPoseEstimator } from '../interfaces/IPoseEstimator';
import type { IMarkerDetector } from '../interfaces/IMarkerDetector';
import type {
  FrameMeasurement,
  HeightPipelineResult,
  VideoFrameInput,
} from '../types/HeightTypes';
import { calculateHeightFromFrames } from '../calculation/heightCalculation';
import {
  DEFAULT_CALIBRATION_METHOD,
  DEFAULT_MARKER_SIZE_CM,
  TARGET_INFERENCE_FPS,
} from '../config/heightTestConfig';
import type { CapturedInferenceData } from '../detection/FrameCaptureBuffer';
import { createMarkerDetector } from '../detection/LiveMarkerDetector';
import { createPoseEstimator } from '../detection/TflitePoseEstimator';

export interface PipelineOptions {
  markerPhysicalCm?: number;
  calibrationMethod?: string;
  deviceModel?: string;
  poseEstimator?: IPoseEstimator;
  markerDetector?: IMarkerDetector;
  /** Live frame-processor capture; skips synthetic frame generation when populated. */
  captured?: CapturedInferenceData;
}

/**
 * Extract synthetic frames from video duration for stub inference.
 * Production: decode video frames on-device without uploading.
 */
export function buildVideoFrames(
  durationSec: number,
  width = 1080,
  height = 1920,
): VideoFrameInput[] {
  const frameCount = Math.max(1, Math.floor(durationSec * TARGET_INFERENCE_FPS));
  const frames: VideoFrameInput[] = [];
  for (let i = 0; i < frameCount; i++) {
    frames.push({
      frameIndex: i,
      timestampMs: Math.round((i / TARGET_INFERENCE_FPS) * 1000),
      width,
      height,
    });
  }
  return frames;
}

/** Fuse pose + marker detections into per-frame measurements. */
export function fuseFrameMeasurements(
  poses: ReturnType<IPoseEstimator['processVideoFrames']>,
  markers: ReturnType<IMarkerDetector['detectInVideoFrames']>,
  markerPhysicalCm: number,
): FrameMeasurement[] {
  const count = Math.min(poses.length, markers.length);
  const fused: FrameMeasurement[] = [];

  for (let i = 0; i < count; i++) {
    const pose = poses[i];
    const marker = markers[i];
    if (!pose || !marker || marker.heightPx <= 0) continue;

    fused.push({
      vertexY: pose.vertexY,
      heelY: pose.heelY,
      markerHeightPx: marker.heightPx,
      markerPhysicalCm,
      poseVisibility: pose.visibility,
      markerConfidence: marker.confidence,
    });
  }

  return fused;
}

/**
 * End-to-end on-device measurement pipeline (stub detectors).
 * No cloud calls — runs entirely on captured video metadata + stub inference.
 */
export function runHeightMeasurementPipeline(
  videoDurationSec: number,
  options: PipelineOptions = {},
): HeightPipelineResult | null {
  const markerPhysicalCm = options.markerPhysicalCm ?? DEFAULT_MARKER_SIZE_CM;
  const poseEstimator = options.poseEstimator ?? createPoseEstimator();
  const markerDetector = options.markerDetector ?? createMarkerDetector();

  let poses: ReturnType<IPoseEstimator['processVideoFrames']>;
  let markers: ReturnType<IMarkerDetector['detectInVideoFrames']>;

  const captured = options.captured;
  if (captured && captured.poses.length > 0 && captured.markers.length > 0) {
    poses = captured.poses;
    markers = captured.markers;
  } else {
    const frames = buildVideoFrames(videoDurationSec);
    poses = poseEstimator.processVideoFrames(frames);
    markers = markerDetector.detectInVideoFrames(frames, markerPhysicalCm);
  }
  const measurements = fuseFrameMeasurements(poses, markers, markerPhysicalCm);

  const calc = calculateHeightFromFrames({ frames: measurements });
  if (!calc) return null;

  return {
    measurementId: uuidv4(),
    heightCm: calc.heightCm,
    confidence: calc.confidence,
    calibrationMethod: options.calibrationMethod ?? DEFAULT_CALIBRATION_METHOD,
    deviceModel: options.deviceModel ?? 'unknown',
    timestamp: Date.now(),
    stableFrameCount: calc.stableFrameCount,
    rejectedFrameCount: calc.rejectedFrameCount,
    videoDurationSec,
    pixelsPerCm: calc.pixelsPerCm,
  };
}
