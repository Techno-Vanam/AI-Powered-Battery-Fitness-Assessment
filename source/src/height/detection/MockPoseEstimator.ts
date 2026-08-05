import type { IPoseEstimator } from '../interfaces/IPoseEstimator';
import type { PoseSegmentationResult, VideoFrameInput } from '../types/HeightTypes';
import { TflitePoseEstimator } from './TflitePoseEstimator';

/**
 * Stub pose estimator for demo / unit tests.
 *
 * // TODO(native-model): Replace with TFLite segmentation model via frame processor.
 * Expected native I/O:
 *   Input:  { width, height, yPlane: Uint8Array, timestampMs }
 *   Output: { vertexY: number, heelY: number, maskConfidence: 0-1 }
 */
export class MockPoseEstimator implements IPoseEstimator {
  private readonly baseVertexY: number;
  private readonly baseHeelY: number;
  private readonly visibility: number;

  constructor(options?: { vertexY?: number; heelY?: number; visibility?: number }) {
    this.baseVertexY = options?.vertexY ?? 120;
    this.baseHeelY = options?.heelY ?? 920;
    this.visibility = options?.visibility ?? 0.92;
  }

  estimateFromFrame(frame: VideoFrameInput): PoseSegmentationResult | null {
    const jitter = (frame.frameIndex % 5) * 0.4;
    return {
      vertexY: this.baseVertexY + jitter,
      heelY: this.baseHeelY + jitter * 0.5,
      visibility: this.visibility,
      frameIndex: frame.frameIndex,
      timestampMs: frame.timestampMs,
    };
  }

  processVideoFrames(frames: VideoFrameInput[]): PoseSegmentationResult[] {
    return frames
      .map(f => this.estimateFromFrame(f))
      .filter((r): r is PoseSegmentationResult => r !== null);
  }
}

export function createPoseEstimator(): IPoseEstimator {
  // TODO(native-model): fall back to MockPoseEstimator when model asset missing (simulator/dev).
  return new TflitePoseEstimator();
}
