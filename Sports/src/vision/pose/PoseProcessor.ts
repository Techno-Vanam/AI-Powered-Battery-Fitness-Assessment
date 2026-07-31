import type { Landmark, PoseResult } from './PoseTypes';
import {
  LM,
  REQUIRED_LANDMARKS,
  VISIBILITY_THRESHOLD,
  MIN_POSE_CONFIDENCE,
  MIN_VISIBLE_COUNT,
} from './PoseTypes';
import { isVisible, isInFrame, countVisible } from './PoseMath';

// Raw shape returned by the native Frame Processor plugin
interface RawNativePose {
  detected: boolean;
  status?: string;
  landmarks?: Array<{
    x: number;
    y: number;
    z: number;
    visibility: number;
    presence: number;
  }>;
  visibleCount?: number;
  overallConfidence?: number;
  timestampMs?: number;
  processingTimeMs?: number;
  error?: string;
}

export function parseNativePoseResult(raw: RawNativePose): PoseResult {
  if (!raw.detected) {
    const status = raw.status ?? 'UNKNOWN';
    return {
      detected: false,
      status: status as PoseResult['status'],
      reason: statusToReason(status),
    };
  }

  const rawLandmarks = raw.landmarks;
  if (!rawLandmarks || rawLandmarks.length < 33) {
    return { detected: false, status: 'NO_PERSON', reason: 'Insufficient landmarks returned' };
  }

  const landmarks: Landmark[] = rawLandmarks.map(l => ({
    x:          l.x,
    y:          l.y,
    z:          l.z,
    visibility: l.visibility,
    presence:   l.presence,
  }));

  // ── Validation ──────────────────────────────────────────────────────────────

  // 1. Head must be detected (nose visible)
  const nose = landmarks[LM.NOSE];
  if (!isVisible(nose, VISIBILITY_THRESHOLD)) {
    return { detected: false, status: 'HEAD_NOT_DETECTED', reason: 'Nose landmark not visible' };
  }

  // 2. At least one heel must be detected
  const leftHeel  = landmarks[LM.LEFT_HEEL];
  const rightHeel = landmarks[LM.RIGHT_HEEL];
  if (!isVisible(leftHeel, VISIBILITY_THRESHOLD) && !isVisible(rightHeel, VISIBILITY_THRESHOLD)) {
    return { detected: false, status: 'HEEL_NOT_DETECTED', reason: 'Neither heel is visible' };
  }

  // 3. Minimum visible landmark count
  const visibleCount = countVisible(landmarks);
  if (visibleCount < MIN_VISIBLE_COUNT) {
    return {
      detected: false,
      status: 'PARTIAL_BODY',
      reason: `Only ${visibleCount}/33 landmarks visible (min ${MIN_VISIBLE_COUNT})`,
    };
  }

  // 4. Required landmarks must be in frame
  const outOfFrame = REQUIRED_LANDMARKS.filter(idx => {
    const lm = landmarks[idx];
    return isVisible(lm, VISIBILITY_THRESHOLD) && !isInFrame(lm);
  });
  if (outOfFrame.length > 2) {
    return {
      detected: false,
      status: 'PARTIAL_BODY',
      reason: `${outOfFrame.length} required landmarks outside frame bounds`,
    };
  }

  // 5. Overall confidence
  const overallConfidence = raw.overallConfidence ?? 0;
  if (overallConfidence < MIN_POSE_CONFIDENCE) {
    return {
      detected: false,
      status: 'LOW_CONFIDENCE',
      reason: `Confidence ${overallConfidence.toFixed(0)}% below threshold ${MIN_POSE_CONFIDENCE}%`,
    };
  }

  return {
    detected:          true,
    status:            'OK',
    landmarks,
    visibleCount,
    overallConfidence,
    timestampMs:       raw.timestampMs    ?? 0,
    processingTimeMs:  raw.processingTimeMs ?? 0,
  };
}

function statusToReason(status: string): string {
  switch (status) {
    case 'NO_PERSON':       return 'No person detected in frame';
    case 'MULTIPLE_PEOPLE': return 'Multiple people detected — stand alone';
    case 'PARTIAL_BODY':    return 'Body partially outside frame';
    case 'LOW_CONFIDENCE':  return 'Pose confidence too low';
    case 'NOT_INITIALIZED': return 'Pose model not yet initialized';
    case 'INITIALIZING':    return 'Pose model initializing…';
    case 'FRAME_ERROR':     return 'Frame processing error';
    default:                return 'Unknown pose error';
  }
}
