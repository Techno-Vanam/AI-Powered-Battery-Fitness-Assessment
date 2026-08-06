/**
 * Camera permission helper for jump assessment screens.
 * Uses VisionCamera's permission API (required for JumpCameraView).
 */

import { useCallback } from 'react';
import { useCameraPermission } from 'react-native-vision-camera';

export function useCameraPermissions() {
  const { hasPermission, requestPermission } = useCameraPermission();

  const checkPermission = useCallback(async (): Promise<boolean> => {
    return hasPermission;
  }, [hasPermission]);

  const requestPermissionAsync = useCallback(async (): Promise<boolean> => {
    if (hasPermission) return true;
    return requestPermission();
  }, [hasPermission, requestPermission]);

  return {
    hasPermission,
    loading: false,
    requestPermission: requestPermissionAsync,
    checkPermission,
  };
}

export { useCameraPermission as useCameraPermissionsLegacy };
