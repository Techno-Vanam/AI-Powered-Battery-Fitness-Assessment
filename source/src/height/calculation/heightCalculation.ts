/**
 * Pure height calculation — framework-free, synchronous, unit-testable.
 * No React, no native calls.
 */

import type {
  FrameMeasurement,
  HeightCalculationInput,
  HeightCalculationResult,
} from '../types/HeightTypes';
import { MIN_HEIGHT_CM, MAX_HEIGHT_CM } from '../config/heightTestConfig';

const DEFAULT_MIN_STABLE_FRAMES = 5;
const DEFAULT_MAX_VARIATION = 0.015;

/** pixels-per-cm scale from known marker size. */
export function computePixelsPerCm(markerHeightPx: number, markerPhysicalCm: number): number {
  if (markerHeightPx <= 0 || markerPhysicalCm <= 0) return 0;
  return markerHeightPx / markerPhysicalCm;
}

/** Height in cm for a single frame (vertex-to-heel pixel distance × scale). */
export function computeFrameHeightCm(frame: FrameMeasurement): number | null {
  const pixelsPerCm = computePixelsPerCm(frame.markerHeightPx, frame.markerPhysicalCm);
  if (pixelsPerCm <= 0) return null;

  const heightPixels = frame.heelY - frame.vertexY;
  if (heightPixels <= 0) return null;

  return heightPixels / pixelsPerCm;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((acc, v) => acc + (v - m) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Filter frames whose height deviates too far from the running median.
 * Returns indices of stable frames.
 */
export function selectStableFrameIndices(
  heightsCm: number[],
  maxVariation = DEFAULT_MAX_VARIATION,
): number[] {
  if (heightsCm.length === 0) return [];

  const median = [...heightsCm].sort((a, b) => a - b)[Math.floor(heightsCm.length / 2)];
  if (median <= 0) return [];

  const stable: number[] = [];
  for (let i = 0; i < heightsCm.length; i++) {
    const deviation = Math.abs(heightsCm[i] - median) / median;
    if (deviation <= maxVariation) stable.push(i);
  }

  return stable.length > 0 ? stable : heightsCm.map((_, i) => i);
}

/**
 * Confidence 0–100 from pose visibility, marker confidence, and frame stability.
 */
export function computeConfidence(
  frames: FrameMeasurement[],
  stableIndices: number[],
  heightStdDevCm: number,
  meanHeightCm: number,
): number {
  if (stableIndices.length === 0 || meanHeightCm <= 0) return 0;

  const stableFrames = stableIndices.map(i => frames[i]);
  const avgPoseVis =
    stableFrames.reduce((s, f) => s + f.poseVisibility, 0) / stableFrames.length;
  const avgMarkerConf =
    stableFrames.reduce((s, f) => s + f.markerConfidence, 0) / stableFrames.length / 100;

  const cv = heightStdDevCm / meanHeightCm;
  const stabilityScore = Math.max(0, 1 - cv / 0.02);

  const weighted =
    avgPoseVis * 0.35 + avgMarkerConf * 0.35 + stabilityScore * 0.3;

  return Math.round(Math.min(Math.max(weighted * 100, 0), 100));
}

/**
 * Aggregate stable frames into final height + confidence.
 */
export function calculateHeightFromFrames(
  input: HeightCalculationInput,
): HeightCalculationResult | null {
  const {
    frames,
    minStableFrames = DEFAULT_MIN_STABLE_FRAMES,
    maxHeightVariation = DEFAULT_MAX_VARIATION,
  } = input;

  if (frames.length === 0) return null;

  const perFrameHeights: number[] = [];
  const validIndices: number[] = [];

  for (let i = 0; i < frames.length; i++) {
    const h = computeFrameHeightCm(frames[i]);
    if (h !== null && h >= MIN_HEIGHT_CM && h <= MAX_HEIGHT_CM) {
      perFrameHeights.push(h);
      validIndices.push(i);
    }
  }

  if (perFrameHeights.length === 0) return null;

  const stableLocalIndices = selectStableFrameIndices(perFrameHeights, maxHeightVariation);
  const stableGlobalIndices = stableLocalIndices.map(li => validIndices[li]);
  const stableHeights = stableLocalIndices.map(li => perFrameHeights[li]);

  if (stableHeights.length < minStableFrames) return null;

  const heightCm = Math.round(mean(stableHeights) * 10) / 10;
  const heightStdDevCm = stdDev(stableHeights);

  const stableFrames = stableGlobalIndices.map(i => frames[i]);
  const avgMarkerPx = mean(stableFrames.map(f => f.markerHeightPx));
  const markerPhysicalCm = stableFrames[0].markerPhysicalCm;
  const pixelsPerCm = computePixelsPerCm(avgMarkerPx, markerPhysicalCm);
  const heightPixels = Math.round(heightCm * pixelsPerCm);

  const confidence = computeConfidence(
    frames,
    stableGlobalIndices,
    heightStdDevCm,
    heightCm,
  );

  return {
    heightCm,
    confidence,
    stableFrameCount: stableHeights.length,
    rejectedFrameCount: frames.length - stableHeights.length,
    pixelsPerCm,
    heightPixels,
    heightStdDevCm,
  };
}
