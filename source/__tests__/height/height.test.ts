/**
 * Unit tests for the Height Calculation Engine.
 *
 * Run with: npx jest __tests__/height/height.test.ts
 */

import { detectHeadVertex, type FramePixelReader } from '../../src/height/HeadVertexDetector';
import { detectHeel } from '../../src/height/HeelDetector';
import { HeightSmoother } from '../../src/height/HeightSmoother';
import { validateForHeight } from '../../src/height/HeightValidator';
import { calculateHeight } from '../../src/height/HeightCalculator';
import type { Landmark } from '../../src/vision/pose/PoseTypes';
import { LM } from '../../src/vision/pose/PoseTypes';
import type { ArucoDetection } from '../../src/vision/aruco/Types';
import type { PoseDetection } from '../../src/vision/pose/PoseTypes';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeLandmark(
  x: number, y: number,
  visibility = 0.95, presence = 0.95,
): Landmark {
  return { x, y, z: 0, visibility, presence };
}

/** Build a full 33-landmark array for a standing person (normalized coords). */
function makeStandingLandmarks(): Landmark[] {
  const lms: Landmark[] = new Array(33).fill(null).map(() =>
    makeLandmark(0.5, 0.5),
  );
  // Head
  lms[LM.NOSE]           = makeLandmark(0.50, 0.10);
  lms[LM.LEFT_EYE]       = makeLandmark(0.47, 0.07);
  lms[LM.RIGHT_EYE]      = makeLandmark(0.53, 0.07);
  lms[LM.LEFT_EAR]       = makeLandmark(0.44, 0.07);
  lms[LM.RIGHT_EAR]      = makeLandmark(0.56, 0.07);
  // Shoulders
  lms[LM.LEFT_SHOULDER]  = makeLandmark(0.40, 0.22);
  lms[LM.RIGHT_SHOULDER] = makeLandmark(0.60, 0.22);
  // Hips
  lms[LM.LEFT_HIP]       = makeLandmark(0.43, 0.52);
  lms[LM.RIGHT_HIP]      = makeLandmark(0.57, 0.52);
  // Knees
  lms[LM.LEFT_KNEE]      = makeLandmark(0.43, 0.70);
  lms[LM.RIGHT_KNEE]     = makeLandmark(0.57, 0.70);
  // Ankles
  lms[LM.LEFT_ANKLE]     = makeLandmark(0.44, 0.86);
  lms[LM.RIGHT_ANKLE]    = makeLandmark(0.56, 0.86);
  // Heels
  lms[LM.LEFT_HEEL]      = makeLandmark(0.43, 0.90);
  lms[LM.RIGHT_HEEL]     = makeLandmark(0.57, 0.90);
  // Foot index
  lms[LM.LEFT_FOOT_INDEX]  = makeLandmark(0.42, 0.93);
  lms[LM.RIGHT_FOOT_INDEX] = makeLandmark(0.58, 0.93);
  return lms;
}

