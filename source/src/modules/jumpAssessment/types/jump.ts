/**
 * Jump assessment states, measurements, attempts, and error codes
 */

export type JumpType = 'vertical' | 'broad';

export type JumpState =
  | 'IDLE'
  | 'READY'
  | 'COUNTDOWN'
  | 'TAKEOFF'
  | 'AIRBORNE'
  | 'PEAK'
  | 'LANDING'
  | 'COMPLETE'
  | 'INVALID';

export interface VerticalJumpMetrics {
  standingReachCm: number;
  highestReachCm: number;
  verticalJumpCm: number;
  takeoffVelocityMs: number;
  airtimeMs: number;
}

export interface BroadJumpMetrics {
  takeoffLineX: number;
  landingHeelX: number;
  broadJumpDistanceCm: number;
  landingStabilityMs: number;
}

export interface JumpAttempt {
  id: string;
  testType: JumpType;
  timestamp: number;
  verticalMetrics?: VerticalJumpMetrics;
  broadMetrics?: BroadJumpMetrics;
  isValid: boolean;
  notes?: string;
}

export interface JumpDiagnosticError {
  code:
    | 'PERSON_OUT_OF_FRAME'
    | 'MARKER_MISSING'
    | 'POOR_LIGHTING'
    | 'CAMERA_SHAKING'
    | 'PARTIAL_BODY'
    | 'FEET_NOT_VISIBLE'
    | 'FINGER_NOT_VISIBLE';
  message: string;
  severity: 'warning' | 'error';
}
