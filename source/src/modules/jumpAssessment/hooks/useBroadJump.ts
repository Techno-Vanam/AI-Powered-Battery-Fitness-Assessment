/**
 * Hook for Standing Broad Jump measurement
 */

import { useState, useCallback, useRef } from 'react';
import { JumpStateMachine } from '../services/jumpStateMachine';
import { MeasurementEngine } from '../services/measurementEngine';
import { FramePoseData, PoseLandmarkIndex } from '../types/pose';
import { JumpState, BroadJumpMetrics } from '../types/jump';
import { KalmanFilter1D } from '../services/kalmanFilter';

export function useBroadJump(pixelsPerCm: number) {
  const [jumpState, setJumpState] = useState<JumpState>('IDLE');
  const [takeoffLineX, setTakeoffLineX] = useState<number | null>(null);
  const [landingHeelX, setLandingHeelX] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<BroadJumpMetrics | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(3);

  const stateMachineRef = useRef<JumpStateMachine>(new JumpStateMachine());
  const measurementEngineRef = useRef<MeasurementEngine>(new MeasurementEngine());
  const heelFilterRef = useRef<KalmanFilter1D>(new KalmanFilter1D());

  const captureTakeoffLine = useCallback((pose: FramePoseData, frameWidth: number = 1280) => {
    const leftHeel = pose.landmarks[PoseLandmarkIndex.LEFT_HEEL];
    const rightHeel = pose.landmarks[PoseLandmarkIndex.RIGHT_HEEL];

    let heelXPixel = frameWidth / 2;
    if (leftHeel && rightHeel) {
      heelXPixel = ((leftHeel.x + rightHeel.x) / 2) * frameWidth;
    }

    heelFilterRef.current.init(heelXPixel);
    setTakeoffLineX(heelXPixel);
    stateMachineRef.current.transitionTo('READY');
    setJumpState('READY');
  }, []);

  const startCountdown = useCallback(() => {
    stateMachineRef.current.transitionTo('COUNTDOWN');
    setJumpState('COUNTDOWN');
    setCountdownSeconds(3);

    let currentSec = 3;
    const interval = setInterval(() => {
      currentSec -= 1;
      setCountdownSeconds(currentSec);
      if (currentSec <= 0) {
        clearInterval(interval);
        stateMachineRef.current.transitionTo('TAKEOFF');
        setJumpState('TAKEOFF');
      }
    }, 1000);
  }, []);

  const processFrame = useCallback(
    (pose: FramePoseData, frameWidth: number = 1280) => {
      const currentState = stateMachineRef.current.getState();
      if (currentState === 'IDLE' || currentState === 'READY') return;

      const leftHeel = pose.landmarks[PoseLandmarkIndex.LEFT_HEEL];
      const rightHeel = pose.landmarks[PoseLandmarkIndex.RIGHT_HEEL];
      if (!leftHeel && !rightHeel) return;

      const rawHeelX = (((leftHeel?.x ?? 0) + (rightHeel?.x ?? 0)) / 2) * frameWidth;
      const smoothedHeelX = heelFilterRef.current.update(rawHeelX);

      // Track state machine
      const nextState = stateMachineRef.current.update({
        timestampMs: pose.timestampMs,
        hipVelocityY: 0.0,
        feetOnGround: true,
        standingReachCaptured: true,
      });

      setJumpState(nextState);

      if (nextState === 'LANDING' || nextState === 'COMPLETE') {
        setLandingHeelX(smoothedHeelX);
      }

      if (nextState === 'COMPLETE' && takeoffLineX !== null) {
        const finalMetrics = measurementEngineRef.current.computeBroadJump(
          takeoffLineX,
          smoothedHeelX,
          pixelsPerCm,
          500
        );
        setMetrics(finalMetrics);
      }
    },
    [takeoffLineX, pixelsPerCm]
  );

  const resetTest = useCallback(() => {
    stateMachineRef.current.reset();
    setJumpState('IDLE');
    setTakeoffLineX(null);
    setLandingHeelX(null);
    setMetrics(null);
    setCountdownSeconds(3);
  }, []);

  return {
    jumpState,
    takeoffLineX,
    landingHeelX,
    metrics,
    countdownSeconds,
    captureTakeoffLine,
    startCountdown,
    processFrame,
    resetTest,
  };
}
