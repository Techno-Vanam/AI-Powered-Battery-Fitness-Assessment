import { isVisible, isInFrame, countVisible, poseConfidenceLabel, toPixel } from '../../src/vision/pose/PoseMath';
import { parseNativePoseResult } from '../../src/vision/pose/PoseProcessor';
import type { Landmark } from '../../src/vision/pose/PoseTypes';
import { LM } from '../../src/vision/pose/PoseTypes';

function makeLm(x: number, y: number, vis = 0.9): Landmark {
  return { x, y, z: 0, visibility: vis, presence: vis };
}

function make33Landmarks(): Landmark[] {
  const lms: Landmark[] = new Array(33).fill(null).map(() => makeLm(0.5, 0.5));
  lms[LM.NOSE]           = makeLm(0.5, 0.1);
  lms[LM.LEFT_HEEL]      = makeLm(0.4, 0.9);
  lms[LM.RIGHT_HEEL]     = makeLm(0.6, 0.9);
  lms[LM.LEFT_SHOULDER]  = makeLm(0.4, 0.2);
  lms[LM.RIGHT_SHOULDER] = makeLm(0.6, 0.2);
  lms[LM.LEFT_HIP]       = makeLm(0.4, 0.5);
  lms[LM.RIGHT_HIP]      = makeLm(0.6, 0.5);
  return lms;
}

describe('Unit Tests - Pose Module', () => {
  test('isVisible returns true when landmark visibility >= threshold', () => {
    expect(isVisible(makeLm(0.5, 0.5, 0.8), 0.5)).toBe(true);
    expect(isVisible(makeLm(0.5, 0.5, 0.2), 0.5)).toBe(false);
  });

  test('isInFrame verifies normalized coordinates are within screen margin', () => {
    expect(isInFrame(makeLm(0.5, 0.5))).toBe(true);
    expect(isInFrame(makeLm(-0.05, 0.5))).toBe(false);
    expect(isInFrame(makeLm(0.5, 1.05))).toBe(false);
  });

  test('countVisible counts landmarks meeting visibility threshold', () => {
    const lms = make33Landmarks();
    expect(countVisible(lms)).toBeGreaterThanOrEqual(7);
  });

  test('poseConfidenceLabel categorizes confidence scores', () => {
    expect(poseConfidenceLabel(90)).toBe('Excellent');
    expect(poseConfidenceLabel(70)).toBe('Good');
    expect(poseConfidenceLabel(50)).toBe('Fair');
    expect(poseConfidenceLabel(30)).toBe('Poor');
  });

  test('toPixel maps normalized coordinates to screen pixel dimensions', () => {
    const pt = toPixel(makeLm(0.5, 0.5), 1280, 720);
    expect(pt.px).toBe(640);
    expect(pt.py).toBe(360);
  });

  test('parseNativePoseResult parses valid standing pose payload', () => {
    const raw = {
      detected: true,
      landmarks: make33Landmarks(),
      visibleCount: 28,
      overallConfidence: 85,
      processingTimeMs: 12,
    };
    const parsed = parseNativePoseResult(raw);
    expect(parsed.detected).toBe(true);
    if (!parsed.detected) return;
    expect(parsed.status).toBe('OK');
    expect(parsed.overallConfidence).toBe(85);
  });

  test('parseNativePoseResult returns error status for missing person or low confidence', () => {
    const rawNoPerson = { detected: false, status: 'NO_PERSON' };
    const parsedNoPerson = parseNativePoseResult(rawNoPerson);
    expect(parsedNoPerson.detected).toBe(false);

    const rawLowConf = {
      detected: true,
      landmarks: make33Landmarks(),
      overallConfidence: 20, // Below threshold
    };
    const parsedLowConf = parseNativePoseResult(rawLowConf);
    expect(parsedLowConf.detected).toBe(false);
  });
});
