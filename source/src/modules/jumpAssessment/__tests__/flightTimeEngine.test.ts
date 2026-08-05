import { FlightTimeEngine } from '../services/flightTimeEngine';

describe('FlightTimeEngine', () => {
  let engine: FlightTimeEngine;

  beforeEach(() => {
    engine = new FlightTimeEngine();
  });

  it('correctly calculates flight time in milliseconds', () => {
    const takeoff = 1000;
    const landing = 1550;
    expect(engine.calculateFlightTimeMs(takeoff, landing)).toBe(550);
  });

  it('returns 0 flight time if landing is before or equal to takeoff', () => {
    expect(engine.calculateFlightTimeMs(1500, 1000)).toBe(0);
    expect(engine.calculateFlightTimeMs(1000, 1000)).toBe(0);
  });

  it('calculates accurate jump height for 500ms airtime (approx 30.6 cm)', () => {
    const flightTimeMs = 500;
    const heightCm = engine.calculateJumpHeightCm(flightTimeMs);
    expect(heightCm).toBe(30.6);
  });

  it('calculates accurate jump height for 600ms airtime (approx 44.1 cm)', () => {
    const flightTimeMs = 600;
    const heightCm = engine.calculateJumpHeightCm(flightTimeMs);
    expect(heightCm).toBe(44.1);
  });

  it('calculates takeoff velocity for 500ms airtime (approx 2.45 m/s)', () => {
    const velocity = engine.calculateTakeoffVelocityMs(500);
    expect(velocity).toBe(2.45);
  });

  it('computes Sayers Peak Power for 40cm jump and 70kg athlete', () => {
    // 60.7 * 40 + 45.3 * 70 - 2055 = 2428 + 3171 - 2055 = 3544 Watts
    const power = engine.calculateSayersPeakPower(40.0, 70.0);
    expect(power).toBe(3544.0);
  });

  it('evaluates comprehensive airtime metrics cleanly', () => {
    const result = engine.evaluateAirtimeJump(1000, 1550, 75.0);
    expect(result.flightTimeMs).toBe(550);
    expect(result.jumpHeightCm).toBeGreaterThan(30);
    expect(result.takeoffVelocityMs).toBeGreaterThan(2);
    expect(result.peakPowerWatts).toBeDefined();
    expect(result.relativePowerWkg).toBeDefined();
  });
});
