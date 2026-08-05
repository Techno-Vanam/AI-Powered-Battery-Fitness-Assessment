import { Platform } from 'react-native';
import type { IMarkerDetector } from '../interfaces/IMarkerDetector';
import type { MarkerDetectionResult, Point2D, VideoFrameInput } from '../types/HeightTypes';
import { DEFAULT_MARKER_SIZE_CM } from '../config/heightTestConfig';
import { frameCaptureBuffer } from './FrameCaptureBuffer';

/** QR payload pattern, e.g. "HEIGHT_MARKER_15CM" → 15 cm. */
export const QR_MARKER_PAYLOAD_PATTERN = /^HEIGHT_MARKER_(\d+(?:\.\d+)?)CM$/i;

export function parseMarkerSizeFromQrPayload(value: string): number | null {
  const match = QR_MARKER_PAYLOAD_PATTERN.exec(value.trim());
  if (!match) return null;
  const cm = parseFloat(match[1]);
  return Number.isFinite(cm) && cm > 0 ? cm : null;
}

/** Geometric confidence 0–100 from corner squareness. */
export function computeCornerSquarenessConfidence(corners: Point2D[]): number {
  if (corners.length < 4) return 0;

  const [tl, tr, br, bl] = corners;
  const dist = (a: Point2D, b: Point2D) => Math.hypot(b.x - a.x, b.y - a.y);

  const top = dist(tl, tr);
  const bottom = dist(bl, br);
  const left = dist(tl, bl);
  const right = dist(tr, br);

  if (top <= 0 || bottom <= 0 || left <= 0 || right <= 0) return 0;

  const widthAvg = (top + bottom) / 2;
  const heightAvg = (left + right) / 2;
  const aspect = heightAvg / widthAvg;
  const squareness = 1 - Math.min(Math.abs(aspect - 1), 1);
  const edgeBalance =
    1 - Math.min((Math.abs(top - bottom) + Math.abs(left - right)) / (widthAvg + heightAvg), 1);

  return Math.round(Math.min(Math.max((squareness * 0.6 + edgeBalance * 0.4) * 100, 0), 100));
}

export function averageEdgeLengthPx(corners: Point2D[]): number {
  if (corners.length < 4) return 0;
  const [tl, tr, br, bl] = corners;
  const dist = (a: Point2D, b: Point2D) => Math.hypot(b.x - a.x, b.y - a.y);
  return (dist(tl, tr) + dist(tr, br) + dist(br, bl) + dist(bl, tl)) / 4;
}

export interface QrMarkerCaptureInput {
  value: string;
  corners: Point2D[];
  frameIndex: number;
}

/** Push a QR detection from VisionCamera codeScanner into the shared buffer. */
export function captureQrMarker(input: QrMarkerCaptureInput): MarkerDetectionResult | null {
  const physicalCm = parseMarkerSizeFromQrPayload(input.value) ?? DEFAULT_MARKER_SIZE_CM;
  const heightPx = averageEdgeLengthPx(input.corners);
  if (heightPx <= 0) return null;

  const marker: MarkerDetectionResult = {
    markerId: -1,
    heightPx,
    confidence: computeCornerSquarenessConfidence(input.corners),
    corners: input.corners,
  };

  frameCaptureBuffer.addMarker(marker);
  return marker;
}

interface NativeArucoCorner {
  x: number;
  y: number;
}

interface NativeArucoResult {
  detected?: boolean;
  markerId?: number;
  markerHeightPixels?: number;
  confidence?: number;
  corners?: NativeArucoCorner[];
}

declare function detectAruco(frame: unknown): NativeArucoResult;

/** Map native OpenCV ArUco plugin output to MarkerDetectionResult. */
export function mapNativeArucoResult(
  raw: NativeArucoResult,
  _frameIndex: number,
): MarkerDetectionResult | null {
  if (!raw.detected || !raw.corners || raw.corners.length < 4) return null;

  const corners: Point2D[] = raw.corners.map(c => ({ x: c.x, y: c.y }));
  const heightPx = raw.markerHeightPixels ?? averageEdgeLengthPx(corners);
  if (heightPx <= 0) return null;

  return {
    markerId: raw.markerId ?? 0,
    heightPx,
    confidence: raw.confidence ?? computeCornerSquarenessConfidence(corners),
    corners,
  };
}

/**
 * Buffer-backed marker detector.
 * Android: native ArUco frame processor pushes via captureNativeAruco().
 * iOS / fallback: QR codeScanner pushes via captureQrMarker().
 */
export class LiveMarkerDetector implements IMarkerDetector {
  detectFromFrame(_frame: VideoFrameInput, _markerPhysicalCm: number): MarkerDetectionResult | null {
    return null;
  }

  detectInVideoFrames(
    _frames: VideoFrameInput[],
    _markerPhysicalCm: number,
  ): MarkerDetectionResult[] {
    return frameCaptureBuffer.getCaptured().markers;
  }
}

export function captureNativeAruco(raw: unknown, frameIndex: number): MarkerDetectionResult | null {
  const marker = mapNativeArucoResult(raw as NativeArucoResult, frameIndex);
  if (marker) {
    frameCaptureBuffer.addMarker(marker);
  }
  return marker;
}

export function isNativeArucoAvailable(): boolean {
  return Platform.OS === 'android';
}

export function createMarkerDetector(): IMarkerDetector {
  return new LiveMarkerDetector();
}