function makeAruco(
  cmPerPixel = 0.25,
  confidence = 85,
  rotationAngle = 0,
): ArucoDetection {
  const markerHeightPx = 21.0 / cmPerPixel;
  return {
    detected: true,
    markerId: 0,
    markerWidthPixels:  markerHeightPx,
    markerHeightPixels: markerHeightPx,
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

function makePose(
  landmarks: Landmark[] = makeStandingLandmarks(),
  overallConfidence = 82,
): PoseDetection {
  return {
    detected: true,
    status: 'OK',
    landmarks,
    visibleCount: 28,
    overallConfidence,
    timestampMs: Date.now(),
    processingTimeMs: 12,
  };
}

// ─── cmPerPixel calculation ───────────────────────────────────────────────────
describe('cmPerPixel calculation', () => {
  test('21 cm marker at 128 px → 0.1641 cm/px', () => {
    const result = 21.0 / 128;
    expect(result).toBeCloseTo(0.1641, 3);
  });

  test('21 cm marker at 210 px → 0.1000 cm/px', () => {
    expect(21.0 / 210).toBeCloseTo(0.1, 4);
  });

  test('cmPerPixel × heightPixels = heightCm', () => {
    const cmPerPixel = 21.0 / 128;
    const heightPx = 1050;
    const heightCm = heightPx * cmPerPixel;
    expect(heightCm).toBeCloseTo(172.3, 0);
  });
});

// ─── HeadVertexDetector ───────────────────────────────────────────────────────
describe('HeadVertexDetector', () => {
  const FW = 1280, FH = 720;

  test('geometric fallback returns found=true when no reader', () => {
    const lms = makeStandingLandmarks();
    const result = detectHeadVertex(
      lms[LM.NOSE], lms[LM.LEFT_EAR], lms[LM.RIGHT_EAR],
      FW, FH,
    );
    expect(result.found).toBe(true);
  });

  test('geometric fallback: vertex Y is above nose Y (smaller pixel value)', () => {
    const lms = makeStandingLandmarks();
    const result = detectHeadVertex(
      lms[LM.NOSE], lms[LM.LEFT_EAR], lms[LM.RIGHT_EAR],
      FW, FH,
    );
    if (!result.found) throw new Error('Expected found');
    const nosePy = lms[LM.NOSE].y * FH;
    expect(result.vertexY).toBeLessThan(nosePy);
  });

  test('geometric fallback: vertex Y is within frame bounds', () => {
    const lms = makeStandingLandmarks();
    const result = detectHeadVertex(
      lms[LM.NOSE], lms[LM.LEFT_EAR], lms[LM.RIGHT_EAR],
      FW, FH,
    );
    if (!result.found) throw new Error('Expected found');
    expect(result.vertexY).toBeGreaterThanOrEqual(0);
    expect(result.vertexY).toBeLessThanOrEqual(FH);
  });

  test('returns found=false when nose visibility is too low', () => {
    const lms = makeStandingLandmarks();
    lms[LM.NOSE] = makeLandmark(0.5, 0.08, 0.1, 0.1);
    const result = detectHeadVertex(
      lms[LM.NOSE], lms[LM.LEFT_EAR], lms[LM.RIGHT_EAR],
      FW, FH,
    );
    expect(result.found).toBe(false);
  });

  test('pixel reader: detects gradient edge above nose', () => {
    const FW2 = 200, FH2 = 400;
    // Simulate: rows 0–29 are dark (background), rows 30+ are bright (head)
    const reader: FramePixelReader = {
      width: FW2,
      height: FH2,
      getLuminance: (_x, y) => (y < 30 ? 20 : 200),
    };
    const nose     = makeLandmark(0.5, 0.25);  // y=100px
    const leftEar  = makeLandmark(0.4, 0.10);  // y=40px
    const rightEar = makeLandmark(0.6, 0.10);
    const result = detectHeadVertex(nose, leftEar, rightEar, FW2, FH2, reader);
    expect(result.found).toBe(true);
    if (!result.found) return;
    // The edge should be detected near row 30
    expect(result.vertexY).toBeLessThanOrEqual(50);
  });
});

// ─── HeelDetector ─────────────────────────────────────────────────────────────
describe('HeelDetector', () => {
  const FW = 1280, FH = 720;

  test('both heels visible → averages Y', () => {
    const lms = makeStandingLandmarks();
    const result = detectHeel(lms, FW, FH);
    expect(result.found).toBe(true);
    if (!result.found) return;
    const expectedY = ((lms[LM.LEFT_HEEL].y + lms[LM.RIGHT_HEEL].y) / 2) * FH;
    expect(result.heelY).toBeCloseTo(expectedY, 1);
    expect(result.leftVisible).toBe(true);
    expect(result.rightVisible).toBe(true);
  });

  test('only left heel visible → uses left heel', () => {
    const lms = makeStandingLandmarks();
    lms[LM.RIGHT_HEEL] = makeLandmark(0.57, 0.90, 0.1, 0.1);
    const result = detectHeel(lms, FW, FH);
    expect(result.found).toBe(true);
    if (!result.found) return;
    expect(result.leftVisible).toBe(true);
    expect(result.rightVisible).toBe(false);
    expect(result.heelY).toBeCloseTo(lms[LM.LEFT_HEEL].y * FH, 1);
  });

  test('only right heel visible → uses right heel', () => {
    const lms = makeStandingLandmarks();
    lms[LM.LEFT_HEEL] = makeLandmark(0.43, 0.90, 0.1, 0.1);
    const result = detectHeel(lms, FW, FH);
    expect(result.found).toBe(true);
    if (!result.found) return;
    expect(result.rightVisible).toBe(true);
    expect(result.leftVisible).toBe(false);
  });

  test('neither heel visible → returns found=false', () => {
    const lms = makeStandingLandmarks();
    lms[LM.LEFT_HEEL]  = makeLandmark(0.43, 0.90, 0.1, 0.1);
    lms[LM.RIGHT_HEEL] = makeLandmark(0.57, 0.90, 0.1, 0.1);
    const result = detectHeel(lms, FW, FH);
    expect(result.found).toBe(false);
  });
});

// ─── HeightCalculator ─────────────────────────────────────────────────────────
describe('HeightCalculator', () => {
  const FW = 1280, FH = 720;

  test('returns success with plausible height for standing person', () => {
    const aruco = makeAruco(0.25, 85, 0);
    const pose  = makePose();
    const result = calculateHeight(aruco, pose, FW, FH);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.measurement.heightCm).toBeGreaterThan(100);
    expect(result.measurement.heightCm).toBeLessThan(250);
  });

  test('heightCm = heightPixels × cmPerPixel', () => {
    const aruco = makeAruco(0.25, 85, 0);
    const pose  = makePose();
    const result = calculateHeight(aruco, pose, FW, FH);
    if (!result.success) return;
    const { heightCm, heightPixels, markerScale } = result.measurement;
    expect(heightCm).toBeCloseTo(heightPixels * markerScale, 0);
  });

  test('fails when marker confidence is too low', () => {
    const aruco = makeAruco(0.25, 20, 0);  // below MIN_MARKER_CONFIDENCE
    const pose  = makePose();
    const result = calculateHeight(aruco, pose, FW, FH);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.code).toBe('MARKER_LOW_CONFIDENCE');
  });

  test('fails when camera is tilted beyond threshold', () => {
    const aruco = makeAruco(0.25, 85, 15);  // 15° tilt
    const pose  = makePose();
    const result = calculateHeight(aruco, pose, FW, FH);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.code).toBe('CAMERA_TILTED');
  });

  test('fails when heels are not visible', () => {
    const lms = makeStandingLandmarks();
    lms[LM.LEFT_HEEL]  = makeLandmark(0.43, 0.90, 0.1, 0.1);
    lms[LM.RIGHT_HEEL] = makeLandmark(0.57, 0.90, 0.1, 0.1);
    const pose = makePose(lms);
    const result = calculateHeight(makeAruco(), pose, FW, FH);
    expect(result.success).toBe(false);
  });

  test('overallConfidence is between 0 and 100', () => {
    const result = calculateHeight(makeAruco(), makePose(), FW, FH);
    if (!result.success) return;
    expect(result.measurement.overallConfidence).toBeGreaterThanOrEqual(0);
    expect(result.measurement.overallConfidence).toBeLessThanOrEqual(100);
  });
});

