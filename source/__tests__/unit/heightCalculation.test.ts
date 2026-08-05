import {
  computePixelsPerCm,
  computeFrameHeightCm,
  selectStableFrameIndices,
  computeConfidence,
  calculateHeightFromFrames,
} from '../../src/height/calculation/heightCalculation';
import type { FrameMeasurement } from '../../src/height/types/HeightTypes';

function makeFrame(overrides: Partial<FrameMeasurement> = {}): FrameMeasurement {
  return {
    vertexY: 120,
    heelY: 920,
    markerHeightPx: 150,
    markerPhysicalCm: 15,
    poseVisibility: 0.92,
    markerConfidence: 88,
    ...overrides,
  };
}

function makeStableFrames(count: number, heightCmTarget = 170): FrameMeasurement[] {
  const markerPhysicalCm = 15;
  const markerHeightPx = 150;
  const pixelsPerCm = markerHeightPx / markerPhysicalCm;
  const heightPixels = heightCmTarget * pixelsPerCm;
  const vertexY = 120;
  const heelY = vertexY + heightPixels;

  return Array.from({ length: count }, (_, i) =>
    makeFrame({
      vertexY: vertexY + (i % 3) * 0.3,
      heelY: heelY + (i % 3) * 0.3,
      markerHeightPx: markerHeightPx + (i % 2) * 0.1,
      markerPhysicalCm,
    }),
  );
}

describe('heightCalculation (pure module)', () => {
  test('computePixelsPerCm returns marker height / physical cm', () => {
    expect(computePixelsPerCm(150, 15)).toBeCloseTo(10, 5);
  });

  test('computeFrameHeightCm calculates vertex-to-heel distance × scale', () => {
    const frame = makeFrame({ vertexY: 100, heelY: 900, markerHeightPx: 100, markerPhysicalCm: 10 });
    expect(computeFrameHeightCm(frame)).toBeCloseTo(80, 1);
  });

  test('selectStableFrameIndices rejects outlier heights', () => {
    const heights = [170, 171, 169, 170, 220];
    const stable = selectStableFrameIndices(heights);
    expect(stable).not.toContain(4);
    expect(stable.length).toBeGreaterThanOrEqual(4);
  });

  test('computeConfidence returns 0–100 weighted score', () => {
    const frames = makeStableFrames(8);
    const conf = computeConfidence(frames, frames.map((_, i) => i), 0.5, 170);
    expect(conf).toBeGreaterThan(50);
    expect(conf).toBeLessThanOrEqual(100);
  });

  test('calculateHeightFromFrames averages stable frames', () => {
    const frames = makeStableFrames(10, 172);
    const result = calculateHeightFromFrames({ frames, minStableFrames: 5 });
    expect(result).not.toBeNull();
    expect(result!.heightCm).toBeCloseTo(172, 0);
    expect(result!.stableFrameCount).toBeGreaterThanOrEqual(5);
    expect(result!.confidence).toBeGreaterThan(0);
  });

  test('calculateHeightFromFrames returns null when too few stable frames', () => {
    const frames = makeStableFrames(2);
    expect(calculateHeightFromFrames({ frames, minStableFrames: 5 })).toBeNull();
  });

  test('calculateHeightFromFrames rejects invalid geometry', () => {
    const bad = makeFrame({ heelY: 50, vertexY: 200 });
    expect(calculateHeightFromFrames({ frames: [bad, bad, bad, bad, bad] })).toBeNull();
  });
});
