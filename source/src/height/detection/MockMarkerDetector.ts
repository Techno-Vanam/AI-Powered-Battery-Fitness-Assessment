import type { IMarkerDetector } from '../interfaces/IMarkerDetector';
import type { MarkerDetectionResult, VideoFrameInput } from '../types/HeightTypes';
import { LiveMarkerDetector } from './LiveMarkerDetector';

/**
 * Stub ArUco marker detector for demo / unit tests.
 *
 * // TODO(native-model): Replace with OpenCV ArUco DICT_MIP_36h12 native module.
 * Expected native I/O:
 *   Input:  { width, height, yPlane: Uint8Array, dictionary: 'MIP_36h12' }
 *   Output: { markerId, corners: [{x,y}×4], heightPx, confidence: 0-100 }
 */
export class MockMarkerDetector implements IMarkerDetector {
  private readonly markerHeightPx: number;
  private readonly confidence: number;
  private readonly markerId: number;

  constructor(options?: { markerHeightPx?: number; confidence?: number; markerId?: number }) {
    this.markerHeightPx = options?.markerHeightPx ?? 150;
    this.confidence = options?.confidence ?? 88;
    this.markerId = options?.markerId ?? 0;
  }

  detectFromFrame(
    frame: VideoFrameInput,
    _markerPhysicalCm: number,
  ): MarkerDetectionResult | null {
    const cx = frame.width * 0.75;
    const cy = frame.height * 0.85;
    const half = this.markerHeightPx / 2;
    return {
      markerId: this.markerId,
      heightPx: this.markerHeightPx + (frame.frameIndex % 3) * 0.2,
      confidence: this.confidence,
      corners: [
        { x: cx - half, y: cy - half },
        { x: cx + half, y: cy - half },
        { x: cx + half, y: cy + half },
        { x: cx - half, y: cy + half },
      ],
    };
  }

  detectInVideoFrames(
    frames: VideoFrameInput[],
    markerPhysicalCm: number,
  ): MarkerDetectionResult[] {
    return frames
      .map(f => this.detectFromFrame(f, markerPhysicalCm))
      .filter((r): r is MarkerDetectionResult => r !== null);
  }
}

export function createMarkerDetector(): IMarkerDetector {
  return new LiveMarkerDetector();
}
