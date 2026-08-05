import { runHeightMeasurementPipeline } from '../../src/height/services/HeightMeasurementPipeline';
import { MockPoseEstimator } from '../../src/height/detection/MockPoseEstimator';
import { MockMarkerDetector } from '../../src/height/detection/MockMarkerDetector';

describe('HeightMeasurementPipeline (stub E2E)', () => {
  test('produces height result for valid 15s video without cloud calls', () => {
    const result = runHeightMeasurementPipeline(15, {
      markerPhysicalCm: 15,
      poseEstimator: new MockPoseEstimator(),
      markerDetector: new MockMarkerDetector(),
    });

    expect(result).not.toBeNull();
    expect(result!.heightCm).toBeGreaterThanOrEqual(80);
    expect(result!.heightCm).toBeLessThan(250);
    expect(result!.confidence).toBeGreaterThan(0);
    expect(result!.measurementId).toBeTruthy();
    expect(result!.calibrationMethod).toBe('aruco_15cm');
  });
});
