/**
 * Camera preview & normalized coordinate transformer
 */

export interface ScreenDimensions {
  width: number;
  height: number;
}

export interface NormalizedPoint {
  x: number; // [0, 1]
  y: number; // [0, 1]
}

export function mapNormalizedToScreen(
  point: NormalizedPoint,
  screen: ScreenDimensions,
  isFrontCamera: boolean = false
): { x: number; y: number } {
  let x = point.x * screen.width;
  const y = point.y * screen.height;

  if (isFrontCamera) {
    x = screen.width - x; // Mirror horizontally for front camera
  }

  return { x, y };
}
