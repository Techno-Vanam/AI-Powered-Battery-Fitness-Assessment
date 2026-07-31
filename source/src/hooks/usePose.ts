import { useCallback, useRef } from 'react';
import { useFrameProcessor } from 'react-native-vision-camera';
import { runOnJS } from 'react-native-reanimated';
import { parseNativeResult as parseAruco } from '@vision/aruco/ArucoDetector';
import { parseNativePoseResult } from '@vision/pose/PoseProcessor';
import type { ArucoResult } from '@vision/aruco/Types';
import type { PoseResult } from '@vision/pose/PoseTypes';
import { PerformanceMonitor } from '@utils/PerformanceMonitor';

// Vision Camera Frame Processor plugins registered natively
declare function __detectAruco(frame: unknown): unknown;
declare function __detectPose(frame: unknown): unknown;

const AI_TARGET_INTERVAL_MS = 50; // 20 FPS AI inference target (1000ms / 20 = 50ms)

export function usePose(
  onAruco: (result: ArucoResult) => void,
  onPose:  (result: PoseResult)  => void,
) {
  const onArucoRef = useRef(onAruco);
  onArucoRef.current = onAruco;

  const onPoseRef = useRef(onPose);
  onPoseRef.current = onPose;

  const lastAiExecutionMs = useRef(0);

  const dispatchMetrics = useCallback((arucoMs: number, poseMs: number, totalMs: number) => {
    PerformanceMonitor.recordAiFrame(arucoMs, poseMs, totalMs);
  }, []);

  const dispatchPreviewFrame = useCallback(() => {
    PerformanceMonitor.recordPreviewFrame();
  }, []);

  const dispatchAruco = useCallback((raw: unknown) => {
    onArucoRef.current(parseAruco(raw as Parameters<typeof parseAruco>[0]));
  }, []);

  const dispatchPose = useCallback((raw: unknown) => {
    onPoseRef.current(
      parseNativePoseResult(raw as Parameters<typeof parseNativePoseResult>[0]),
    );
  }, []);

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      // Record preview frame arrival at 30 FPS
      runOnJS(dispatchPreviewFrame)();

      // Throttle AI execution to 20 FPS (50ms interval) to save CPU/battery on 3 GB RAM devices
      const now = Date.now();
      if (now - lastAiExecutionMs.current < AI_TARGET_INTERVAL_MS) {
        return; // Skip AI on this frame while camera preview continues at 30 FPS
      }
      lastAiExecutionMs.current = now;

      const t0 = Date.now();
      const arucoRaw = __detectAruco(frame);
      const t1 = Date.now();
      const poseRaw  = __detectPose(frame);
      const t2 = Date.now();

      const arucoMs = t1 - t0;
      const poseMs = t2 - t1;
      const totalMs = t2 - t0;

      runOnJS(dispatchMetrics)(arucoMs, poseMs, totalMs);
      runOnJS(dispatchAruco)(arucoRaw);
      runOnJS(dispatchPose)(poseRaw);
    },
    [dispatchAruco, dispatchPose, dispatchPreviewFrame, dispatchMetrics],
  );

  return frameProcessor;
}
