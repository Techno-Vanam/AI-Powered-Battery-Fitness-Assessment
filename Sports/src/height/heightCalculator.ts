import type { ArucoDetection } from '@vision/aruco/Types';
import type { PoseDetection } from '@vision/pose/PoseTypes';
import { LM } from '@vision/pose/PoseTypes';
import { isVisible } from '@vision/pose/PoseMath';
import { detectHeadVertex, type FramePixelReader } from './HeadVertexDetector';
import { detectHeel } from './HeelDetector';
import { validateForHeight } from './HeightValidator';
import type { HeightResult, HeightMeasurement } from './HeightTypes';
import {
  MIN_HEIGHT_CM,
  MAX_HEIGHT_CM,
  HEEL_VISIBILITY_THRESH,
  HEAD_VERTEX_CONFIDENCE_THRESH,
} from './HeightTypes';

// ─── Confidence calculation ───────────────────────────────────────────────────

function computeOverallConfidence(
  markerConfidence: number,
  poseConfidence: number,
  headVertexConfidence: number,
  heelBothVisible: boolean,
  markerHeightPx: number,
  visibleCount: number,
): number {
  // Normalise inputs to 0–1
  const markerScore      = markerConfidence / 100;
  const poseScore        = poseConfidence / 100;
  const headScore        = headVertexConfidence;
  const heelScore        = heelBothVisible ? 1.0 : 0.7;
  const markerSizeScore  = Math.min(markerHeightPx / 150, 1.0); // saturates at 150 px
  const landmarkScore    = Math.min(visibleCount / 28, 1.0);    // saturates at 28/33

  const weighted =
    markerScore     * 0.25 +
    poseScore       * 0.20 +
    headScore       * 0.20 +
    heelScore       * 0.15 +
    markerSizeScore * 0.10 +
    landmarkScore   * 0.10;

  return Math.round(Math.min(weighted * 100, 100));
}

// ─── Main calculator ──────────────────────────────────────────────────────────
/**
 * Calculates human standing height from ArUco calibration and pose landmarks.
 *
 * Formula:
 *   cmPerPixel   = MARKER_PHYSICAL_CM / markerHeightPixels
 *   heightPixels = heelY − headVertexY          (Y increases downward)
 *   heightCm     = heightPixels × cmPerPixel
 */
export function calculateHeight(
  aruco: ArucoDetection,
  pose: PoseDetection,
  frameWidth: number,
  frameHeight: number,
  reader?: FramePixelReader,
): HeightResult {
  const startMs = Date.now();

  // ── 1. Validate preconditions ───────────────────────────────────────────────
  const validation = validateForHeight(aruco, pose.landmarks, pose.overallConfidence);
  if (!validation.valid) {
    return {
      success: false,
      code: validation.code ?? 'UNKNOWN',
      reason: validation.reason ?? 'Validation failed',
    };
  }

  // ── 2. Calibration scale ────────────────────────────────────────────────────
  // cmPerPixel is already computed by the ArUco module from the marker's
  // physical height (21.0 cm) divided by its pixel height.
  const cmPerPixel = aruco.cmPerPixel;

  // ── 3. Head vertex detection ────────────────────────────────────────────────
  const nose     = pose.landmarks[LM.NOSE];
  const leftEar  = pose.landmarks[LM.LEFT_EAR];
  const rightEar = pose.landmarks[LM.RIGHT_EAR];

  const headDetection = detectHeadVertex(
    nose, leftEar, rightEar,
    frameWidth, frameHeight,
    reader,
  );

  if (!headDetection.found) {
    return { success: false, code: 'HEAD_DETECTION_FAILED', reason: headDetection.reason };
  }

  if (headDetection.vertexConfidence < HEAD_VERTEX_CONFIDENCE_THRESH) {
    return {
      success: false,
      code: 'HEAD_DETECTION_FAILED',
      reason: `Head vertex confidence ${(headDetection.vertexConfidence * 100).toFixed(0)}% too low`,
    };
  }

  // ── 4. Heel detection ───────────────────────────────────────────────────────
  const heelDetection = detectHeel(pose.landmarks, frameWidth, frameHeight);

  if (!heelDetection.found) {
    return { success: false, code: 'HEEL_DETECTION_FAILED', reason: heelDetection.reason };
  }

  // ── 5. Pixel distance ───────────────────────────────────────────────────────
  // Y increases downward in image space: heel is always below head vertex.
  const heightPixels = heelDetection.heelY - headDetection.vertexY;

  if (heightPixels <= 0) {
    return {
      success: false,
      code: 'SANITY_FAILED',
      reason: 'Head vertex is below heel — invalid pose geometry',
    };
  }

  // ── 6. Height in centimetres ────────────────────────────────────────────────
  const heightCm = heightPixels * cmPerPixel;

  // ── 7. Sanity bounds ────────────────────────────────────────────────────────
  if (heightCm < MIN_HEIGHT_CM || heightCm > MAX_HEIGHT_CM) {
    return {
      success: false,
      code: 'SANITY_FAILED',
      reason: `Calculated height ${heightCm.toFixed(1)} cm is outside valid range [${MIN_HEIGHT_CM}–${MAX_HEIGHT_CM} cm]`,
    };
  }

  // ── 8. Confidence ───────────────────────────────────────────────────────────
  const overallConfidence = computeOverallConfidence(
    aruco.confidence,
    pose.overallConfidence,
    headDetection.vertexConfidence,
    heelDetection.leftVisible && heelDetection.rightVisible,
    aruco.markerHeightPixels,
    pose.visibleCount,
  );

  const measurement: HeightMeasurement = {
    heightCm:          Math.round(heightCm * 10) / 10,  // 1 decimal place
    heightPixels:      Math.round(heightPixels),
    headVertex:        { x: headDetection.vertexX, y: headDetection.vertexY },
    heelPoint:         { x: heelDetection.heelX,  y: heelDetection.heelY  },
    markerScale:       cmPerPixel,
    markerConfidence:  aruco.confidence,
    poseConfidence:    pose.overallConfidence,
    overallConfidence,
    processingTimeMs:  Date.now() - startMs,
    timestamp:         Date.now(),
  };

  return { success: true, measurement };
}
