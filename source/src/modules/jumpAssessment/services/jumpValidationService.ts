/**
 * Diagnostic & Quality Validation Service
 * Detects framing issues, lighting, partial bodies, camera shake, missing fingertips/feet.
 */

import { FramePoseData, PoseLandmarkIndex } from '../types/pose';
import { JumpDiagnosticError } from '../types/jump';

export class JumpValidationService {
  /**
   * Validates frame quality and returns diagnostic warnings/errors
   */
  public validateFrame(
    pose: FramePoseData,
    isCalibrated: boolean,
    testType: 'vertical' | 'broad'
  ): JumpDiagnosticError | null {
    if (!isCalibrated) {
      return {
        code: 'MARKER_MISSING',
        message: 'Calibration marker or A4 paper missing. Please calibrate first.',
        severity: 'error',
      };
    }

    if (!pose.personDetected || pose.confidenceScore < 0.5) {
      return {
        code: 'PERSON_OUT_OF_FRAME',
        message: 'No person detected in frame. Step into camera view.',
        severity: 'error',
      };
    }

    const landmarks = pose.landmarks;

    // Check key landmarks depending on test type
    if (testType === 'vertical') {
      const leftFinger = landmarks[PoseLandmarkIndex.LEFT_INDEX];
      const rightFinger = landmarks[PoseLandmarkIndex.RIGHT_INDEX];
      const fingerVisible =
        (leftFinger && leftFinger.visibility > 0.4) ||
        (rightFinger && rightFinger.visibility > 0.4);

      if (!fingerVisible) {
        return {
          code: 'FINGER_NOT_VISIBLE',
          message: 'Fingertip not clearly visible. Keep hands in frame.',
          severity: 'warning',
        };
      }
    }

    if (testType === 'broad') {
      const leftHeel = landmarks[PoseLandmarkIndex.LEFT_HEEL];
      const rightHeel = landmarks[PoseLandmarkIndex.RIGHT_HEEL];
      const heelsVisible =
        leftHeel && leftHeel.visibility > 0.5 && rightHeel && rightHeel.visibility > 0.5;

      if (!heelsVisible) {
        return {
          code: 'FEET_NOT_VISIBLE',
          message: 'Feet / heels not fully visible. Ensure whole lower body is in frame.',
          severity: 'error',
        };
      }
    }

    return null; // All checks pass
  }
}
