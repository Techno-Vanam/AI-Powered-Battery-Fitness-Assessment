import type { ArucoResult } from '@vision/aruco/Types';
import type { PoseResult, Landmark } from '@vision/pose/PoseTypes';
import { LM } from '@vision/pose/PoseTypes';
import { isVisible } from '@vision/pose/PoseMath';
import type {
  GuidanceCondition,
  GuidanceCheckResult,
  GuidanceState,
} from './HeightTypes';

// ─── Motion Tracker for Motion Blur Detection ──────────────────────────────────
export class MotionTracker {
  private history: Array<{ noseX: number; noseY: number; heelY: number; timestamp: number }> = [];
  private readonly windowSize = 8;
  private readonly motionThreshold = 0.012; // normalized distance threshold

  public push(landmarks: Landmark[], timestamp = Date.now()): number {
    const nose = landmarks[LM.NOSE];
    const leftHeel = landmarks[LM.LEFT_HEEL];
    const rightHeel = landmarks[LM.RIGHT_HEEL];

    const heelY = isVisible(leftHeel) && isVisible(rightHeel)
      ? (leftHeel.y + rightHeel.y) / 2
      : isVisible(leftHeel) ? leftHeel.y : isVisible(rightHeel) ? rightHeel.y : 0.9;

    if (nose && isVisible(nose)) {
      this.history.push({ noseX: nose.x, noseY: nose.y, heelY, timestamp });
      if (this.history.length > this.windowSize) {
        this.history.shift();
      }
    }

    return this.getMotionScore();
  }

  public getMotionScore(): number {
    if (this.history.length < 3) return 0;

    let totalDiff = 0;
    for (let i = 1; i < this.history.length; i++) {
      const prev = this.history[i - 1];
      const curr = this.history[i];
      const dx = curr.noseX - prev.noseX;
      const dy = curr.noseY - prev.noseY;
      const dh = curr.heelY - prev.heelY;
      totalDiff += Math.sqrt(dx * dx + dy * dy) + Math.abs(dh);
    }

    return totalDiff / (this.history.length - 1);
  }

  public isMotionDetected(): boolean {
    return this.getMotionScore() > this.motionThreshold;
  }

  public reset(): void {
    this.history = [];
  }
}

// ─── Evaluation Priority Order ────────────────────────────────────────────────
// The system evaluates conditions in order and presents the highest-priority message.
const PRIORITY_ORDER: GuidanceCondition[] = [
  'MULTIPLE_PEOPLE',
  'MARKER_MISSING',
  'MARKER_TOO_SMALL',
  'FEET_OUTSIDE',
  'HEAD_OUTSIDE',
  'PERSON_TOO_CLOSE',
  'PERSON_TOO_FAR',
  'CAMERA_TILTED',
  'MOTION_BLUR',
  'POOR_LIGHTING',
];

