import { NativeModules } from 'react-native';

const { SitReachNative } = NativeModules as { SitReachNative?: { isModelAvailable: () => Promise<boolean> } };

export const isModelAvailable = async (): Promise<boolean> => {
  try {
    if (!SitReachNative || typeof SitReachNative.isModelAvailable !== 'function') return false;
    const available = await SitReachNative.isModelAvailable();
    return !!available;
  } catch (e) {
    return false;
  }
};

export type PoseDetectionStatus = 'checking' | 'ready' | 'missing' | 'error';

export const loadPoseModel = async (): Promise<PoseDetectionStatus> => {
  try {
    const available = await isModelAvailable();
    return available ? 'ready' : 'missing';
  } catch {
    return 'error';
  }
};
