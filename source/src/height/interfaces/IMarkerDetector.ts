import type { MarkerDetectionResult, VideoFrameInput } from '../types/HeightTypes';

/**
 * Reference marker detector (ArUco DICT_MIP_36h12 by default).
 * Production: bind to OpenCV/TFLite native module.
 */
export interface IMarkerDetector {
  /**
   * Detect calibration marker in a single frame.
   * @param markerPhysicalCm known printed marker edge length in cm.
   */
  detectFromFrame(
    frame: VideoFrameInput,
    markerPhysicalCm: number,
  ): MarkerDetectionResult | null;

  /** Scan video frames and return best marker observation per frame. */
  detectInVideoFrames(
    frames: VideoFrameInput[],
    markerPhysicalCm: number,
  ): MarkerDetectionResult[];
}
