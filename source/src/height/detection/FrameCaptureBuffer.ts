import type {
  MarkerDetectionResult,
  PoseSegmentationResult,
} from '../types/HeightTypes';

export interface CapturedInferenceData {
  poses: PoseSegmentationResult[];
  markers: MarkerDetectionResult[];
}

/**
 * Thread-safe-enough capture store: frame processor pushes via runOnJS,
 * pipeline reads on stop. Reset at recording start.
 */
class FrameCaptureBuffer {
  private poses: PoseSegmentationResult[] = [];
  private markers: MarkerDetectionResult[] = [];
  private frameCounter = 0;

  reset(): void {
    this.poses = [];
    this.markers = [];
    this.frameCounter = 0;
  }

  nextFrameIndex(): number {
    const idx = this.frameCounter;
    this.frameCounter += 1;
    return idx;
  }

  addPose(pose: PoseSegmentationResult): void {
    this.poses.push(pose);
  }

  addMarker(marker: MarkerDetectionResult): void {
    this.markers.push(marker);
  }

  getCaptured(): CapturedInferenceData {
    return {
      poses: [...this.poses],
      markers: [...this.markers],
    };
  }

  get frameCount(): number {
    return this.frameCounter;
  }
}

export const frameCaptureBuffer = new FrameCaptureBuffer();
