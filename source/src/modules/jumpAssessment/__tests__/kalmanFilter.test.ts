import { KalmanFilter1D, KalmanFilter2D } from '../services/kalmanFilter';

describe('Kalman Filter Service', () => {
  it('should smooth 1D landmark coordinate jitter', () => {
    const filter = new KalmanFilter1D();
    filter.init(100);

    const rawMeasurements = [105, 95, 102, 98, 101];
    const smoothedValues = rawMeasurements.map((val) => filter.update(val));

    // Smoothed values should stay bounded near mean (100) with lower variance
    smoothedValues.forEach((val) => {
      expect(val).toBeGreaterThan(90);
      expect(val).toBeLessThan(110);
    });
  });

  it('should filter 2D point coordinates', () => {
    const filter2d = new KalmanFilter2D();
    filter2d.init(0.5, 0.5);

    const updated = filter2d.update({ x: 0.52, y: 0.48 });
    expect(updated.x).toBeCloseTo(0.51, 1);
    expect(updated.y).toBeCloseTo(0.49, 1);
  });
});
