/**
 * Hook for Standing Vertical Jump measurement
 */

import { useState, useCallback, useRef } from 'react';
import { JumpStateMachine } from '../services/jumpStateMachine';
import { MeasurementEngine } from '../services/measurementEngine';
import { FramePoseData } from '../types/pose';
import { JumpState, VerticalJumpMetrics } from '../types/jump';
import { KalmanFilter1D } from '../services/kalmanFilter';

export function useVerticalJump(pixelsPerCm: number) {
  const [jumpState, setJumpState] = useState<JumpState>('IDLE');
  const [standingReachPixels, setStandingReachPixels] = useState<number | null>(null);
  const [highestReachPixels, setHighestReachPixels] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<VerticalJumpMetrics | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(3);

  const stateMachineRef = useRef<JumpStateMachine>(new JumpStateMachine());
  const measurementEngineRef = useRef<MeasurementEngine>(new MeasurementEngine());
  const kalmanFilterRef = useRef<KalmanFilter1D>(new KalmanFilter1D());

  const captureStandingReach = useCallback((pose: FramePoseData, frameHeight: number = 720) => {
    const reachPixels = measurementEngineRef.current.calculateFingertipY(pose, frameHeight);
    kalmanFilterRef.current.init(reachPixels);
    setStandingReachPixels(reachPixels);
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
    (pose: FramePoseData, frameHeight: number = 720) => {
      const currentState = stateMachineRef.current.getState();
      if (currentState === 'IDLE' || currentState === 'READY') return;

      const rawFingertipY = measurementEngineRef.current.calculateFingertipY(pose, frameHeight);
      const smoothedFingertipY = kalmanFilterRef.current.update(rawFingertipY);

      // Track highest reach during jump
      setHighestReachPixels((prev) => {
        const nextHighest = prev === null ? smoothedFingertipY : Math.max(prev, smoothedFingertipY);
        return nextHighest;
      });

      // Update state machine
      const nextState = stateMachineRef.current.update({
        timestampMs: pose.timestampMs,
        hipVelocityY: 0.1, // mock or extracted velocity
        feetOnGround: true,
        standingReachCaptured: standingReachPixels !== null,
      });

      setJumpState(nextState);

      // Compute final result when complete
      if (nextState === 'COMPLETE' && standingReachPixels !== null && highestReachPixels !== null) {
        const finalMetrics = measurementEngineRef.current.computeVerticalJump(
          standingReachPixels,
          highestReachPixels,
          pixelsPerCm
        );
        setMetrics(finalMetrics);
      }
    },
    [standingReachPixels, highestReachPixels, pixelsPerCm]
  );

  const resetTest = useCallback(() => {
    stateMachineRef.current.reset();
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
