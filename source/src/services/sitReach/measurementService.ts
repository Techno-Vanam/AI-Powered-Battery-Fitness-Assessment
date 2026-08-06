// Utilities for Sit & Reach measurement: angles, fingertip estimation, projection, smoothing, hold detection

export const KEYPOINT = {
  nose: 0,
  left_eye: 1,
  right_eye: 2,
  left_ear: 3,
  right_ear: 4,
  left_shoulder: 5,
  right_shoulder: 6,
  left_elbow: 7,
  right_elbow: 8,
  left_wrist: 9,
  right_wrist: 10,
  left_hip: 11,
  right_hip: 12,
  left_knee: 13,
  right_knee: 14,
  left_ankle: 15,
  right_ankle: 16,
} as const;

export type Landmark = { x: number; y: number; score: number };

export type Calibration = {
  a: { x: number; y: number };
  b: { x: number; y: number };
  knownCm: number;
  pixelsPerCm: number;
  axisPixelLength: number;
};

const REQUIRED_BODY_KEYPOINTS = [
  KEYPOINT.left_shoulder,
  KEYPOINT.right_shoulder,
  KEYPOINT.left_hip,
  KEYPOINT.right_hip,
  KEYPOINT.left_knee,
  KEYPOINT.right_knee,
  KEYPOINT.left_ankle,
  KEYPOINT.right_ankle,
  KEYPOINT.left_wrist,
  KEYPOINT.right_wrist,
];

export function angleBetween(a: Landmark, b: Landmark, c: Landmark) {
  // angle at b between vectors ba and bc
  const v1x = a.x - b.x;
  const v1y = a.y - b.y;
  const v2x = c.x - b.x;
  const v2y = c.y - b.y;
  const dot = v1x * v2x + v1y * v2y;
  const mag1 = Math.hypot(v1x, v1y);
  const mag2 = Math.hypot(v2x, v2y);
  if (mag1 === 0 || mag2 === 0) return NaN;
  const cos = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return (Math.acos(cos) * 180) / Math.PI;
}

export function isKneeStraight(landmarks: Landmark[], side: 'left' | 'right', toleranceDeg = 20) {
  const hip = landmarks[side === 'left' ? KEYPOINT.left_hip : KEYPOINT.right_hip];
  const knee = landmarks[side === 'left' ? KEYPOINT.left_knee : KEYPOINT.right_knee];
  const ankle = landmarks[side === 'left' ? KEYPOINT.left_ankle : KEYPOINT.right_ankle];
  if (!hip || !knee || !ankle) return false;
  const ang = angleBetween(hip, knee, ankle);
  return Math.abs(180 - ang) <= toleranceDeg;
}

export function isLandmarkVisible(landmark: Landmark | undefined, threshold = 0.4) {
  return !!landmark && landmark.score >= threshold;
}

export function countVisibleLandmarks(landmarks: Landmark[], threshold = 0.4) {
  return landmarks.filter((lm) => lm && lm.score >= threshold).length;
}

export function hasSufficientBodyVisibility(landmarks: Landmark[], threshold = 0.4) {
  const visible = REQUIRED_BODY_KEYPOINTS.filter((index) => isLandmarkVisible(landmarks[index], threshold)).length;
  return visible >= 6;
}

export function hasRequiredPoseLandmarks(landmarks: Landmark[], threshold = 0.4) {
  const visible = REQUIRED_BODY_KEYPOINTS.filter((index) => isLandmarkVisible(landmarks[index], threshold)).length;
  return visible >= 7;
}

export function averageLandmarkScore(landmarks: Landmark[]) {
  const visible = landmarks.filter((lm) => lm && !Number.isNaN(lm.score));
  if (!visible.length) return 0;
  return visible.reduce((sum, lm) => sum + lm.score, 0) / visible.length;
}

