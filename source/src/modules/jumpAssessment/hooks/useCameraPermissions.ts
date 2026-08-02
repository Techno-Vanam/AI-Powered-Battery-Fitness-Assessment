/**
 * Hook to manage offline Android camera permissions
 * Checks and prompts for permission dynamically every time a test is initiated.
 */

import { useCallback, useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

export function useCameraPermissions() {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const checkPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      setHasPermission(true);
      return true;
    }
    const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
    setHasPermission(granted);
    return granted;
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    try {
      if (Platform.OS === 'android') {
        const isGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
        if (isGranted) {
          setHasPermission(true);
          setLoading(false);
          return true;
        }

        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission Required',
            message: 'Camera access is required for offline physical fitness assessment (standing jump testing).',
            buttonPositive: 'Grant Permission',
            buttonNegative: 'Deny',
          }
        );
        const success = granted === PermissionsAndroid.RESULTS.GRANTED;
        setHasPermission(success);
        return success;
      } else {
        setHasPermission(true);
        return true;
      }
    } catch (e) {
      console.warn('Camera permission request error:', e);
      setHasPermission(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void requestPermission();
  }, [requestPermission]);

  return { hasPermission, loading, requestPermission, checkPermission };
}
