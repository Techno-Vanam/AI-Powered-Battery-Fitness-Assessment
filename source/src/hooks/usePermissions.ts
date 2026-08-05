import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  check,
  request,
  openSettings,
} from 'react-native-permissions';
import type { PermissionState, PermissionStatus } from '@app-types/camera';

const CAMERA_PERMISSION =
  Platform.OS === 'android' ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA;

const MICROPHONE_PERMISSION =
  Platform.OS === 'android'
    ? PERMISSIONS.ANDROID.RECORD_AUDIO
    : PERMISSIONS.IOS.MICROPHONE;

function toStatus(result: string): PermissionStatus {
  switch (result) {
    case RESULTS.GRANTED:
      return 'granted';
    case RESULTS.DENIED:
      return 'denied';
    case RESULTS.BLOCKED:
      return 'blocked';
    default:
      return 'unavailable';
  }
}

export function usePermissions() {
  const [state, setState] = useState<PermissionState>({
    camera: 'checking',
    microphone: 'checking',
  });

  const requestPermissions = useCallback(async () => {
    setState({ camera: 'checking', microphone: 'checking' });

    const [cameraResult, micResult] = await Promise.all([
      request(CAMERA_PERMISSION),
      request(MICROPHONE_PERMISSION),
    ]);

    setState({
      camera: toStatus(cameraResult),
      microphone: toStatus(micResult),
    });
  }, []);

  const checkPermissions = useCallback(async () => {
    const [cameraResult, micResult] = await Promise.all([
      check(CAMERA_PERMISSION),
      check(MICROPHONE_PERMISSION),
    ]);

    setState({
      camera: toStatus(cameraResult),
      microphone: toStatus(micResult),
    });
  }, []);

  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  const openAppSettings = useCallback(() => openSettings(), []);

  const isCameraReady = state.camera === 'granted';
  const isChecking = state.camera === 'checking' || state.microphone === 'checking';
  const isBlocked = state.camera === 'blocked';

  return {
    permissionState: state,
    isCameraReady,
    isChecking,
    isBlocked,
    requestPermissions,
    checkPermissions,
    openAppSettings,
  };
}
