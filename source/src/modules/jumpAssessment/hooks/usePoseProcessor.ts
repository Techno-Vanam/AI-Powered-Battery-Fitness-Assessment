/**
 * Hook to bridge FrameProcessor outputs to React Native UI state
 */

import { useState, useCallback } from 'react';
import { FramePoseData } from '../types/pose';

export function usePoseProcessor() {
  const [currentPose, setCurrentPose] = useState<FramePoseData | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const onFrameProcessed = useCallback((poseData: FramePoseData) => {
    setIsProcessing(true);
    setCurrentPose(poseData);
    setIsProcessing(false);
  }, []);

  return {
    currentPose,
    isProcessing,
    onFrameProcessed,
  };
}
