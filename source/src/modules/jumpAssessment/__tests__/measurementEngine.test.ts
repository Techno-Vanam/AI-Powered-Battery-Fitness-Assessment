import { MeasurementEngine } from '../services/measurementEngine';

describe('Measurement Engine', () => {
  let engine: MeasurementEngine;

  beforeEach(() => {
    engine = new MeasurementEngine();
  });

  it('should correctly compute vertical jump metric in CM', () => {
    const standingReachPixels = 200; // 20 cm at 10 px/cm
    const highestReachPixels = 650; // 65 cm at 10 px/cm
    const pixelsPerCm = 10;

    const result = engine.computeVerticalJump(standingReachPixels, highestReachPixels, pixelsPerCm);

    expect(result.standingReachCm).toBe(20.0);
    expect(result.highestReachCm).toBe(65.0);
    expect(result.verticalJumpCm).toBe(45.0);
    expect(result.takeoffVelocityMs).toBeGreaterThan(0);
  });

  it('should correctly compute broad jump distance in CM', () => {
    const takeoffX = 100;
    const landingX = 1600; // 1500 pixels delta
    const pixelsPerCm = 10; // 150 cm distance

    const result = engine.computeBroadJump(takeoffX, landingX, pixelsPerCm);

    expect(result.broadJumpDistanceCm).toBe(150.0);
  });
});
