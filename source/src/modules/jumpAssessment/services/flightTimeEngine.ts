/**
 * Biomechanical Flight-Time (Airtime) Physics Engine for Jump Assessment
 *
 * Implements scientific kinematic formulas:
 * 1. Flight-time Jump Height: H = (g * t^2) / 8  [where g = 9.80665 m/s^2]
 * 2. Takeoff Velocity: v_takeoff = g * (t / 2)
 * 3. Sayers Peak Power Equation: Peak Power (W) = 60.7 * H(cm) + 45.3 * BodyMass(kg) - 2055
 * 4. Relative Power Output: Power (W/kg) = Peak Power / BodyMass(kg)
 */

export interface AirtimeJumpMetrics {
  takeoffTimestampMs: number;
  landingTimestampMs: number;
  flightTimeMs: number;
  jumpHeightCm: number;
  takeoffVelocityMs: number;
  peakPowerWatts?: number;
  relativePowerWkg?: number;
}

export class FlightTimeEngine {
  public static readonly GRAVITY_ACCELERATION = 9.80665; // m/s^2

  /**
   * Calculates flight time in milliseconds between takeoff and landing timestamps.
   */
  public calculateFlightTimeMs(
    takeoffTimestampMs: number,
    landingTimestampMs: number
  ): number {
    if (landingTimestampMs <= takeoffTimestampMs) {
      return 0;
    }
    return landingTimestampMs - takeoffTimestampMs;
  }

  /**
   * Calculates jump height in centimeters from airtime (flight time) in milliseconds.
   * Formula: H = (g * t^2) / 8
   */
  public calculateJumpHeightCm(flightTimeMs: number): number {
    if (flightTimeMs <= 0) return 0;
    const tSec = flightTimeMs / 1000.0;
    const heightMeters = (FlightTimeEngine.GRAVITY_ACCELERATION * tSec * tSec) / 8.0;
    const heightCm = heightMeters * 100.0;
    return Number(heightCm.toFixed(1));
  }

  /**
   * Calculates takeoff velocity in m/s.
   * Formula: v = g * (t / 2)
   */
  public calculateTakeoffVelocityMs(flightTimeMs: number): number {
    if (flightTimeMs <= 0) return 0;
    const tSec = flightTimeMs / 1000.0;
    const vMs = FlightTimeEngine.GRAVITY_ACCELERATION * (tSec / 2.0);
    return Number(vMs.toFixed(2));
  }

  /**
   * Calculates Sayers Peak Power output in Watts.
   * Equation: P_peak (W) = 60.7 * H(cm) + 45.3 * BodyMass(kg) - 2055
   */
  public calculateSayersPeakPower(
    jumpHeightCm: number,
    bodyMassKg: number
  ): number {
    if (jumpHeightCm <= 0 || bodyMassKg <= 0) return 0;
    const powerW = 60.7 * jumpHeightCm + 45.3 * bodyMassKg - 2055;
    return Number(Math.max(0, powerW).toFixed(1));
  }

  /**
   * Calculates relative power in Watts per Kilogram (W/kg).
   */
  public calculateRelativePower(
    peakPowerW: number,
    bodyMassKg: number
  ): number {
    if (peakPowerW <= 0 || bodyMassKg <= 0) return 0;
    return Number((peakPowerW / bodyMassKg).toFixed(2));
  }

  /**
   * Comprehensive Airtime Jump Evaluation
   */
  public evaluateAirtimeJump(
    takeoffTimestampMs: number,
    landingTimestampMs: number,
    bodyMassKg: number = 70.0
  ): AirtimeJumpMetrics {
    const flightTimeMs = this.calculateFlightTimeMs(takeoffTimestampMs, landingTimestampMs);
    const jumpHeightCm = this.calculateJumpHeightCm(flightTimeMs);
    const takeoffVelocityMs = this.calculateTakeoffVelocityMs(flightTimeMs);

    let peakPowerWatts: number | undefined;
    let relativePowerWkg: number | undefined;

    if (bodyMassKg > 0) {
      peakPowerWatts = this.calculateSayersPeakPower(jumpHeightCm, bodyMassKg);
      relativePowerWkg = this.calculateRelativePower(peakPowerWatts, bodyMassKg);
    }

    return {
      takeoffTimestampMs,
      landingTimestampMs,
      flightTimeMs,
      jumpHeightCm,
      takeoffVelocityMs,
      peakPowerWatts,
      relativePowerWkg,
    };
  }
}

export const flightTimeEngine = new FlightTimeEngine();