export function estimateFingertip(landmarks: Landmark[], side: 'left' | 'right') {
  const wrist = landmarks[side === 'left' ? KEYPOINT.left_wrist : KEYPOINT.right_wrist];
  const elbow = landmarks[side === 'left' ? KEYPOINT.left_elbow : KEYPOINT.right_elbow];
  if (!wrist || wrist.score < 0.3) return null;
  if (!elbow || elbow.score < 0.3) return { x: wrist.x, y: wrist.y, score: wrist.score };
  const vx = wrist.x - elbow.x;
  const vy = wrist.y - elbow.y;
  const scale = 0.25;
  return { x: wrist.x + vx * scale, y: wrist.y + vy * scale, score: wrist.score };
}

export function getFingertipCandidates(landmarks: Landmark[], minScore = 0.35) {
  const candidates: Landmark[] = [];
  const left = estimateFingertip(landmarks, 'left');
  const right = estimateFingertip(landmarks, 'right');
  if (left && left.score >= minScore) candidates.push(left);
  if (right && right.score >= minScore) candidates.push(right);
  return candidates;
}

export function projectPointOntoAxis(point: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) {
  const vx = b.x - a.x;
  const vy = b.y - a.y;
  const wx = point.x - a.x;
  const wy = point.y - a.y;
  const vlen2 = vx * vx + vy * vy;
  if (vlen2 === 0) return { projected: 0, t: 0, px: a.x, py: a.y };
  const t = (wx * vx + wy * vy) / vlen2;
  const px = a.x + vx * t;
  const py = a.y + vy * t;
  const projected = Math.hypot(px - a.x, py - a.y);
  return { projected, t, px, py };
}

export function projectPointOntoAxisCm(point: { x: number; y: number }, calibration: Calibration) {
  const { t } = projectPointOntoAxis(point, calibration.a, calibration.b);
  return t * calibration.knownCm;
}

export function getMaxFingertipReachCm(landmarks: Landmark[], calibration: Calibration, minScore = 0.35) {
  const candidates = getFingertipCandidates(landmarks, minScore);
  if (!candidates.length) return null;
  return Math.max(...candidates.map((candidate) => projectPointOntoAxisCm(candidate, calibration)));
}

export function validateSetup(landmarks: Landmark[], calibration: Calibration | null) {
  if (!calibration) {
    return { valid: false, message: 'Calibrate the ruler using the overlay before starting.' };
  }

  if (!hasSufficientBodyVisibility(landmarks, 0.4)) {
    return { valid: false, message: 'Ensure your full body is visible: shoulders, hips, knees, ankles, and hands.' };
  }

  if (!isLandmarkVisible(landmarks[KEYPOINT.left_wrist], 0.3) && !isLandmarkVisible(landmarks[KEYPOINT.right_wrist], 0.3)) {
    return { valid: false, message: 'Keep both hands visible near the measurement board.' };
  }

  const leftStraight = isKneeStraight(landmarks, 'left', 22);
  const rightStraight = isKneeStraight(landmarks, 'right', 22);
  if (!leftStraight && !rightStraight) {
    return { valid: false, message: 'Straighten your legs so at least one knee appears extended.' };
  }

  return { valid: true, message: 'Setup ready. Start the trial when you are seated and the ruler is calibrated.' };
}

export class EMAFilter {
  alpha: number;
  value: number | null = null;
  constructor(alpha = 0.6) { this.alpha = alpha; }
  update(v: number) {
    if (this.value === null) this.value = v;
    else this.value = this.alpha * v + (1 - this.alpha) * this.value;
    return this.value;
  }
  reset() { this.value = null; }
}

export class HoldDetector {
  windowMs: number;
  thresholdCm: number;
  history: Array<{ t: number; v: number }> = [];

  constructor(windowMs = 1200, thresholdCm = 0.5) {
    this.windowMs = windowMs;
    this.thresholdCm = thresholdCm;
  }

  update(value: number) {
    const now = Date.now();
    this.history.push({ t: now, v: value });
    this.history = this.history.filter((h) => now - h.t <= this.windowMs);
    const vals = this.history.map((h) => h.v);
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    const stable = vals.length >= 4 && max - min <= this.thresholdCm;
    const duration = this.history.length ? now - this.history[0].t : 0;
    return { stable, duration, delta: max - min, count: vals.length };
  }

  reset() {
    this.history = [];
  }
}
