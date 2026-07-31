import { detectHeadVertex } from '../../src/height/HeadVertexDetector';
import { detectHeel } from '../../src/height/HeelDetector';
import { HeightSmoother } from '../../src/height/HeightSmoother';
import { validateForHeight } from '../../src/height/HeightValidator';
import { calculateHeight } from '../../src/height/HeightCalculator';
import type { Landmark } from '../../src/vision/pose/PoseTypes';
import { LM } from '../../src/vision/pose/PoseTypes';
import type { ArucoDetection } from '../../src/vision/aruco/Types';
import type { PoseDetection } from '../../src/vision/pose/PoseTypes';

function makeLm(x: number, y: number, vis = 0.95): Landmark {
  return { x, y, z: 0, visibility: vis, presence: vis };
}

function makeValid33(): Landmark[] {
  const lms: Landmark[] = new Array(33).fill(null).map(() => makeLm(0.5, 0.5));
  lms[LM.NOSE]           = makeLm(0.50, 0.10);
  lms[LM.LEFT_EAR]       = makeLm(0.44, 0.07);
  lms[LM.RIGHT_EAR]      = makeLm(0.56, 0.07);
  lms[LM.LEFT_SHOULDER]  = makeLm(0.40, 0.22);
  lms[LM.RIGHT_SHOULDER] = makeLm(0.60, 0.22);
  lms[LM.LEFT_HIP]       = makeLm(0.43, 0.52);
  lms[LM.RIGHT_HIP]      = makeLm(0.57, 0.52);
  lms[LM.LEFT_KNEE]      = makeLm(0.43, 0.70);
  lms[LM.RIGHT_KNEE]     = makeLm(0.57, 0.70);
  lms[LM.LEFT_ANKLE]     = makeLm(0.44, 0.86);
  lms[LM.RIGHT_ANKLE]    = makeLm(0.56, 0.86);
  lms[LM.LEFT_HEEL]      = makeLm(0.43, 0.90);
  lms[LM.RIGHT_HEEL]     = makeLm(0.57, 0.90);
  lms[LM.LEFT_FOOT_INDEX]  = makeLm(0.42, 0.93);
  lms[LM.RIGHT_FOOT_INDEX] = makeLm(0.58, 0.93);
  return lms;
}

function makeAruco(cmPerPixel = 0.25, confidence = 85, rotationAngle = 0): ArucoDetection {
  return {
    detected: true,
    markerId: 0,
    markerWidthPixels: 84,
    markerHeightPixels: 84,
    markerCenter: { x: 640, y: 680 },
    rotationAngle,
    cmPerPixel,
    confidence,
    corners: [
      { x: 580, y: 660 }, { x: 700, y: 660 },
      { x: 700, y: 700 }, { x: 580, y: 700 },
    ],
  };
}

function makePose(landmarks = makeValid33()): PoseDetection {
  return {
    detected: true,
    status: 'OK',
    landmarks,
    visibleCount: 28,
    overallConfidence: 85,
    timestampMs: Date.now(),
    processingTimeMs: 10,
  };
}

describe('Unit Tests - Height Math Engine', () => {
  test('detectHeadVertex geometric fallback calculates head top vertex above nose', () => {
    const lms = makeValid33();
    const res = detectHeadVertex(lms[LM.NOSE], lms[LM.LEFT_EAR], lms[LM.RIGHT_EAR], 1280, 720);
    expect(res.found).toBe(true);
    if (!res.found) return;
    expect(res.vertexY).toBeLessThan(lms[LM.NOSE].y * 720);
  });

  test('detectHeel calculates heel midpoint Y when heels are visible', () => {
    const lms = makeValid33();
    const res = detectHeel(lms, 1280, 720);
    expect(res.found).toBe(true);
    if (!res.found) return;
    expect(res.heelY).toBeCloseTo(0.90 * 720, 1);
  });

  test('HeightSmoother filters median samples and rejects sudden jumps', () => {
    const smoother = new HeightSmoother();
    [170, 171, 169, 170, 172].forEach(h => smoother.push(h));
    const smoothed = smoother.push(170);
    expect(smoothed.heightCm).toBeCloseTo(170, 0);

    // Sudden jump (e.g. 200 cm) should be rejected
    const rejected = smoother.push(200);
    expect(rejected.heightCm).toBeCloseTo(170, 0);
  });

  test('validateForHeight verifies upright posture and camera tilt', () => {
    const validRes = validateForHeight(makeAruco(), makeValid33(), 85);
    expect(validRes.valid).toBe(true);

    const tiltedRes = validateForHeight(makeAruco(0.25, 85, 15), makeValid33(), 85);
    expect(tiltedRes.valid).toBe(false);
    expect(tiltedRes.code).toBe('CAMERA_TILTED');
  });

  test('calculateHeight outputs valid cm measurement for full standing body', () => {
    const res = calculateHeight(makeAruco(), makePose(), 1280, 720);
    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(res.measurement.heightCm).toBeGreaterThan(100);
    expect(res.measurement.heightCm).toBeLessThan(250);
  });
});
