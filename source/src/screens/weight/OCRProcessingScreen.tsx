import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { CheckCircle2, Scale } from 'lucide-react-native';
import Screen from '../../components/ui/Screen';
import AppText from '../../components/ui/AppText';
import { colors, layout, roleColors } from '../../theme';
import { createScreenStyles } from '../../styles/screenStyles';
import { ImageProcessingService, CropRect } from '../../services/ImageProcessingService';
import { OCRService } from '../../services/OCRService';

const screenStyles = createScreenStyles();
const accent = roleColors('athlete');

export type ProcessingStepStatus = 'pending' | 'active' | 'completed';

export interface StepItem {
  id: string;
  label: string;
  status: ProcessingStepStatus;
}

export const OCRProcessingScreen = ({ route, navigation }: any) => {
  const { imagePath, cropRect } = route.params || {};

  const [steps, setSteps] = useState<StepItem[]>([
    { id: '1', label: 'Capturing Image...', status: 'active' },
    { id: '2', label: 'Cropping & Enhancing LCD Region...', status: 'pending' },
    { id: '3', label: 'Seven-Segment Pixel Analysis...', status: 'pending' },
    { id: '4', label: 'Validating Weight Digits...', status: 'pending' },
    { id: '5', label: 'Cleaning Memory...', status: 'pending' },
  ]);

  const updateStepStatus = (index: number, status: ProcessingStepStatus) => {
    setSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, status } : step))
    );
  };

  useEffect(() => {
    let isMounted = true;

    const runPipeline = async () => {
      try {
        // Step 1: Capturing Image
        if (!isMounted) return;
        updateStepStatus(0, 'completed');
        updateStepStatus(1, 'active');

        // Step 2: Cropping Display Region & Preprocessing
        const processed = await ImageProcessingService.processLCDDisplayImage(
          imagePath || 'file:///data/cache/weight_capture.jpg',
          cropRect
        );
        if (!isMounted) return;
        updateStepStatus(1, 'completed');
        updateStepStatus(2, 'active');

        // Step 3: Dual-Engine LCD OCR (Native 7-segment -> ML Kit fallback)
        const ocrResult = await OCRService.recognizeLCDWeight(
          processed.processedImagePath,
          undefined,
          undefined // already cropped by processLCDDisplayImage above
        );
        if (!isMounted) return;
        updateStepStatus(2, 'completed');
        updateStepStatus(3, 'active');

        // Step 4: Validating Weight Digits
        if (!isMounted) return;
        updateStepStatus(3, 'completed');
        updateStepStatus(4, 'active');

        // Step 5: Cleaning Memory
        await ImageProcessingService.deleteTempImage(processed.processedImagePath);
        if (!isMounted) return;
        updateStepStatus(4, 'completed');

        // Navigate to OCR Result Screen with validated weight
        navigation.replace('WeightOCRResult', {
          weight: ocrResult.detectedWeight ?? null,
          confidence: ocrResult.confidence,
          rawText: ocrResult.rawText || '',
          imagePath: processed.processedImagePath,
          validation: ocrResult.validation,
          recognitionMethod: ocrResult.method,
        });
      } catch (err) {
        console.warn('[OCRProcessingScreen] Pipeline error:', err);
      }
    };

    runPipeline();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Screen scroll contentStyle={screenStyles.centeredContent}>
      <View style={styles.headerBox}>
        <View style={[styles.avatarBox, { backgroundColor: accent.light }]}>
          <Scale size={layout.iconLg + 6} color={accent.primary} />
        </View>
        <AppText variant="h2" style={styles.title}>
          Processing LCD Display
        </AppText>
        <AppText variant="subtitle" color={colors.textSecondary} style={styles.subtitle}>
          Dual-Engine LCD Analysis: Seven-Segment Detection → ML Kit Fallback
        </AppText>
      </View>

      <View style={styles.stepsCard}>
        {steps.map((step) => (
          <View key={step.id} style={styles.stepRow}>
            {step.status === 'completed' ? (
              <CheckCircle2 size={layout.iconMd} color={colors.success} />
            ) : step.status === 'active' ? (
              <ActivityIndicator color={accent.primary} size="small" />
            ) : (
              <View style={styles.pendingDot} />
            )}

            <AppText
              variant="body"
              color={
                step.status === 'completed'
                  ? colors.textPrimary
                  : step.status === 'active'
                  ? accent.primary
                  : colors.textMuted
              }
              style={[
                styles.stepText,
                step.status === 'active' && styles.activeStepText,
              ]}
            >
              {step.label}
            </AppText>
          </View>
        ))}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  headerBox: {
    alignItems: 'center',
    gap: layout.fieldGap,
    marginBottom: layout.sectionGap,
  },
  avatarBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  stepsCard: {
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    backgroundColor: colors.surface,
    padding: layout.horizontalPadding + 4,
    borderRadius: layout.radiusXl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: layout.formGap + 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.horizontalPadding,
  },
  pendingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.borderLight,
    marginHorizontal: 2,
  },
  stepText: {
    flex: 1,
  },
  activeStepText: {
    fontFamily: undefined,
    fontWeight: '700',
  },
});

export default OCRProcessingScreen;
