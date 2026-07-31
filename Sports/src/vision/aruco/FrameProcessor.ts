import { useCallback, useRef } from 'react';
import { useFrameProcessor } from 'react-native-vision-camera';
import { runOnJS } from 'react-native-reanimated';
import { parseNativeResult } from './ArucoDetector';
import type { ArucoResult } from './Types';

// Vision Camera Frame Processor plugin registered in ArucoPackage.kt
declare function __detectAruco(frame: unknown): unknown;

/**
 * Returns a Vision Camera frameProcessor that runs ArUco detection on every
 * frame at native speed and calls onResult on the JS thread.
 */
export function useArucoFrameProcessor(
  onResult: (result: ArucoResult) => void,
) {
  // Stable ref so the worklet closure never captures a stale callback
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const dispatchResult = useCallback((raw: unknown) => {
    const result = parseNativeResult(raw as Parameters<typeof parseNativeResult>[0]);
    onResultRef.current(result);
  }, []);

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      const raw = __detectAruco(frame);
      runOnJS(dispatchResult)(raw);
    },
    [dispatchResult],
  );

  return frameProcessor;
}
