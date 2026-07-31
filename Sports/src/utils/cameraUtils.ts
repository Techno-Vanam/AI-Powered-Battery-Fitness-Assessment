import type { CameraDevice, CameraFormat } from 'react-native-vision-camera';

const TARGET_WIDTH = 1280;
const TARGET_HEIGHT = 720;
const TARGET_FPS = 30;

/**
 * Selects the best CameraFormat from a device that matches 720p @ 30fps.
 * Falls back to the closest available format if exact match is not found.
 */
export function selectBestFormat(device: CameraDevice): CameraFormat | undefined {
  const formats = device.formats;
  if (!formats || formats.length === 0) return undefined;

  // First try exact 720p @ 30fps
  const exact = formats.find(
    f =>
      f.videoWidth === TARGET_WIDTH &&
      f.videoHeight === TARGET_HEIGHT &&
      f.maxFps >= TARGET_FPS,
  );
  if (exact) return exact;

  // Score each format by closeness to target resolution and fps
  const scored = formats
    .filter(f => f.maxFps >= TARGET_FPS)
    .map(f => {
      const resDiff =
        Math.abs(f.videoWidth - TARGET_WIDTH) + Math.abs(f.videoHeight - TARGET_HEIGHT);
      return { format: f, score: resDiff };
    })
    .sort((a, b) => a.score - b.score);

  return scored[0]?.format ?? formats[0];
}

export function formatResolution(format: CameraFormat | undefined): string {
  if (!format) return 'Unknown';
  return `${format.videoWidth}×${format.videoHeight}`;
}