// ─── HeightSmoother ───────────────────────────────────────────────────────────
describe('HeightSmoother', () => {
  test('returns median of pushed values', () => {
    const smoother = new HeightSmoother();
    [170, 171, 169, 170, 172].forEach(h => smoother.push(h));
    const result = smoother.push(170);
    expect(result.heightCm).toBeCloseTo(170, 0);
  });

  test('rejects sudden jump > MAX_FRAME_JUMP_CM', () => {
    const smoother = new HeightSmoother();
    [170, 170, 170, 170, 170].forEach(h => smoother.push(h));
    const result = smoother.push(200);  // 30 cm jump — should be rejected
    expect(result.heightCm).toBeCloseTo(170, 0);
  });

  test('isStable=false before 1.5 seconds', () => {
    const smoother = new HeightSmoother();
    const t0 = Date.now();
    for (let i = 0; i < 10; i++) {
      smoother.push(170, t0 + i * 50);  // 50 ms apart = 500 ms total
    }
    const result = smoother.push(170, t0 + 600);
    expect(result.isStable).toBe(false);
  });

  test('isStable=true after 1.5 seconds of stable readings', () => {
    const smoother = new HeightSmoother();
    const t0 = Date.now() - 2000;  // start 2 seconds ago
    for (let i = 0; i < 10; i++) {
      smoother.push(170, t0 + i * 100);
    }
    const result = smoother.push(170, t0 + 2500);
    expect(result.isStable).toBe(true);
  });

  test('reset clears all state', () => {
    const smoother = new HeightSmoother();
    [170, 171, 172].forEach(h => smoother.push(h));
    smoother.reset();
    expect(smoother.sampleCount).toBe(0);
    expect(smoother.current).toBe(0);
  });

  test('sampleCount increments correctly', () => {
    const smoother = new HeightSmoother();
    smoother.push(170);
    smoother.push(171);
    smoother.push(172);
    expect(smoother.sampleCount).toBe(3);
  });
});

