import { useCallback, useRef, useState } from 'react';
import { parseNativePoseResult } from './PoseProcessor';
import type { PoseResult } from './PoseTypes';

const INITIAL_POSE: PoseResult = {
  detected: false,
  status: 'INITIALIZING',
  reason: 'Pose model initializing…',
};

/**
 * Manages the latest PoseResult state.
 * Returns a stable dispatch function safe to call from runOnJS.
 */
export function usePoseDetector() {
  const [poseResult, setPoseResult] = useState<PoseResult>(INITIAL_POSE);
  const poseResultRef = useRef<PoseResult>(INITIAL_POSE);

  const dispatchPoseResult = useCallback((raw: unknown) => {
    const result = parseNativePoseResult(
      raw as Parameters<typeof parseNativePoseResult>[0],
    );
    poseResultRef.current = result;
    setPoseResult(result);
  }, []);

  return { poseResult, poseResultRef, dispatchPoseResult };
}