export function evaluateGuidance(
  aruco: ArucoResult | null,
  pose: PoseResult | null,
  motionTracker: MotionTracker,
  countdownVal: number | null = null,
): GuidanceState {
  const checks: Record<GuidanceCondition, GuidanceCheckResult> = {
    MULTIPLE_PEOPLE:  { passed: true, message: 'Only 1 Person in Frame' },
    MARKER_MISSING:   { passed: true, message: 'Keep Marker Visible' },
    MARKER_TOO_SMALL: { passed: true, message: 'Marker Too Small - Move Closer' },
    FEET_OUTSIDE:     { passed: true, message: 'Show Both Feet' },
    HEAD_OUTSIDE:     { passed: true, message: 'Head Outside Frame' },
    PERSON_TOO_CLOSE: { passed: true, message: 'Move Back' },
    PERSON_TOO_FAR:   { passed: true, message: 'Move Forward' },
    CAMERA_TILTED:    { passed: true, message: 'Stand Straight' },
    MOTION_BLUR:      { passed: true, message: 'Hold Still' },
    POOR_LIGHTING:    { passed: true, message: 'Poor Lighting - Increase Light' },
  };

  // 1. Multiple People Check
  if (pose && !pose.detected && (pose.status === 'MULTIPLE_PEOPLE' || pose.reason.toLowerCase().includes('multiple'))) {
    checks.MULTIPLE_PEOPLE = { passed: false, message: 'Multiple People Detected' };
  }

  // 2. Marker Missing Check
  const arucoDet = aruco && aruco.detected ? (aruco as Extract<ArucoResult, { detected: true }>) : null;
  if (!arucoDet) {
    checks.MARKER_MISSING = { passed: false, message: 'Keep Marker Visible' };
  }

  // 3. Marker Too Small Check
  if (arucoDet) {
    const minMarkerPx = 32;
    if (arucoDet.markerHeightPixels > 0 && arucoDet.markerHeightPixels < minMarkerPx) {
      checks.MARKER_TOO_SMALL = { passed: false, message: 'Marker Too Small - Move Closer' };
    }
  }

  // Pose checks
  const poseDet = pose && pose.detected ? (pose as Extract<PoseResult, { detected: true }>) : null;
  const lms = poseDet?.landmarks ?? null;

  if (lms && lms.length >= 33) {
    // Track motion blur
    motionTracker.push(lms);

    const nose = lms[LM.NOSE];
    const leftEar = lms[LM.LEFT_EAR];
    const rightEar = lms[LM.RIGHT_EAR];
    const leftHeel = lms[LM.LEFT_HEEL];
    const rightHeel = lms[LM.RIGHT_HEEL];
    const leftAnkle = lms[LM.LEFT_ANKLE];
    const rightAnkle = lms[LM.RIGHT_ANKLE];
    const leftShoulder = lms[LM.LEFT_SHOULDER];
    const rightShoulder = lms[LM.RIGHT_SHOULDER];

    // 4. Feet Outside Frame Check
    const heelVisible =
      (leftHeel && isVisible(leftHeel, 0.35) && leftHeel.y <= 0.97) ||
      (rightHeel && isVisible(rightHeel, 0.35) && rightHeel.y <= 0.97) ||
      (leftAnkle && isVisible(leftAnkle, 0.35) && leftAnkle.y <= 0.97) ||
      (rightAnkle && isVisible(rightAnkle, 0.35) && rightAnkle.y <= 0.97);

    if (!heelVisible) {
      checks.FEET_OUTSIDE = { passed: false, message: 'Show Both Feet' };
    }

    // 5. Head Outside Frame Check
    const headVisible =
      nose && isVisible(nose, 0.35) && nose.y >= 0.03 &&
      ((leftEar && isVisible(leftEar, 0.35)) || (rightEar && isVisible(rightEar, 0.35)));

    if (!headVisible) {
      checks.HEAD_OUTSIDE = { passed: false, message: 'Head Outside Frame' };
    }

    // Calculate Person Vertical Span
    const topY = nose ? nose.y - 0.08 : 0.05;
    const botY = isVisible(leftHeel) && isVisible(rightHeel)
      ? (leftHeel.y + rightHeel.y) / 2
      : isVisible(leftHeel) ? leftHeel.y : isVisible(rightHeel) ? rightHeel.y : 0.9;
    const personSpan = botY - topY;

    // 6. Person Too Close Check
    if (personSpan > 0.88 || topY < 0.01 || botY > 0.99) {
      checks.PERSON_TOO_CLOSE = { passed: false, message: 'Move Back' };
    }

    // 7. Person Too Far Check
    if (personSpan < 0.38) {
      checks.PERSON_TOO_FAR = { passed: false, message: 'Move Forward' };
    }

    // 8. Camera Tilted / Leaning Check
    const cameraTilt = arucoDet ? Math.abs(arucoDet.rotationAngle) : 0;
    const shoulderTilt = (leftShoulder && rightShoulder && isVisible(leftShoulder) && isVisible(rightShoulder))
      ? Math.abs(leftShoulder.y - rightShoulder.y)
      : 0;

    if (cameraTilt > 10 || shoulderTilt > 0.08) {
      checks.CAMERA_TILTED = { passed: false, message: 'Stand Straight' };
    }

    // 9. Motion Blur Check
    if (motionTracker.isMotionDetected()) {
      checks.MOTION_BLUR = { passed: false, message: 'Hold Still' };
    }

    // 10. Poor Lighting Check
    const poseConf = poseDet.overallConfidence ?? 0;
    const markerConf = arucoDet?.confidence ?? 0;
    if (poseConf < 40 || (arucoDet && markerConf < 40)) {
      checks.POOR_LIGHTING = { passed: false, message: 'Poor Lighting - Increase Light' };
    }
  } else {
    // If no pose detected, pose-dependent checks fail
    checks.HEAD_OUTSIDE = { passed: false, message: 'Head Outside Frame' };
    checks.FEET_OUTSIDE = { passed: false, message: 'Show Both Feet' };
    checks.POOR_LIGHTING = { passed: false, message: 'Poor Lighting - Increase Light' };
  }

  // Find primary failed condition in priority order
  let primaryMessage = 'Hold Position...';
  let allPassed = true;

  for (const condition of PRIORITY_ORDER) {
    if (!checks[condition].passed) {
      primaryMessage = checks[condition].message;
      allPassed = false;
      break;
    }
  }

  return {
    allPassed,
    primaryMessage,
    countdown: allPassed ? countdownVal : null,
    checks,
  };
}
