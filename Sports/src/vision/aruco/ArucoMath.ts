import type { Corner } from './Types';

export function edgeLength(a: Corner, b: Corner): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function markerCenter(corners: [Corner, Corner, Corner, Corner]): Corner {
  return {
    x: (corners[0].x + corners[1].x + corners[2].x + corners[3].x) / 4,
    y: (corners[0].y + corners[1].y + corners[2].y + corners[3].y) / 4,
  };
}

/** Average of top and bottom horizontal edges (pixels). */
export function markerWidthPixels(corners: [Corner, Corner, Corner, Corner]): number {
  const top    = edgeLength(corners[0], corners[1]);
  const bottom = edgeLength(corners[3], corners[2]);
  return (top + bottom) / 2;
}

/** Average of left and right vertical edges (pixels). */
export function markerHeightPixels(corners: [Corner, Corner, Corner, Corner]): number {
  const left  = edgeLength(corners[0], corners[3]);
  const right = edgeLength(corners[1], corners[2]);
  return (left + right) / 2;
}

/** Rotation of the top edge relative to horizontal (degrees). */
export function rotationAngle(tl: Corner, tr: Corner): number {
  return (Math.atan2(tr.y - tl.y, tr.x - tl.x) * 180) / Math.PI;
}

export function cmPerPixel(markerPhysicalCm: number, heightPx: number): number {
  if (heightPx <= 0) return 0;
  return markerPhysicalCm / heightPx;
}

export function confidenceLabel(confidence: number): string {
  if (confidence >= 80) return 'Excellent';
  if (confidence >= 60) return 'Good';
  if (confidence >= 40) return 'Fair';
  return 'Poor';
}
