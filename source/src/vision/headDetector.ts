import type { Landmark } from '../utils/types';

interface PixelReader {
  getPixel: (x: number, y: number) => { r: number; g: number; b: number };
}

/**
 * Finds the topmost head point by scanning upward from the nose.
 * Returns normalized y coordinate (0–1).
 *
 * Strategy:
 *  1. Start at nose y position.
 *  2. Scan upward pixel row by row.
 *  3. Stop when the pixel brightness drops significantly (hair/background boundary).
 *  4. Return that y as the head vertex.
 *
 * If no pixel reader is available (frame not decoded), falls back to
 * estimating head top as nose.y - (nose.y - ear.y) * 1.2.
 */
export function findHeadVertex(
  nose: Landmark,
  leftEar: Landmark,
  rightEar: Landmark,
  imageHeight: number,
  imageWidth: number,
  pixelReader?: PixelReader,
): number {
  if (!pixelReader) {
    // Fallback geometric estimate
    const earY = (leftEar.y + rightEar.y) / 2;
    const faceHeight = nose.y - earY;
    return Math.max(0, nose.y - faceHeight * 1.2);
  }

  const nosePixelY = Math.round(nose.y * imageHeight);
  const nosePixelX = Math.round(nose.x * imageWidth);

  // Sample brightness at nose to establish skin baseline
  const nosePixel = pixelReader.getPixel(nosePixelX, nosePixelY);
  const noseBrightness = (nosePixel.r + nosePixel.g + nosePixel.b) / 3;

  let headVertexY = nosePixelY;

  for (let y = nosePixelY - 1; y >= 0; y--) {
    const pixel = pixelReader.getPixel(nosePixelX, y);
    const brightness = (pixel.r + pixel.g + pixel.b) / 3;
    // Boundary: brightness drops by more than 40 (hair is darker than skin/background)
    if (Math.abs(brightness - noseBrightness) > 40) {
      headVertexY = y;
      break;
    }
    headVertexY = y;
  }

  return headVertexY / imageHeight;
}
