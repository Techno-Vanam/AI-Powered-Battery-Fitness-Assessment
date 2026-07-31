import { MotionTracker, evaluateGuidance } from '../../src/height/GuidanceSystem';
import { calculateHeight } from '../../src/height/HeightCalculator';
import { HeightSmoother } from '../../src/height/HeightSmoother';
import type { Landmark, PoseDetection } from '../../src/vision/pose/PoseTypes';
import { LM } from '../../src/vision/pose/PoseTypes';
import type { ArucoDetection } from '../../src/vision/aruco/Types';

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
  return lms;
}

function makeAruco(): ArucoDetection {
  return {
    detected: true,
    markerId: 0,
    markerWidthPixels: 84,
    markerHeightPixels: 84,
    markerCenter: { x: 640, y: 680 },
    rotationAngle: 2,
    cmPerPixel: 0.25,
    confidence: 85,
    corners: [
      { x: 580, y: 660 }, { x: 700, y: 660 },
      { x: 700, y: 700 }, { x: 580, y: 700 },
    ],
  };
}

function makePose(): PoseDetection {
  return {
    detected: true,
    status: 'OK',
    landmarks: makeValid33(),
    visibleCount: 28,
    overallConfidence: 85,
    timestampMs: Date.now(),
    processingTimeMs: 10,
  };
}

describe('Integration Tests - Height Measurement Pipeline', () => {
  test('Full pipeline: ArUco + Pose frame feeds -> Guidance pass -> Height Calculation -> Smoother', () => {
    const motionTracker = new MotionTracker();
    const aruco = makeAruco();
    const pose = makePose();

    // 1. Evaluate Guidance
    const guidance = evaluateGuidance(aruco, pose, motionTracker, 3);
    expect(guidance.allPassed).toBe(true);
    expect(guidance.primaryMessage).toBe('Hold Position...');
    expect(guidance.countdown).toBe(3);

    // 2. Calculate Height
    const heightRes = calculateHeight(aruco, pose, 1280, 720);
    expect(heightRes.success).toBe(true);
    if (!heightRes.success) return;

    // 3. Smooth height
    const smoother = new HeightSmoother();
    const smoothed = smoother.push(heightRes.measurement.heightCm);
    expect(smoothed.heightCm).toBeCloseTo(heightRes.measurement.heightCm, 0);
  });
});
