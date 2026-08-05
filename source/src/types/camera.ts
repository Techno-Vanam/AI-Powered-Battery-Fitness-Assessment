import type { CameraDevice, CameraDeviceFormat } from 'react-native-vision-camera';
import type { Athlete } from '../database/repositories/AthleteRepository';

export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'unavailable' | 'checking';

export interface PermissionState {
  camera: PermissionStatus;
  microphone: PermissionStatus;
}

export interface CameraStats {
  fps: number;
  frameCount: number;
  resolution: string;
  deviceName: string;
  isActive: boolean;
}

export interface CameraConfig {
  device: CameraDevice | undefined;
  format: CameraDeviceFormat | undefined;
  isReady: boolean;
  error: string | null;
}

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  AthleteHome: undefined;
  AthleteRegistration: { athleteId?: string; athlete?: Athlete } | undefined;
  AthleteList: { selectForTest?: boolean } | undefined;
  HeightTestInstructions: { athlete: Athlete };
  Camera: { athlete: Athlete } | { athleteName?: string } | undefined;
  History: { athleteId?: string } | undefined;
  SyncStatus: undefined;
  Settings: undefined;
  HeightResult: {
    athlete: Athlete;
    measurementId: string;
    heightCm: number;
    confidence: number;
    timestamp: number;
    attemptCount: number;
    canRetry: boolean;
  };
};

