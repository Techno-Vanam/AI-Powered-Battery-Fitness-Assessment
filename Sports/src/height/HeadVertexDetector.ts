import type { Landmark } from '@vision/pose/PoseTypes';
import type { HeadVertexDetection } from './HeightTypes';
import {
  HEAD_ROI_SCALE,
  HEAD_ROI_WIDTH_SCALE,
  GRADIENT_THRESHOLD,
  PERCENTILE_REJECT,
} from './HeightTypes';

// ─── Pixel accessor interface ─────────────────────────────────────────────────
// Implemented by the caller when raw frame data is available.
// When unavailable, the geometric fallback is used.
export interface FramePixelReader {
  /** Returns luminance (0–255) at integer pixel coordinates. */
  getLuminance(x: number, y: number): number;
  width: number;
  height: number;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Clamp value to [min, max]. */
function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

/**
 * Compute the vertical luminance gradient at (x, y) using a 3-row Sobel kernel.
 * Returns absolute gradient magnitude.
 */
function verticalGradient(reader: FramePixelReader, x: number, y: number): number {
  const w = reader.width;
  const h = reader.height;
  const xc = clamp(x, 1, w - 2);
  const yc = clamp(y, 1, h - 2);

  // Sobel Gy: top row − bottom row (3 columns)
  const top =
    reader.getLuminance(xc - 1, yc - 1) +
    2 * reader.getLuminance(xc, yc - 1) +
    reader.getLuminance(xc + 1, yc - 1);
  const bot =
    reader.getLuminance(xc - 1, yc + 1) +
    2 * reader.getLuminance(xc, yc + 1) +
    reader.getLuminance(xc + 1, yc + 1);

  return Math.abs(top - bot) / 8; // normalise by kernel sum
}

/**
 * Compute the nth percentile of a numeric array.
 * Array must be sorted ascending.
 */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.floor(p * (sorted.length - 1));
  return sorted[idx];
}

// ─── Geometric fallback ───────────────────────────────────────────────────────
/**
 * When no pixel reader is available, estimate the head vertex geometrically.
 *
 * Strategy:
 *   - Face height ≈ distance from ear midpoint to nose.
 *   - Head top ≈ nose.y − faceHeight × HEAD_ROI_SCALE.
 *   - Confidence is lower because it is an estimate.
 */
function geometricHeadVertex(
  nose: Landmark,
  leftEar: Landmark,
  rightEar: Landmark,
  frameWidth: number,
  frameHeight: number,
): HeadVertexDetection {
  const earMidY = (leftEar.y + rightEar.y) / 2;
  const faceHeightNorm = nose.y - earMidY;

  if (faceHeightNorm <= 0) {
    return { found: false, reason: 'Ear landmarks above nose — invalid pose' };
  }

  const vertexYNorm = Math.max(0, nose.y - faceHeightNorm * HEAD_ROI_SCALE);
  const vertexXNorm = (nose.x + (leftEar.x + rightEar.x) / 2) / 2;

  // Confidence degrades as the estimated vertex approaches the frame edge
  const edgeMargin = 0.05;
  const confidence = vertexYNorm < edgeMargin ? 0.45 : 0.65;

  return {
    found: true,
    vertexX: vertexXNorm * frameWidth,
    vertexY: vertexYNorm * frameHeight,
    vertexConfidence: confidence,
  };
}

// ─── Main detector ────────────────────────────────────────────────────────────
/**
 * Detects the topmost point of the head (head vertex) by scanning upward
 * from the nose inside a Region Of Interest.
 *
 * Algorithm:
 *  1. Compute ROI: centered on nose X, from (nose.y − ROI_height) to nose.y.
 *  2. For each column in the ROI, scan upward row by row.
 *  3. Compute vertical luminance gradient at each row.
 *  4. Collect all rows where gradient exceeds GRADIENT_THRESHOLD.
 *  5. Apply percentile filter to reject isolated hair-strand pixels.
 *  6. The highest stable boundary row is the head vertex.
 *  7. Confidence is derived from gradient strength and ROI coverage.
 */
