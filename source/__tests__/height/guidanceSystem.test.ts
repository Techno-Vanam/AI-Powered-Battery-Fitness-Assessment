import { MotionTracker, evaluateGuidance } from '../../src/height/GuidanceSystem';
import type { Landmark, PoseDetection } from '../../src/vision/pose/PoseTypes';
import { LM } from '../../src/vision/pose/PoseTypes';
import type { ArucoDetection } from '../../src/vision/aruco/Types';

function makeLandmark(x: number, y: number, visibility = 0.95): Landmark {
  return { x, y, z: 0, visibility, presence: 0.95 };
}

function makeValidLandmarks(): Landmark[] {
  const lms: Landmark[] = new Array(33).fill(null).map(() => makeLandmark(0.5, 0.5));
  lms[LM.NOSE]           = makeLandmark(0.50, 0.12);
  lms[LM.LEFT_EAR]       = makeLandmark(0.44, 0.13);
  lms[LM.RIGHT_EAR]      = makeLandmark(0.56, 0.13);
  lms[LM.LEFT_SHOULDER]  = makeLandmark(0.40, 0.25);
  lms[LM.RIGHT_SHOULDER] = makeLandmark(0.60, 0.25);
  lms[LM.LEFT_HIP]       = makeLandmark(0.43, 0.50);
  lms[LM.RIGHT_HIP]      = makeLandmark(0.57, 0.50);
  lms[LM.LEFT_HEEL]      = makeLandmark(0.43, 0.82);
  lms[LM.RIGHT_HEEL]     = makeLandmark(0.57, 0.82);
  lms[LM.LEFT_ANKLE]     = makeLandmark(0.43, 0.80);
  lms[LM.RIGHT_ANKLE]    = makeLandmark(0.57, 0.80);
  return lms;
}

function makeValidAruco(): ArucoDetection {
  return {
    detected: true,
    markerId: 0,
    markerWidthPixels: 120,
    markerHeightPixels: 120,
    markerCenter: { x: 200, y: 600 },
    rotationAngle: 2,
    cmPerPixel: 0.175,
    confidence: 85,
    corners: [
      { x: 140, y: 540 }, { x: 260, y: 540 },
      { x: 260, y: 660 }, { x: 140, y: 660 },
    ],
  };
}

