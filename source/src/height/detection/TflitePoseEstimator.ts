import type { IPoseEstimator } from '../interfaces/IPoseEstimator';
import type { PoseSegmentationResult, VideoFrameInput } from '../types/HeightTypes';
import { frameCaptureBuffer } from './FrameCaptureBuffer';

/**
 * Buffer-backed pose estimator fed by the TFLite frame processor worklet.
 * Does not run inference in estimateFromFrame — live capture pushes results via addPose().
 */
export class TflitePoseEstimator implements IPoseEstimator {
  estimateFromFrame(_frame: VideoFrameInput): PoseSegmentationResult | null {
    return null;
  }

  processVideoFrames(_frames: VideoFrameInput[]): PoseSegmentationResult[] {
    return frameCaptureBuffer.getCaptured().poses;
  }
}

export function createPoseEstimator(): IPoseEstimator {
  return new TflitePoseEstimator();
}
