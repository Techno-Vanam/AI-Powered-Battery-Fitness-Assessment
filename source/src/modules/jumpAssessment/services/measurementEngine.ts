/**
 * Kinematic Measurement Engine for Vertical & Broad Jump
 */

import { FramePoseData, PoseLandmarkIndex } from '../types/pose';
import { VerticalJumpMetrics, BroadJumpMetrics } from '../types/jump';
import { pixelsToCentimeters } from '../utils/kinematics';

export class MeasurementEngine {
  /**
   * Calculates fingertip height from floor in frame pixels.
   * Uses finger landmarks (or wrist + hand length ratio fallback).
   */
  public calculateFingertipY(pose: FramePoseData, frameHeight: number): number {
    const landmarks = pose.landmarks;

    const leftFinger = landmarks[PoseLandmarkIndex.LEFT_INDEX];
    const rightFinger = landmarks[PoseLandmarkIndex.RIGHT_INDEX];

    let highestYPixel = frameHeight; // 0 is top of image, frameHeight is bottom/floor level

    if (leftFinger && leftFinger.visibility > 0.5) {
      const yPixel = leftFinger.y * frameHeight;
      if (yPixel < highestYPixel) highestYPixel = yPixel;
    }

    if (rightFinger && rightFinger.visibility > 0.5) {
      const yPixel = rightFinger.y * frameHeight;
      if (yPixel < highestYPixel) highestYPixel = yPixel;
    }

    // Return height measured upward from bottom of frame (floor)
    return frameHeight - highestYPixel;
  }

  /**
   * Computes Vertical Jump Metrics
   */
  public computeVerticalJump(
    standingReachPixels: number,
    highestReachPixels: number,
    pixelsPerCm: number,
    airtimeMs: number = 0
  ): VerticalJumpMetrics {
    const standingReachCm = pixelsToCentimeters(standingReachPixels, pixelsPerCm);
    const highestReachCm = pixelsToCentimeters(highestReachPixels, pixelsPerCm);
    const verticalJumpCm = Math.max(0, highestReachCm - standingReachCm);

    // Approximate takeoff velocity using jump height formula: v = sqrt(2 * g * h)
    const heightInMeters = verticalJumpCm / 100.0;
    const takeoffVelocityMs = Math.sqrt(2 * 9.81 * heightInMeters);

    return {
      standingReachCm: Number(standingReachCm.toFixed(1)),
      highestReachCm: Number(highestReachCm.toFixed(1)),
      verticalJumpCm: Number(verticalJumpCm.toFixed(1)),
      takeoffVelocityMs: Number(takeoffVelocityMs.toFixed(2)),
      airtimeMs,
    };
  }

  /**
   * Computes Broad Jump Metrics
   */
  public computeBroadJump(
    takeoffLineXPixel: number,
    landingHeelXPixel: number,
    pixelsPerCm: number,
    landingStabilityMs: number = 500
  ): BroadJumpMetrics {
    const deltaPixels = Math.abs(landingHeelXPixel - takeoffLineXPixel);
    const distanceCm = pixelsToCentimeters(deltaPixels, pixelsPerCm);

    return {
      takeoffLineX: takeoffLineXPixel,
      landingHeelX: landingHeelXPixel,
      broadJumpDistanceCm: Number(distanceCm.toFixed(1)),
      landingStabilityMs,
    };
  }
}
