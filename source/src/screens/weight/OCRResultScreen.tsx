import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Scale,
  ChevronLeft,
} from 'lucide-react-native';
import Screen from '../../components/ui/Screen';
import AppText from '../../components/ui/AppText';
import Button from '../../components/ui/Button';
import { colors, layout, roleColors } from '../../theme';
import { SyncService } from '../../services/syncService';

const accent = roleColors('athlete');

export const OCRResultScreen = ({ route, navigation }: any) => {
  const { weight: initialWeight, confidence, rawText, imagePath } = route.params || {};

  const [weightValue] = useState<string>(
    initialWeight !== null && initialWeight !== undefined ? String(initialWeight) : ''
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleConfirm = async () => {
    const numericWeight = parseFloat(weightValue);

    if (!weightValue || isNaN(numericWeight) || numericWeight < 20 || numericWeight > 250) {
      Alert.alert(
        'Invalid Weight',
        'Please capture a valid weight value between 20.0 kg and 250.0 kg.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await SyncService.processMeasurementWorkflow({
        weight: numericWeight,
        ocrRawText: rawText,
        ocrConfidence: confidence ?? 0.98,
        capturedImagePath: imagePath,
      });

      setIsSubmitting(false);

      if (result.isUploaded) {
        Alert.alert(
          'Measurement Uploaded',
          `Weight measurement of ${numericWeight} kg has been stored in backend.`,
          [{ text: 'OK', onPress: () => navigation.navigate('WeightMeasurementHome') }]
        );
      } else {
        Alert.alert(
          'Measurement Saved Offline',
          `Measurement of ${numericWeight} kg saved in local SQLite cache. It will automatically upload when network reconnects.`,
          [{ text: 'OK', onPress: () => navigation.navigate('WeightMeasurementHome') }]
        );
      }
    } catch {
      setIsSubmitting(false);
      Alert.alert('Error', 'Failed to save measurement.');
    }
  };

  return (
    <Screen scroll>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('WeightMeasurementHome')}
          activeOpacity={0.8}
        >
          <ChevronLeft size={layout.iconMd} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.headerTitle}>
          OCR Result
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      {/* Main Result Card */}
      <View style={styles.resultCard}>
        <View style={[styles.iconRing, { backgroundColor: accent.light }]}>
          <Scale size={layout.iconLg + 4} color={accent.primary} />
        </View>

        <AppText variant="subtitle" color={colors.textSecondary}>
          Detected Weight
        </AppText>

        <AppText variant="h1" style={styles.weightValueDisplay}>
          {weightValue ? `${weightValue} kg` : '--.- kg'}
        </AppText>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Button
          title="Save Weight"
          role="athlete"
          variant="primary"
          loading={isSubmitting}
          onPress={handleConfirm}
        />

        <Button
          title="Retake Photo"
          role="athlete"
          variant="secondary"
          disabled={isSubmitting}
          onPress={() => navigation.replace('WeightLiveScanner')}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: layout.sectionGap,
  },
  backBtn: {
    padding: layout.fieldGap,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  resultCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: layout.horizontalPadding + 16,
    borderRadius: layout.radiusXl,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: accent.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: layout.formGap + 8,
    gap: layout.fieldGap,
  },
  iconRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  weightValueDisplay: {
    fontSize: 44,
    lineHeight: 52,
    color: accent.primary,
    marginVertical: 8,
    fontWeight: '700',
  },
  actionsContainer: {
    gap: layout.fieldGap,
    marginTop: layout.fieldGap,
  },
});

export default OCRResultScreen;
