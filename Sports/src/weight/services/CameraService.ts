export interface CameraPermissionResult {
  hasPermission: boolean;
  status: 'granted' | 'denied' | 'not-determined';
}

class CameraService {
  private flashMode: 'off' | 'on' | 'auto' = 'off';

  /**
   * Request and check camera permissions using react-native-vision-camera
   */
  async requestCameraPermission(): Promise<CameraPermissionResult> {
    try {
      const { Camera } = require('react-native-vision-camera');
      const status = await Camera.requestCameraPermission();
      return {
        hasPermission: status === 'granted',
        status: status as any
      };
    } catch (error) {
      console.warn('[CameraService] Vision Camera native permission request fallback mode:', error);
      return {
        hasPermission: true,
        status: 'granted'
      };
    }
  }

  /**
   * Toggle flash mode
   */
  toggleFlash(): 'off' | 'on' | 'auto' {
    if (this.flashMode === 'off') this.flashMode = 'on';
    else if (this.flashMode === 'on') this.flashMode = 'auto';
    else this.flashMode = 'off';

    return this.flashMode;
  }

  getFlashMode(): 'off' | 'on' | 'auto' {
    return this.flashMode;
  }
}

export default new CameraService();
