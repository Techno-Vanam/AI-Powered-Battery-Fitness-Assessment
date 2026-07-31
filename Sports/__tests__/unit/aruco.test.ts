import { markerHeightPixels, markerWidthPixels, markerCenter, rotationAngle, cmPerPixel } from '../../src/vision/aruco/ArucoMath';
import { parseNativeResult } from '../../src/vision/aruco/ArucoDetector';
import type { Corner } from '../../src/vision/aruco/Types';
import { EXPECTED_MARKER_ID } from '../../src/vision/aruco/Types';

describe('Unit Tests - ArUco Module', () => {
  const mockCorners: [Corner, Corner, Corner, Corner] = [
    { x: 100, y: 100 },
    { x: 200, y: 100 },
    { x: 200, y: 200 },
    { x: 100, y: 200 },
  ];

  test('markerWidthPixels calculates average horizontal edge length', () => {
    const width = markerWidthPixels(mockCorners);
    expect(width).toBeCloseTo(100, 1);
  });

  test('markerHeightPixels calculates average vertical edge length', () => {
    const height = markerHeightPixels(mockCorners);
    expect(height).toBeCloseTo(100, 1);
  });

  test('markerCenter calculates centroid of four corners', () => {
    const center = markerCenter(mockCorners);
    expect(center.x).toBeCloseTo(150, 1);
    expect(center.y).toBeCloseTo(150, 1);
  });

  test('rotationAngle returns ~0 for axis-aligned square marker', () => {
    const angle = rotationAngle(mockCorners[0], mockCorners[1]);
    expect(Math.abs(angle)).toBeLessThan(1);
  });

  test('cmPerPixel divides physical size (21 cm) by pixel height', () => {
    const scale = cmPerPixel(21.0, 100);
    expect(scale).toBeCloseTo(0.21, 4);
  });

  test('parseNativeResult parses valid native ArUco payload', () => {
    const raw = {
      detected: true,
      markerId: EXPECTED_MARKER_ID,
      confidence: 90,
      corners: [
        { x: 10, y: 10 }, { x: 50, y: 10 },
        { x: 50, y: 50 }, { x: 10, y: 50 },
      ],
      markerWidthPixels: 40,
      markerHeightPixels: 40,
      rotationAngle: 0,
      cmPerPixel: 0.525,
    };
    const parsed = parseNativeResult(raw);
    expect(parsed.detected).toBe(true);
    if (!parsed.detected) return;
    expect(parsed.markerId).toBe(EXPECTED_MARKER_ID);
    expect(parsed.confidence).toBe(90);
    expect(parsed.cmPerPixel).toBeCloseTo(0.525, 3);
  });

  test('parseNativeResult handles missing or low-confidence marker', () => {
    const rawMissing = { detected: false, reason: 'MARKER_NOT_FOUND' };
    const parsed = parseNativeResult(rawMissing);
    expect(parsed.detected).toBe(false);

    const rawLowConf = {
      detected: true,
      markerId: EXPECTED_MARKER_ID,
      confidence: 20, // Below threshold
      markerWidthPixels: 50,
      markerHeightPixels: 50,
      corners: mockCorners,
    };
    const parsedLow = parseNativeResult(rawLowConf);
    expect(parsedLow.detected).toBe(false);
  });
});
