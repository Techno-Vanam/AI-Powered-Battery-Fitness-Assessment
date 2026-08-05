/**
 * Kinematic calculations helper functions
 */

export interface Vector2D {
  x: number;
  y: number;
}

export function euclideanDistance(p1: Vector2D, p2: Vector2D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function computeVelocity(
  currentPos: Vector2D,
  prevPos: Vector2D,
  deltaTimeSeconds: number
): Vector2D {
  if (deltaTimeSeconds <= 0) return { x: 0, y: 0 };
  return {
    x: (currentPos.x - prevPos.x) / deltaTimeSeconds,
    y: (currentPos.y - prevPos.y) / deltaTimeSeconds,
  };
}

export function pixelsToCentimeters(pixels: number, pixelsPerCm: number): number {
  if (pixelsPerCm <= 0) return 0;
  return pixels / pixelsPerCm;
}

export function centimetersToPixels(cm: number, pixelsPerCm: number): number {
  return cm * pixelsPerCm;
}

export function movingAverage(values: number[], windowSize: number = 5): number {
  if (values.length === 0) return 0;
  const slice = values.slice(-windowSize);
  const sum = slice.reduce((acc, val) => acc + val, 0);
  return sum / slice.length;
}