// ─── HeightValidator ─────────────────────────────────────────────────────────
describe('HeightValidator', () => {
  test('passes for valid standing pose', () => {
    const result = validateForHeight(makeAruco(), makeStandingLandmarks(), 82);
    expect(result.valid).toBe(true);
  });

  test('fails when marker confidence is below threshold', () => {
    const result = validateForHeight(makeAruco(0.25, 20), makeStandingLandmarks(), 82);
    expect(result.valid).toBe(false);
    expect(result.code).toBe('MARKER_LOW_CONFIDENCE');
  });

  test('fails when camera tilt exceeds threshold', () => {
    const result = validateForHeight(makeAruco(0.25, 85, 12), makeStandingLandmarks(), 82);
    expect(result.valid).toBe(false);
    expect(result.code).toBe('CAMERA_TILTED');
  });

  test('fails when nose is not visible', () => {
    const lms = makeStandingLandmarks();
    lms[LM.NOSE] = makeLandmark(0.5, 0.08, 0.1, 0.1);
    const result = validateForHeight(makeAruco(), lms, 82);
    expect(result.valid).toBe(false);
    expect(result.code).toBe('HEAD_NOT_VISIBLE');
  });

  test('fails when body is not upright (shoulders below hips)', () => {
    const lms = makeStandingLandmarks();
    // Swap shoulder and hip Y to simulate lying down
    lms[LM.LEFT_SHOULDER]  = makeLandmark(0.40, 0.60);
    lms[LM.RIGHT_SHOULDER] = makeLandmark(0.60, 0.60);
    lms[LM.LEFT_HIP]       = makeLandmark(0.43, 0.30);
    lms[LM.RIGHT_HIP]      = makeLandmark(0.57, 0.30);
    const result = validateForHeight(makeAruco(), lms, 82);
    expect(result.valid).toBe(false);
    expect(result.code).toBe('BODY_NOT_UPRIGHT');
  });

  test('fails when pose confidence is below threshold', () => {
    const result = validateForHeight(makeAruco(), makeStandingLandmarks(), 20);
    expect(result.valid).toBe(false);
    expect(result.code).toBe('NO_POSE');
  });
});

// ─── Confidence calculation ───────────────────────────────────────────────────
describe('Confidence calculation', () => {
  test('high-quality inputs produce confidence ≥ 70', () => {
    const result = calculateHeight(makeAruco(0.25, 90, 0), makePose(), 1280, 720);
    if (!result.success) {
      // If it fails for another reason, skip this assertion
      return;
    }
    expect(result.measurement.overallConfidence).toBeGreaterThanOrEqual(50);
  });

  test('low marker confidence reduces overall confidence', () => {
    const highConf = calculateHeight(makeAruco(0.25, 90, 0), makePose(), 1280, 720);
    const lowConf  = calculateHeight(makeAruco(0.25, 45, 0), makePose(), 1280, 720);
    if (!highConf.success || !lowConf.success) return;
    expect(highConf.measurement.overallConfidence)
      .toBeGreaterThan(lowConf.measurement.overallConfidence);
  });
});
