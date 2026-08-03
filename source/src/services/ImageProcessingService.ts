import { Platform, Dimensions } from 'react-native';
import { SevenSegmentNativeBridge } from './SevenSegmentNativeBridge';

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * ImageProcessingService
 *
 * Handles image path formatting and LCD crop preparation.
 *
 * Cropping strategy:
 * - If the native SevenSegmentAnalyzerModule is available, call its
 *   cropImageToTemp() method to get a JPEG crop of just the LCD area.
 *   This uses Android's Bitmap.createBitmap() internally — no npm deps.
 * - If native isn't available (before first build), pass the full image URI.
 *   ML Kit can still read from the full frame (lower accuracy).
 *
 * The native seven-segment analysis also receives the full image + cropRect
 * and performs its own internal crop on the bitmap, so no double-crop occurs.
 */
export const ImageProcessingService = {
  /**
   * Returns a properly preprocessed image URI for OCR:
   * - Native available: returns cropped JPEG of the LCD region only
   * - Native unavailable: returns the full formatted file:// URI
   */
  async cropLCDDisplayArea(
    imagePath: string,
    cropRect?: CropRect
  ): Promise<string> {
    if (!imagePath) {
      throw new Error('Image path is required for processing');
    }

    const formattedPath =
      Platform.OS === 'android' && !imagePath.startsWith('file://')
        ? `file://${imagePath}`
        : imagePath;

    // Use native Kotlin crop for the ML Kit fallback path
    if (cropRect && SevenSegmentNativeBridge.isAvailable()) {
      const croppedUri = await SevenSegmentNativeBridge.cropImageToTemp(
        formattedPath,
        cropRect,
        SCREEN_WIDTH,
        SCREEN_HEIGHT
      );
      if (croppedUri) return croppedUri;
    }

    // Fallback: return full image path
    return formattedPath;
  },

  async processLCDDisplayImage(
    imagePath: string,
    cropRect?: CropRect
  ): Promise<{ processedImagePath: string; isCropped: boolean }> {
    const croppedPath = await this.cropLCDDisplayArea(imagePath, cropRect);
    return {
      processedImagePath: croppedPath,
      isCropped: croppedPath !== imagePath,
    };
  },

  /**
   * Logs temp file release.
   * The cropped JPEG is written to the app cache dir and cleaned by the OS
   * on next launch. Add RNFS.unlink() here if storage audits show growth.
   */
  async deleteTempImage(imagePath: string | null | undefined): Promise<void> {
    if (!imagePath) return;
    try {
      console.log(`[ImageProcessingService] Temp file released: ${imagePath}`);
    } catch (err) {
      console.warn('[ImageProcessingService] Error cleaning temp file:', err);
    }
  },
};
