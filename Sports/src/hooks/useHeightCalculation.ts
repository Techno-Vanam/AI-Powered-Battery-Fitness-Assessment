import { useCallback, useEffect, useRef, useState } from 'react';
import type { ArucoResult } from '@vision/aruco/Types';
import type { PoseResult } from '@vision/pose/PoseTypes';
import { calculateHeight } from '@height/HeightCalculator';
import { HeightSmoother } from '@height/HeightSmoother';
import { MotionTracker, evaluateGuidance } from '@height/GuidanceSystem';
import type {
  HeightMeasurement,
  MeasurementStatus,
  SmoothedHeight,
  GuidanceState,
} from '@height/HeightTypes';

export interface HeightState {
  status: MeasurementStatus;
  measurement: HeightMeasurement | null;
  smoothed: SmoothedHeight | null;
  errorReason: string | null;
  frameWidth: number;
  frameHeight: number;
  guidance: GuidanceState;
  autoCaptureTriggered: boolean;
}

const INITIAL_GUIDANCE: GuidanceState = {
  allPassed: false,
  primaryMessage: 'Keep Marker Visible',
  countdown: null,
  checks: {
    MULTIPLE_PEOPLE:  { passed: true, message: 'Only 1 Person in Frame' },
    MARKER_MISSING:   { passed: false, message: 'Keep Marker Visible' },
    MARKER_TOO_SMALL: { passed: true, message: 'Marker Too Small - Move Closer' },
    FEET_OUTSIDE:     { passed: false, message: 'Show Both Feet' },
    HEAD_OUTSIDE:     { passed: false, message: 'Head Outside Frame' },
    PERSON_TOO_CLOSE: { passed: true, message: 'Move Back' },
    PERSON_TOO_FAR:   { passed: true, message: 'Move Forward' },
    CAMERA_TILTED:    { passed: true, message: 'Stand Straight' },
    MOTION_BLUR:      { passed: true, message: 'Hold Still' },
    POOR_LIGHTING:    { passed: true, message: 'Poor Lighting - Increase Light' },
  },
};

const INITIAL_STATE: HeightState = {
  status:       'SEARCHING',
  measurement:  null,
  smoothed:     null,
  errorReason:  null,
  frameWidth:   1280,
  frameHeight:  720,
  guidance:     INITIAL_GUIDANCE,
  autoCaptureTriggered: false,
};

export function useHeightCalculation(
  frameWidth: number,
  frameHeight: number,
  onAutoCapture?: () => void,
) {
  const [state, setState] = useState<HeightState>({
    ...INITIAL_STATE,
    frameWidth,
    frameHeight,
  });

  const arucoRef = useRef<ArucoResult | null>(null);
  const poseRef = useRef<PoseResult | null>(null);
  const smootherRef = useRef(new HeightSmoother());
  const motionTrackerRef = useRef(new MotionTracker());

  const lastPoseDetected = useRef(false);
  const countdownStartTime = useRef<number | null>(null);
  const autoCaptureFired = useRef(false);

  // ── Process frame ─────────────────────────────────────────────────────────
  const processFrame = useCallback(() => {
    const aruco = arucoRef.current;
    const pose = poseRef.current;

    // 1. Evaluate Intelligent Guidance Conditions
    let currentCountdown: number | null = null;

    // Calculate countdown if conditions pass
    if (countdownStartTime.current !== null) {
      const elapsedMs = Date.now() - countdownStartTime.current;
      if (elapsedMs >= 2700) {
        currentCountdown = 0;
      } else if (elapsedMs >= 1800) {
        currentCountdown = 1;
      } else if (elapsedMs >= 900) {
        currentCountdown = 2;
      } else {
        currentCountdown = 3;
      }
    }

    const guidance = evaluateGuidance(aruco, pose, motionTrackerRef.current, currentCountdown);

    if (guidance.allPassed) {
      if (countdownStartTime.current === null) {
        countdownStartTime.current = Date.now();
        guidance.countdown = 3;
      }
    } else {
      countdownStartTime.current = null;
      guidance.countdown = null;
      autoCaptureFired.current = false;
    }

    // 2. Height Calculation & Smoothing
    let measurement: HeightMeasurement | null = null;
    let smoothed: SmoothedHeight | null = null;
    let status: MeasurementStatus = 'SEARCHING';
    let errorReason: string | null = guidance.primaryMessage;

    if (aruco?.detected && pose?.detected) {
      if (!lastPoseDetected.current) {
        smootherRef.current.reset();
      }
      lastPoseDetected.current = true;

      const calcResult = calculateHeight(aruco, pose, frameWidth, frameHeight);
      if (calcResult.success) {
        measurement = calcResult.measurement;
        smoothed = smootherRef.current.push(measurement.heightCm, Date.now());

        status = guidance.allPassed ? 'HEIGHT_MEASURED' : smoothed.isStable ? 'HOLD_STILL' : 'POSE_LOCKED';
        if (guidance.allPassed) {
          errorReason = null;
        }
      } else {
        status = 'POSE_LOCKED';
        errorReason = calcResult.reason;
      }
    } else {
      lastPoseDetected.current = false;
      smootherRef.current.reset();
      if (aruco?.detected && !pose?.detected) {
        status = 'MARKER_DETECTED';
      }
    }

    // Check for auto-capture trigger (when countdown hits 0)
    let shouldAutoCapture = false;
    if (guidance.allPassed && guidance.countdown === 0 && !autoCaptureFired.current) {
      autoCaptureFired.current = true;
      shouldAutoCapture = true;
    }

    setState(prev => ({
      ...prev,
      status,
      measurement,
      smoothed,
      errorReason,
      guidance,
      autoCaptureTriggered: shouldAutoCapture || prev.autoCaptureTriggered,
    }));

    if (shouldAutoCapture && onAutoCapture) {
      onAutoCapture();
    }
  }, [frameWidth, frameHeight, onAutoCapture]);

  // ── Frame processor callbacks ─────────────────────────────────────────────
  const onArucoResult = useCallback((result: ArucoResult) => {
    arucoRef.current = result;
    if (!result.detected) {
      lastPoseDetected.current = false;
    }
    processFrame();
  }, [processFrame]);

  const onPoseResult = useCallback((result: PoseResult) => {
    poseRef.current = result;
    if (!result.detected) {
      lastPoseDetected.current = false;
      smootherRef.current.reset();
      motionTrackerRef.current.reset();
    }
    processFrame();
  }, [processFrame]);

  useEffect(() => {
    setState(prev => ({ ...prev, frameWidth, frameHeight }));
  }, [frameWidth, frameHeight]);

  return { state, onArucoResult, onPoseResult, poseResult: poseRef.current };
}