function makeValidPose(landmarks = makeValidLandmarks()): PoseDetection {
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

describe('Intelligent Guidance System Detections', () => {
  let motionTracker: MotionTracker;

  beforeEach(() => {
    motionTracker = new MotionTracker();
  });

  test('1. Detects Multiple People', () => {
    const multiPose: any = {
      detected: false,
      status: 'MULTIPLE_PEOPLE',
      reason: 'Multiple people detected',
    };
    const result = evaluateGuidance(makeValidAruco(), multiPose, motionTracker);
    expect(result.allPassed).toBe(false);
    expect(result.checks.MULTIPLE_PEOPLE.passed).toBe(false);
    expect(result.primaryMessage).toBe('Multiple People Detected');
  });

  test('2. Detects Marker Missing', () => {
    const result = evaluateGuidance(null, makeValidPose(), motionTracker);
    expect(result.allPassed).toBe(false);
    expect(result.checks.MARKER_MISSING.passed).toBe(false);
    expect(result.primaryMessage).toBe('Keep Marker Visible');
  });

  test('3. Detects Marker Too Small', () => {
    const smallAruco = { ...makeValidAruco(), markerHeightPixels: 20 };
    const result = evaluateGuidance(smallAruco, makeValidPose(), motionTracker);
    expect(result.allPassed).toBe(false);
    expect(result.checks.MARKER_TOO_SMALL.passed).toBe(false);
    expect(result.primaryMessage).toBe('Marker Too Small - Move Closer');
  });

  test('4. Detects Feet Outside Frame', () => {
    const lms = makeValidLandmarks();
    lms[LM.LEFT_HEEL]  = makeLandmark(0.43, 0.99, 0.1);
    lms[LM.RIGHT_HEEL] = makeLandmark(0.57, 0.99, 0.1);
    lms[LM.LEFT_ANKLE]  = makeLandmark(0.43, 0.99, 0.1);
    lms[LM.RIGHT_ANKLE] = makeLandmark(0.57, 0.99, 0.1);
    const pose = makeValidPose(lms);
    const result = evaluateGuidance(makeValidAruco(), pose, motionTracker);
    expect(result.allPassed).toBe(false);
    expect(result.checks.FEET_OUTSIDE.passed).toBe(false);
    expect(result.primaryMessage).toBe('Show Both Feet');
  });

  test('5. Detects Head Outside Frame', () => {
    const lms = makeValidLandmarks();
    lms[LM.NOSE] = makeLandmark(0.50, 0.01, 0.1); // Nose near top edge or low visibility
    const pose = makeValidPose(lms);
    const result = evaluateGuidance(makeValidAruco(), pose, motionTracker);
    expect(result.allPassed).toBe(false);
    expect(result.checks.HEAD_OUTSIDE.passed).toBe(false);
    expect(result.primaryMessage).toBe('Head Outside Frame');
  });

  test('6. Detects Person Too Close', () => {
    const lms = makeValidLandmarks();
    lms[LM.NOSE]       = makeLandmark(0.50, 0.05);
    lms[LM.LEFT_HEEL]  = makeLandmark(0.43, 0.98);
    lms[LM.RIGHT_HEEL] = makeLandmark(0.57, 0.98);
    const pose = makeValidPose(lms);
    const result = evaluateGuidance(makeValidAruco(), pose, motionTracker);
    expect(result.allPassed).toBe(false);
    expect(result.checks.PERSON_TOO_CLOSE.passed).toBe(false);
    expect(result.primaryMessage).toBe('Move Back');
  });

  test('7. Detects Person Too Far', () => {
    const lms = makeValidLandmarks();
    lms[LM.NOSE]       = makeLandmark(0.50, 0.40);
    lms[LM.LEFT_HEEL]  = makeLandmark(0.43, 0.65);
    lms[LM.RIGHT_HEEL] = makeLandmark(0.57, 0.65);
    const pose = makeValidPose(lms);
    const result = evaluateGuidance(makeValidAruco(), pose, motionTracker);
    expect(result.allPassed).toBe(false);
    expect(result.checks.PERSON_TOO_FAR.passed).toBe(false);
    expect(result.primaryMessage).toBe('Move Forward');
  });

  test('8. Detects Camera Tilted', () => {
    const tiltedAruco = { ...makeValidAruco(), rotationAngle: 18 };
    const result = evaluateGuidance(tiltedAruco, makeValidPose(), motionTracker);
    expect(result.allPassed).toBe(false);
    expect(result.checks.CAMERA_TILTED.passed).toBe(false);
    expect(result.primaryMessage).toBe('Stand Straight');
  });

  test('9. Detects Motion Blur', () => {
    // Simulate motion by pushing shifting positions to motion tracker
    const t0 = Date.now();
    for (let i = 0; i < 6; i++) {
      const lms = makeValidLandmarks();
      lms[LM.NOSE] = makeLandmark(0.50 + i * 0.05, 0.12 + i * 0.05);
      motionTracker.push(lms, t0 + i * 50);
    }
    const result = evaluateGuidance(makeValidAruco(), makeValidPose(), motionTracker);
    expect(result.allPassed).toBe(false);
    expect(result.checks.MOTION_BLUR.passed).toBe(false);
    expect(result.primaryMessage).toBe('Hold Still');
  });

  test('10. Detects Poor Lighting', () => {
    const darkAruco = { ...makeValidAruco(), confidence: 25 };
    const result = evaluateGuidance(darkAruco, makeValidPose(), motionTracker);
    expect(result.allPassed).toBe(false);
    expect(result.checks.POOR_LIGHTING.passed).toBe(false);
    expect(result.primaryMessage).toBe('Poor Lighting - Increase Light');
  });

  test('All conditions satisfied → allPassed=true & Hold Position...', () => {
    const result = evaluateGuidance(makeValidAruco(), makeValidPose(), motionTracker);
    expect(result.allPassed).toBe(true);
    expect(result.primaryMessage).toBe('Hold Position...');
  });
});
