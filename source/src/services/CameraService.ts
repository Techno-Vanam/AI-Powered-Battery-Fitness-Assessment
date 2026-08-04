import { PermissionsAndroid, Platform } from 'react-native';

export const CameraService = {
  /**
   * Request camera permission for Android 10 (API 29) & Android 11+
   */
  async requestCameraPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App requires access to your camera to scan weighing scale displays.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('[CameraService] Permission request error:', err);
        return false;
      }
    }
    return true;
  },

  /**
   * Helper to compute crop coordinates for LCD alignment frame overlay
   */
  getLCDCropFrameDimensions(screenWidth: number, screenHeight: number) {
    const frameWidth = screenWidth * 0.8;
    const frameHeight = 140;
    const frameX = (screenWidth - frameWidth) / 2;
    const frameY = (screenHeight - frameHeight) / 2 - 40;

    return {
      x: frameX,
      y: frameY,
      width: frameWidth,
      height: frameHeight,
    };
  },
};
