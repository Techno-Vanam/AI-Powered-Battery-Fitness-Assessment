import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import { ArrowLeft, Save, CheckCircle2, Cpu } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { Athlete } from '../../types/app';
import { STANDARD_10_TESTS } from '../../data/mockData';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';

interface AssessmentProgressScreenProps {
  athlete: Athlete;
  initialTestId?: string;
  onBack: () => void;
  onSuccess: () => void;
}

export const AssessmentProgressScreen: React.FC<AssessmentProgressScreenProps> = ({
  athlete,
  initialTestId = 't1',
  onBack,
  onSuccess,
}) => {
  const { saveTestResult } = useApp();
  const [selectedTestId, setSelectedTestId] = useState(initialTestId);
  const [measuredValue, setMeasuredValue] = useState('');
  const [score, setScore] = useState('8');

  const selectedTest = STANDARD_10_TESTS.find(t => t.testId === selectedTestId) || STANDARD_10_TESTS[0];

  const handleSave = () => {
    if (!measuredValue.trim()) {
      Alert.alert('Required Value', `Please enter the measured value for ${selectedTest.testName}.`);
      return;
    }

    const numericScore = parseInt(score, 10) || 8;
    const formattedVal = `${measuredValue.trim()} ${selectedTest.unit}`.trim();

    saveTestResult(athlete.id, selectedTestId, formattedVal, numericScore);

    Alert.alert(
      'Assessment Recorded',
      `Result for ${selectedTest.testName} (${formattedVal}) saved successfully.`,
      [{ text: 'OK', onPress: onSuccess }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Record Assessment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Athlete Info Card */}
        <View style={[styles.card, layout.shadowSubtle]}>
          <Text style={styles.athleteName}>{athlete.name}</Text>
          <Text style={styles.athleteSub}>
            {athlete.school} · {athlete.sport} · Age {athlete.age}
          </Text>
          <Text style={styles.progressStat}>
            Completed: {athlete.testsCompleted}/10 Tests
          </Text>
        </View>

        {/* Test Selector Carousel */}
        <Text style={styles.sectionTitle}>Select Test Battery</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.testScroll}>
          {STANDARD_10_TESTS.map(t => {
            const isSel = t.testId === selectedTestId;
            const res = athlete.testResults.find(r => r.testId === t.testId);
            const isDone = res?.isCompleted;

            return (
              <TouchableOpacity
                key={t.testId}
                style={[
                  styles.testChip,
                  isSel && styles.testChipActive,
                  isDone && styles.testChipDone,
                ]}
                onPress={() => {
                  setSelectedTestId(t.testId);
                  if (res?.value && res.value !== 'Pending') {
                    setMeasuredValue(res.value.replace(res.unit, '').trim());
                  } else {
                    setMeasuredValue('');
                  }
                }}
              >
                <Text style={[styles.testChipText, isSel && styles.testChipTextActive]}>
                  {t.testName} {isDone ? '✓' : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Measurement Input Form */}
        <View style={[styles.formCard, layout.shadowSubtle]}>
          <Text style={styles.testLabel}>{selectedTest.testName} ({selectedTest.category})</Text>
          <Text style={styles.unitHint}>Enter measurement value in {selectedTest.unit}</Text>

          <View style={styles.inputWrap}>
            <TextInput
              style={styles.valInput}
              placeholder={`0.0 ${selectedTest.unit}`}
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              value={measuredValue}
              onChangeText={setMeasuredValue}
            />
            <Text style={styles.unitBadge}>{selectedTest.unit}</Text>
          </View>

          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Performance Rating (1–10 Score)</Text>
          <TextInput
            style={styles.scoreInput}
            placeholder="8"
            placeholderTextColor={colors.textTertiary}
            keyboardType="numeric"
            value={score}
            onChangeText={setScore}
          />

          <View style={styles.aiHelpBox}>
            <Cpu size={16} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.aiHelpText}>
              AI Posture & Camera verification auto-calculates confidence validation.
            </Text>
          </View>

          <TouchableOpacity activeOpacity={0.8} style={styles.saveBtn} onPress={handleSave}>
            <Save size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.saveBtnText}>Save Test Record</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  athleteName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  athleteSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  progressStat: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  testScroll: {
    marginBottom: 16,
  },
  testChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  testChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  testChipDone: {
    borderColor: colors.successBorder,
  },
  testChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  testChipTextActive: {
    color: '#FFFFFF',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  testLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  unitHint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.buttonRadius, // 12px
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: colors.surface,
  },
  valInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  unitBadge: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  scoreInput: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.buttonRadius, // 12px
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.textPrimary,
  },
  aiHelpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    padding: 10,
    marginTop: 16,
    marginBottom: 20,
  },
  aiHelpText: {
    flex: 1,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: layout.buttonRadius, // 12px
    height: 50,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
