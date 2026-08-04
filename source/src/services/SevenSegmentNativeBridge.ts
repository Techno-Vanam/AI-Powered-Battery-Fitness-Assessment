import { NativeModules, Platform } from 'react-native';

export interface SegmentState {
  a: boolean; // Top horizontal
  b: boolean; // Top-left vertical
  c: boolean; // Top-right vertical
  d: boolean; // Middle horizontal
  e: boolean; // Bottom-left vertical
  f: boolean; // Bottom-right vertical
  g: boolean; // Bottom horizontal
}

export interface NativeSegmentResult {
  digits: SegmentState[];
  decimalAfterIndex: number | null;
  digitCount: number;
}

export interface CropRectInput {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * SevenSegmentNativeBridge
 *
 * TypeScript wrapper around the native Android SevenSegmentAnalyzerModule.
 * The native module performs true pixel-level segment detection on the cropped
 * LCD bitmap using Android's built-in Bitmap API (no external dependencies).
 *
 * Returns null on failure so callers can gracefully fall back to ML Kit OCR.
 */
export const SevenSegmentNativeBridge = {
  /**
   * Returns true if the native module is available (Android only, native rebuild required).
   */
  isAvailable(): boolean {
    return Platform.OS === 'android' && !!NativeModules.SevenSegmentAnalyzer;
  },

  /**
   * Crops the LCD display region from the camera frame and saves it to a temp JPEG.
   * Pass the returned URI to ML Kit TextRecognition so OCR sees only the digit area.
   *
   * @returns Temp file URI (file:///...) or null on failure
   */
  async cropImageToTemp(
    imageUri: string,
    cropRect: CropRectInput,
    screenWidth: number,
    screenHeight: number
  ): Promise<string | null> {
    if (!this.isAvailable()) return null;
    try {
      const uri: string = await NativeModules.SevenSegmentAnalyzer.cropImageToTemp(
        imageUri,
        cropRect,
        screenWidth,
        screenHeight
      );
      return uri || null;
    } catch (err) {
      console.warn('[SevenSegmentNativeBridge] cropImageToTemp failed:', err);
      return null;
    }
  },

  /**
   * Runs the seven-segment pixel analysis on the given image.
   *
   * @param imageUri    - Full file:// URI to the captured image
   * @param cropRect    - Screen-space crop region of the LCD display
   * @param screenWidth - Device screen width in pixels (used for coordinate scaling)
   * @param screenHeight - Device screen height in pixels
   * @returns NativeSegmentResult with per-digit segment states, or null if analysis fails
   */
  async analyzeSegments(
    imageUri: string,
    cropRect: CropRectInput,
    screenWidth: number,
    screenHeight: number
  ): Promise<NativeSegmentResult | null> {
    if (!this.isAvailable()) {
      console.warn('[SevenSegmentNativeBridge] Native module unavailable. Run `npx react-native run-android` to rebuild with the native module.');
      return null;
    }

    try {
      const result: NativeSegmentResult = await NativeModules.SevenSegmentAnalyzer.analyzeSegments(
        imageUri,
        cropRect,
        screenWidth,
        screenHeight
      );

      // Sanity check: must have found at least 2 digits for a valid weight
      if (!result || !result.digits || result.digits.length < 2) {
        console.warn('[SevenSegmentNativeBridge] Too few digits detected:', result?.digitCount ?? 0);
        return null;
      }

      return result;
    } catch (err) {
      console.warn('[SevenSegmentNativeBridge] Native analysis failed:', err);
      return null;
    }
  },
};
