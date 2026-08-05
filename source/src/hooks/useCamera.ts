import { useCallback, useEffect, useRef, useState } from 'react';
import {
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
} from 'react-native-vision-camera';
import { selectBestFormat, formatResolution } from '@utils/cameraUtils';
import type { CameraConfig, CameraStats } from '@app-types/camera';

const TARGET_FPS = 30;

export function useCamera() {
  const device = useCameraDevice('back');
  const permission = useCameraPermission();

  const format = useCameraFormat(device, [
    { videoResolution: { width: 1280, height: 720 } },
    { fps: TARGET_FPS },
  ]);

  const [config, setConfig] = useState<CameraConfig>({
    device: undefined,
    format: undefined,
    isReady: false,
    error: null,
  });

  const [stats, setStats] = useState<CameraStats>({
    fps: 0,
    frameCount: 0,
    resolution: 'Unknown',
    deviceName: 'Unknown',
    isActive: false,
  });

  // FPS tracking
  const frameCountRef = useRef(0);
  const lastFpsTimestamp = useRef(Date.now());
  const fpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!device) {
      setConfig({ device: undefined, format: undefined, isReady: false, error: 'No rear camera found on this device.' });
      return;
    }

    const bestFormat = format ?? selectBestFormat(device);

    setConfig({
      device,
      format: bestFormat,
      isReady: true,
      error: null,
    });

    setStats(prev => ({
      ...prev,
      resolution: formatResolution(bestFormat),
      deviceName: device.name ?? device.id,
      isActive: true,
    }));
  }, [device, format]);

  // Start FPS counter interval
  useEffect(() => {
    fpsIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - lastFpsTimestamp.current) / 1000;
      const currentFps = elapsed > 0 ? Math.round(frameCountRef.current / elapsed) : 0;

      frameCountRef.current = 0;
      lastFpsTimestamp.current = now;

      setStats(prev => ({ ...prev, fps: currentFps }));
    }, 1000);

    return () => {
      if (fpsIntervalRef.current) clearInterval(fpsIntervalRef.current);
    };
  }, []);

  /**
   * Called from the frame processor worklet via worklets-core useRunOnJS.
   * Increments frame counter used for FPS calculation.
   */
  const onFrameProcessed = useCallback(() => {
    frameCountRef.current += 1;
    setStats(prev => ({ ...prev, frameCount: prev.frameCount + 1 }));
  }, []);

  return {
    config,
    stats,
    permission,
    onFrameProcessed,
  };
}
