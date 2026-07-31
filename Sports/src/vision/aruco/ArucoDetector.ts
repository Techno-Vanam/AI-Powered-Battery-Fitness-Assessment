import {
  ArucoResult,
  ArucoDetection,
  Corner,
  EXPECTED_MARKER_ID,
  MIN_CONFIDENCE,
  MIN_MARKER_PX,
} from './Types';

// Raw shape returned by the native Frame Processor plugin
interface RawNativeResult {
  detected: boolean;
  markerId?: number;
  centerX?: number;
  centerY?: number;
  markerWidthPixels?: number;
  markerHeightPixels?: number;
  rotationAngle?: number;
  cmPerPixel?: number;
  confidence?: number;
  corners?: Array<{ x: number; y: number }>;
  error?: string;
}

/**
 * Validates and maps the raw native plugin output to a typed ArucoResult.
 * All validation rules are applied here so the frame processor worklet
 * stays as thin as possible.
 */
export function parseNativeResult(raw: RawNativeResult): ArucoResult {
  if (!raw.detected) {
    return { detected: false, reason: 'MARKER_NOT_FOUND' };
  }

  if (raw.error === 'OPENCV_NOT_INIT') {
    return { detected: false, reason: 'OPENCV_NOT_INIT' };
  }

  if (raw.markerId !== EXPECTED_MARKER_ID) {
    return { detected: false, reason: 'WRONG_MARKER_ID' };
  }

  const heightPx = raw.markerHeightPixels ?? 0;
  const widthPx  = raw.markerWidthPixels  ?? 0;

  if (heightPx < MIN_MARKER_PX || widthPx < MIN_MARKER_PX) {
    return { detected: false, reason: 'MARKER_TOO_SMALL' };
  }

  const confidence = raw.confidence ?? 0;
  if (confidence < MIN_CONFIDENCE) {
    return { detected: false, reason: 'LOW_CONFIDENCE' };
  }

  const rawCorners = raw.corners;
  if (!rawCorners || rawCorners.length < 4) {
    return { detected: false, reason: 'MARKER_NOT_FOUND' };
  }

  const corners: [Corner, Corner, Corner, Corner] = [
    { x: rawCorners[0].x, y: rawCorners[0].y },
    { x: rawCorners[1].x, y: rawCorners[1].y },
    { x: rawCorners[2].x, y: rawCorners[2].y },
    { x: rawCorners[3].x, y: rawCorners[3].y },
  ];

  const detection: ArucoDetection = {
    detected: true,
    markerId:           raw.markerId,
    markerWidthPixels:  widthPx,
    markerHeightPixels: heightPx,
    markerCenter:       { x: raw.centerX ?? 0, y: raw.centerY ?? 0 },
    rotationAngle:      raw.rotationAngle ?? 0,
    cmPerPixel:         raw.cmPerPixel ?? 0,
    confidence,
    corners,
  };

  return detection;
}
