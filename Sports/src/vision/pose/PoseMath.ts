import type { Landmark } from './PoseTypes';
import { VISIBILITY_THRESHOLD } from './PoseTypes';

/** Convert normalized landmark to pixel coordinates. */
export function toPixel(
  lm: Landmark,
  frameWidth: number,
  frameHeight: number,
): { px: number; py: number } {
  return { px: lm.x * frameWidth, py: lm.y * frameHeight };
}

/** Midpoint of two landmarks in normalized space. */
export function midpoint(a: Landmark, b: Landmark): { x: number; y: number } {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/** Euclidean distance between two landmarks in normalized space. */
export function landmarkDistance(a: Landmark, b: Landmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** True if the landmark is visible above the threshold. */
export function isVisible(lm: Landmark, threshold = VISIBILITY_THRESHOLD): boolean {
  return lm.visibility >= threshold && lm.presence >= threshold;
}

/** Count how many landmarks in the array are visible. */
export function countVisible(landmarks: Landmark[]): number {
  return landmarks.filter(lm => isVisible(lm)).length;
}

/** Average visibility across all landmarks (0–1). */
export function averageVisibility(landmarks: Landmark[]): number {
  if (landmarks.length === 0) return 0;
  return landmarks.reduce((s, lm) => s + lm.visibility, 0) / landmarks.length;
}

/** True if the landmark is within the normalized frame bounds [0,1]. */
export function isInFrame(lm: Landmark, margin = 0.02): boolean {
  return lm.x >= margin && lm.x <= 1 - margin &&
         lm.y >= margin && lm.y <= 1 - margin;
}

/** Confidence label string. */
export function poseConfidenceLabel(confidence: number): string {
  if (confidence >= 80) return 'Excellent';
  if (confidence >= 60) return 'Good';
  if (confidence >= 40) return 'Fair';
  return 'Poor';
}