export function detectHeadVertex(
  nose: Landmark,
  leftEar: Landmark,
  rightEar: Landmark,
  frameWidth: number,
  frameHeight: number,
  reader?: FramePixelReader,
): HeadVertexDetection {
  // Validate inputs
  if (nose.visibility < 0.4 || nose.presence < 0.4) {
    return { found: false, reason: 'Nose landmark not sufficiently visible' };
  }

  // Fall back to geometric estimate when no pixel data is available
  if (!reader) {
    return geometricHeadVertex(nose, leftEar, rightEar, frameWidth, frameHeight);
  }

  // ── Build ROI in pixel space ────────────────────────────────────────────────
  const nosePx  = Math.round(nose.x * frameWidth);
  const nosePy  = Math.round(nose.y * frameHeight);
  const earMidY = ((leftEar.y + rightEar.y) / 2) * frameHeight;

  const faceHeightPx = Math.max(nosePy - earMidY, 10);
  const roiHeight    = Math.round(faceHeightPx * HEAD_ROI_SCALE);
  const roiHalfW     = Math.round(faceHeightPx * HEAD_ROI_WIDTH_SCALE * 0.5);

  const roiTop    = clamp(nosePy - roiHeight, 0, reader.height - 1);
  const roiBottom = clamp(nosePy, 0, reader.height - 1);
  const roiLeft   = clamp(nosePx - roiHalfW, 0, reader.width - 1);
  const roiRight  = clamp(nosePx + roiHalfW, 0, reader.width - 1);

  if (roiTop >= roiBottom || roiLeft >= roiRight) {
    return geometricHeadVertex(nose, leftEar, rightEar, frameWidth, frameHeight);
  }

  // ── Scan each column, collect edge rows ────────────────────────────────────
  // For each column, find the topmost row with a gradient above threshold.
  const edgeRows: number[] = [];

  for (let x = roiLeft; x <= roiRight; x++) {
    for (let y = roiTop; y <= roiBottom; y++) {
      const grad = verticalGradient(reader, x, y);
      if (grad >= GRADIENT_THRESHOLD) {
        edgeRows.push(y);
        break; // take only the topmost edge per column
      }
    }
  }

  if (edgeRows.length === 0) {
    // No gradient edges found — fall back to geometric
    return geometricHeadVertex(nose, leftEar, rightEar, frameWidth, frameHeight);
  }

  // ── Percentile filter: reject outlier rows (isolated hair strands) ─────────
  const sorted = [...edgeRows].sort((a, b) => a - b);
  const rejectCount = Math.floor(sorted.length * PERCENTILE_REJECT);
  const filtered = sorted.slice(rejectCount); // remove lowest (highest on screen) outliers

  if (filtered.length === 0) {
    return geometricHeadVertex(nose, leftEar, rightEar, frameWidth, frameHeight);
  }

  // ── Identify the highest stable boundary ──────────────────────────────────
  // "Stable" = at least 20% of columns agree within ±3 rows of the candidate.
  const candidateY = filtered[0]; // topmost after filtering
  const STABILITY_BAND = 3;
  const agreeing = filtered.filter(r => Math.abs(r - candidateY) <= STABILITY_BAND).length;
  const stabilityRatio = agreeing / filtered.length;

  // If fewer than 30% of columns agree, fall back to geometric
  if (stabilityRatio < 0.30) {
    return geometricHeadVertex(nose, leftEar, rightEar, frameWidth, frameHeight);
  }

  // ── Compute vertex X as the column with the strongest gradient at candidateY
  let bestGrad = -1;
  let vertexX = nosePx;
  for (let x = roiLeft; x <= roiRight; x++) {
    const g = verticalGradient(reader, x, candidateY);
    if (g > bestGrad) {
      bestGrad = g;
      vertexX = x;
    }
  }

  // ── Confidence ─────────────────────────────────────────────────────────────
  // Based on: gradient strength, column coverage, stability ratio
  const columnCoverage = edgeRows.length / Math.max(roiRight - roiLeft, 1);
  const gradScore      = clamp(bestGrad / 60, 0, 1);   // 60 = "strong" gradient
  const confidence     = (gradScore * 0.4 + columnCoverage * 0.3 + stabilityRatio * 0.3);

  return {
    found: true,
    vertexX,
    vertexY: candidateY,
    vertexConfidence: clamp(confidence, 0, 1),
  };
}
