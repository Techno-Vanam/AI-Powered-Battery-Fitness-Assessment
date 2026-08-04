import TextRecognition from '@react-native-ml-kit/text-recognition';
import { Dimensions } from 'react-native';
import { ImageProcessingService, CropRect } from './ImageProcessingService';
import { SevenSegmentLCDRecognitionEngine } from './SevenSegmentLCDRecognitionEngine';
import { SevenSegmentNativeBridge } from './SevenSegmentNativeBridge';
import { validateWeight, ValidationResult } from './WeightValidationService';

export interface OCRRecognitionResult {
  rawText: string;
  detectedWeight: number | null;
  confidence: number;
  validation: ValidationResult;
  croppedImagePath?: string;
  method: 'seven-segment-native' | 'mlkit-ocr' | 'none';
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const OCRService = {
  /**
   * Dual-Engine LCD Weight Recognition Pipeline
   *
   * Engine 1 — Native Seven-Segment Pixel Detection (primary, ★★★★★):
   *   1. Crop + enhance LCD region (react-native-image-manipulator)
   *   2. Native Kotlin pixel analysis: grayscale → adaptive threshold → digit segmentation
   *   3. For each digit: sample 7 segment sub-regions → ON/OFF boolean states
   *   4. Decode segment states → digit characters → assemble weight string
   *   5. Insert decimal point at detected or inferred position
   *
   * Engine 2 — Google ML Kit OCR (fallback, ★★★☆☆):
   *   Triggers automatically if native engine returns null (glare, unusual LCD, first run
   *   before native rebuild). Applies the 7-segment disambiguation matrix to ML Kit output.
   *
   * Both engines share the same preprocessing (crop + grayscale + contrast) and
   * the same final validation (regex + range check + confidence tier).
   */
  async recognizeLCDWeight(
    imagePath: string,
    providedText?: string,
    cropRect?: CropRect
  ): Promise<OCRRecognitionResult> {
    if (!imagePath && !providedText) {
      throw new Error('Valid image path is required for OCR processing');
    }

    let croppedImagePath = imagePath;

    // ── Step 1: Preprocess — Crop + Grayscale + Contrast (shared by both engines) ──
    if (imagePath && !providedText) {
      try {
        croppedImagePath = await ImageProcessingService.cropLCDDisplayArea(
          imagePath,
          cropRect
        );
      } catch (err) {
        console.warn('[OCRService] Preprocessing failed, using raw image:', err);
        croppedImagePath = imagePath;
      }
    }

    // ── Step 2: Try Native Seven-Segment Pixel Analysis (Engine 1) ────────────
    if (!providedText && SevenSegmentNativeBridge.isAvailable()) {
      try {
        const nativeResult = await SevenSegmentNativeBridge.analyzeSegments(
          croppedImagePath,
          cropRect ?? { x: 0, y: 0, width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
          SCREEN_WIDTH,
          SCREEN_HEIGHT
        );

        if (nativeResult) {
          const weightStr = SevenSegmentLCDRecognitionEngine.assembleWeightFromSegments(nativeResult);

          if (weightStr) {
            const weight = parseFloat(weightStr);
            const validation = validateWeight(weightStr, 0.97);

            // Clean up temp image
            if (croppedImagePath !== imagePath) {
              await ImageProcessingService.deleteTempImage(croppedImagePath);
            }

            return {
              rawText: weightStr,
              detectedWeight: weight,
              confidence: 0.97,
              validation,
              croppedImagePath,
              method: 'seven-segment-native',
            };
          }
        }
      } catch (err) {
        console.warn('[OCRService] Native seven-segment engine error, falling back to ML Kit:', err);
      }
    }

    // ── Step 3: ML Kit OCR Fallback (Engine 2) ────────────────────────────────
    let rawText = providedText ?? '';
    let confidence = 0.80; // ML Kit on LCD = conservative starting confidence

    if (!rawText && croppedImagePath) {
      try {
        const mlResult = await TextRecognition.recognize(croppedImagePath);
        if (mlResult?.text?.trim()) {
          rawText = mlResult.text.trim();
          confidence = 0.88;
        }
      } catch (err) {
        console.warn('[OCRService] ML Kit OCR failed:', err);
      } finally {
        // Clean up temp file regardless of ML Kit outcome
        if (croppedImagePath && croppedImagePath !== imagePath) {
          await ImageProcessingService.deleteTempImage(croppedImagePath);
        }
      }
    }

    // Apply 7-segment disambiguation matrix to ML Kit text output
    const { weight: segmentParsedWeight, rawCleaned } =
      SevenSegmentLCDRecognitionEngine.parseSevenSegmentLCDWeight(rawText);

    const validation = validateWeight(
      segmentParsedWeight ? String(segmentParsedWeight) : rawCleaned,
      confidence
    );

    return {
      rawText: rawCleaned || rawText,
      detectedWeight: validation.weight ?? segmentParsedWeight,
      confidence: validation.confidenceScore,
      validation,
      croppedImagePath,
      method: rawText ? 'mlkit-ocr' : 'none',
    };
  },
};
