/**
 * Hook for Standing Vertical Jump measurement
 * (feature/vertical-and-broad-jump module)
 */

import { useState, useCallback, useRef } from 'react';
import { JumpStateMachine } from '../services/jumpStateMachine';
import { MeasurementEngine } from '../services/measurementEngine';
import { FramePoseData, PoseLandmarkIndex } from '../types/pose';
import { JumpState, VerticalJumpMetrics } from '../types/jump';
import { KalmanFilter1D } from '../services/kalmanFilter';

function averageHipY(pose: FramePoseData): number {
  const left = pose.landmarks[PoseLandmarkIndex.LEFT_HIP];
  const right = pose.landmarks[PoseLandmarkIndex.RIGHT_HIP];
  if (left && right) return (left.y + right.y) / 2;
  return left?.y ?? right?.y ?? 0.5;
}

export function useVerticalJump(pixelsPerCm: number) {
  const [jumpState, setJumpState] = useState<JumpState>('IDLE');
  const [standingReachPixels, setStandingReachPixels] = useState<number | null>(null);
  const [highestReachPixels, setHighestReachPixels] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<VerticalJumpMetrics | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(3);

  const stateMachineRef = useRef(new JumpStateMachine());
  const measurementEngineRef = useRef(new MeasurementEngine());
  const kalmanFilterRef = useRef(new KalmanFilter1D());
  const prevHipYRef = useRef<number | null>(null);
  const prevTimestampRef = useRef<number | null>(null);
  const highestReachRef = useRef<number | null>(null);
  const standingReachRef = useRef<number | null>(null);
  const jumpStartTimeRef = useRef<number | null>(null);

  const captureStandingReach = useCallback((pose: FramePoseData, frameHeight: number = 720) => {
    const reachPixels = measurementEngineRef.current.calculateFingertipY(pose, frameHeight);
    kalmanFilterRef.current.init(reachPixels);
    standingReachRef.current = reachPixels;
    highestReachRef.current = reachPixels;
    setStandingReachPixels(reachPixels);
    setHighestReachPixels(reachPixels);
    stateMachineRef.current.transitionTo('READY');
    setJumpState('READY');
  }, []);

  const startCountdown = useCallback(() => {
    stateMachineRef.current.transitionTo('COUNTDOWN');
    setJumpState('COUNTDOWN');
    setCountdownSeconds(3);
    jumpStartTimeRef.current = null;

    let currentSec = 3;
    const interval = setInterval(() => {
      currentSec -= 1;
      setCountdownSeconds(currentSec);
      if (currentSec <= 0) {
        clearInterval(interval);
        stateMachineRef.current.transitionTo('TAKEOFF');
        setJumpState('TAKEOFF');
        jumpStartTimeRef.current = Date.now();
      }
    }, 1000);
  }, []);

  const finalizeMetrics = useCallback(
    (standing: number, highest: number) => {
      const finalMetrics = measurementEngineRef.current.computeVerticalJump(
        standing,
        highest,
        pixelsPerCm,
      );
      setMetrics(finalMetrics);
      stateMachineRef.current.transitionTo('COMPLETE');
      setJumpState('COMPLETE');
    },
    [pixelsPerCm],
  );

  const processFrame = useCallback(
    (pose: FramePoseData, frameHeight: number = 720) => {
      const currentState = stateMachineRef.current.getState();
      if (currentState === 'IDLE' || currentState === 'READY') return;

      const rawFingertipY = measurementEngineRef.current.calculateFingertipY(pose, frameHeight);
      const smoothedFingertipY = kalmanFilterRef.current.update(rawFingertipY);

      const nextHighest =
        highestReachRef.current === null
          ? smoothedFingertipY
          : Math.max(highestReachRef.current, smoothedFingertipY);
      highestReachRef.current = nextHighest;
      setHighestReachPixels(nextHighest);

      const hipY = averageHipY(pose);
      let hipVelocityY = 0.12;
      if (prevHipYRef.current !== null && prevTimestampRef.current !== null) {
        const dt = Math.max((pose.timestampMs - prevTimestampRef.current) / 1000, 0.001);
        hipVelocityY = (prevHipYRef.current - hipY) / dt;
      }
      prevHipYRef.current = hipY;
      prevTimestampRef.current = pose.timestampMs;

      const reachGain =
        standingReachRef.current !== null ? nextHighest - standingReachRef.current : 0;
      const feetOnGround = reachGain < 8;

      let nextState = stateMachineRef.current.update({
        timestampMs: pose.timestampMs,
        hipVelocityY,
        feetOnGround,
        standingReachCaptured: standingReachRef.current !== null,
      });

      if (
        nextState !== 'COMPLETE' &&
        standingReachRef.current !== null &&
        reachGain >= 12 &&
        jumpStartTimeRef.current !== null &&
        Date.now() - jumpStartTimeRef.current > 1200
      ) {
        finalizeMetrics(standingReachRef.current, nextHighest);
        nextState = 'COMPLETE';
      }

      setJumpState(nextState);

      if (nextState === 'COMPLETE' && standingReachRef.current !== null && !metrics) {
        finalizeMetrics(standingReachRef.current, nextHighest);
      }
    },
    [finalizeMetrics, metrics],
  );

  const resetTest = useCallback(() => {
    stateMachineRef.current.reset();
    kalmanFilterRef.current = new KalmanFilter1D();
    prevHipYRef.current = null;
    prevTimestampRef.current = null;
    highestReachRef.current = null;
    standingReachRef.current = null;
    jumpStartTimeRef.current = null;
    setJumpState('IDLE');
    setStandingReachPixels(null);
    setHighestReachPixels(null);
    setMetrics(null);
    setCountdownSeconds(3);
  }, []);

  return {
    jumpState,
    standingReachPixels,
    highestReachPixels,
    metrics,
    countdownSeconds,
    captureStandingReach,
    startCountdown,
    processFrame,
    resetTest,
  };
}
