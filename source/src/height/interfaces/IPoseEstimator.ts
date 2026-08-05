import type { PoseSegmentationResult, VideoFrameInput } from '../types/HeightTypes';

/**
 * On-device pose / segmentation estimator.
 * Production: bind to TFLite frame processor via native module.
 */
export interface IPoseEstimator {
  /**
   * Process a single camera frame.
   * @returns segmentation boundary vertex + heel, or null if body not detected.
   */
  estimateFromFrame(frame: VideoFrameInput): PoseSegmentationResult | null;

  /** Batch-process frames extracted from recorded video. */
  processVideoFrames(frames: VideoFrameInput[]): PoseSegmentationResult[];
}
