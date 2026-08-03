import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {
  AlertTriangle,
  CheckCircle,
  Edit3,
  RefreshCw,
  Scale,
  ChevronLeft,
} from 'lucide-react-native';
import Screen from '../../components/ui/Screen';
import AppText from '../../components/ui/AppText';
import Button from '../../components/ui/Button';
import { colors, layout, roleColors } from '../../theme';
import { createScreenStyles } from '../../styles/screenStyles';
import { validateWeight } from '../../services/WeightValidationService';
import { SyncService } from '../../services/syncService';

const screenStyles = createScreenStyles();
const accent = roleColors('athlete');

export const OCRResultScreen = ({ route, navigation }: any) => {
  const { weight: initialWeight, confidence, rawText, imagePath } = route.params || {};

  const [weightValue, setWeightValue] = useState<string>(
    initialWeight ? String(initialWeight) : ''
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const confidencePct = Math.round((confidence ?? 0.98) * 100);
  const isLowConfidence = confidencePct < 90 || !initialWeight;

  const currentValResult = validateWeight(weightValue, confidence ?? 0.98);

  const handleConfirm = async () => {
    const numericWeight = parseFloat(weightValue);

    if (!weightValue || isNaN(numericWeight) || numericWeight < 20 || numericWeight > 250) {
      Alert.alert(
        'Invalid Weight',
        'Please enter a valid weight value between 20.0 kg and 250.0 kg.'
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
          `Weight measurement of ${numericWeight.toFixed(1)} kg has been stored in backend.`,
          [{ text: 'OK', onPress: () => navigation.navigate('WeightMeasurementHome') }]
        );
      } else {
        Alert.alert(
          'Measurement Saved Offline',
          `Measurement of ${numericWeight.toFixed(1)} kg saved in local SQLite cache. It will automatically upload when network reconnects.`,
          [{ text: 'OK', onPress: () => navigation.navigate('WeightMeasurementHome') }]
        );
      }
    } catch (err) {
      setIsSubmitting(false);
      Alert.alert('Error', 'Failed to save measurement.');
    }
  };

  return (
    <Screen scroll contentStyle={screenStyles.content}>
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

        {isEditing ? (
          <View style={styles.editInputWrapper}>
            <TextInput
              style={styles.editInput}
              value={weightValue}
              onChangeText={setWeightValue}
              keyboardType="decimal-pad"
              autoFocus
            />
            <AppText variant="h2" color={colors.textSecondary}>
              kg
            </AppText>
          </View>
        ) : (
          <AppText variant="h1" style={styles.weightValueDisplay}>
            {parseFloat(weightValue || '0').toFixed(1)} kg
          </AppText>
        )}

        {/* Confidence & Validation Metrics */}
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <AppText variant="caption" color={colors.textSecondary}>
              OCR Confidence
            </AppText>
            <AppText
              variant="label"
              color={isLowConfidence ? colors.error : colors.success}
            >
              {confidencePct}%
            </AppText>
          </View>

          <View style={styles.divider} />

          <View style={styles.metricItem}>
            <AppText variant="caption" color={colors.textSecondary}>
              Validation Status
            </AppText>
            <View style={styles.valStatusPill}>
              {currentValResult.isValid && !isLowConfidence ? (
                <CheckCircle size={14} color={colors.success} />
              ) : (
                <AlertTriangle size={14} color={colors.error} />
              )}
              <AppText
                variant="caption"
                color={currentValResult.isValid && !isLowConfidence ? colors.success : colors.error}
              >
                {currentValResult.isValid && !isLowConfidence ? 'Valid Weight' : 'Uncertain'}
              </AppText>
            </View>
          </View>
        </View>
      </View>

      {/* Low Confidence Alert (<90%) */}
      {isLowConfidence && (
        <View style={styles.warningBox}>
          <AlertTriangle size={layout.iconMd} color={colors.warning} />
          <View style={styles.warningTextCol}>
            <AppText variant="h3" color={colors.warning}>
              Unable to read weight accurately.
            </AppText>
            <AppText variant="bodySm" color={colors.warning}>
              Digital LCD OCR confidence is below 90%. Please retake photo or enter weight manually.
            </AppText>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {!isLowConfidence && (
          <Button
            title="Confirm"
            role="athlete"
            variant="primary"
            loading={isSubmitting}
            onPress={handleConfirm}
          />
        )}

        <Button
          title="Retake"
          role="athlete"
          variant={isLowConfidence ? 'primary' : 'secondary'}
          disabled={isSubmitting}
          onPress={() => navigation.replace('WeightLiveScanner')}
        />

        <TouchableOpacity
          style={styles.editToggleBtn}
          onPress={() => setIsEditing((prev) => !prev)}
          activeOpacity={0.8}
        >
          <Edit3 size={layout.iconSm} color={accent.primary} />
          <AppText variant="button" color={accent.primary}>
            {isEditing ? 'Done Editing' : 'Manual Entry'}
          </AppText>
        </TouchableOpacity>
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
    padding: layout.horizontalPadding + 4,
    borderRadius: layout.radiusXl,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: accent.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: layout.formGap,
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
    fontSize: 42,
    lineHeight: 50,
    color: accent.primary,
    marginVertical: 4,
  },
  editInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  editInput: {
    fontSize: 36,
    fontWeight: '700',
    color: accent.primary,
    borderBottomWidth: 2,
    borderBottomColor: accent.primary,
    paddingHorizontal: 8,
    minWidth: 120,
    textAlign: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: layout.formGap,
    marginTop: layout.fieldGap,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  metricItem: {
    alignItems: 'center',
    gap: 4,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  valStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.horizontalPadding,
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBorder,
    borderWidth: 1,
    padding: layout.horizontalPadding,
    borderRadius: layout.radiusLg,
    marginBottom: layout.formGap,
  },
  warningTextCol: {
    flex: 1,
    gap: 2,
  },
  actionsContainer: {
    gap: layout.fieldGap,
    marginTop: layout.formGap,
  },
  editToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: layout.fieldGap,
    paddingVertical: layout.fieldGap + 4,
    marginTop: 4,
  },
});

export default OCRResultScreen;
