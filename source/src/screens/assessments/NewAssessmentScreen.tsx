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
import { ArrowLeft, Play } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { STANDARD_10_TESTS } from '../../data/mockData';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';

interface NewAssessmentScreenProps {
  onBack: () => void;
  onStartSession: (sessionId: string) => void;
}

export const NewAssessmentScreen: React.FC<NewAssessmentScreenProps> = ({
  onBack,
  onStartSession,
}) => {
  const { coachProfile } = useApp();
  const [sessionName, setSessionName] = useState('New Assessment Batch');
  const [schoolName, setSchoolName] = useState(coachProfile.schoolName || 'Delhi Public School');
  const [targetCount, setTargetCount] = useState('30');
  const [selectedTests, setSelectedTests] = useState<string[]>(STANDARD_10_TESTS.map(t => t.testId));

  const toggleTest = (testId: string) => {
    if (selectedTests.includes(testId)) {
      if (selectedTests.length === 1) {
        Alert.alert('Required Selection', 'At least 1 test battery must be selected.');
        return;
      }
      setSelectedTests(selectedTests.filter(id => id !== testId));
    } else {
      setSelectedTests([...selectedTests, testId]);
    }
  };

  const handleCreate = () => {
    if (!sessionName.trim()) {
      Alert.alert('Required Field', 'Please enter a session name.');
      return;
    }

    const newId = `sess-${Date.now()}`;
    onStartSession(newId);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Assessment Session</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>Session / Batch Name</Text>
          <TextInput
            style={styles.input}
            value={sessionName}
            onChangeText={setSessionName}
            placeholder="e.g. DPS Afternoon Squad Battery"
            placeholderTextColor={colors.textTertiary}
          />

          <Text style={styles.fieldLabel}>School / Institution</Text>
          <TextInput
            style={styles.input}
            value={schoolName}
            onChangeText={setSchoolName}
          />

          <Text style={styles.fieldLabel}>Target Athletes Count</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={targetCount}
            onChangeText={setTargetCount}
          />

          <Text style={styles.fieldLabel}>Included Battery Tests ({selectedTests.length}/10)</Text>
          <View style={styles.testsGrid}>
            {STANDARD_10_TESTS.map(t => {
              const isSel = selectedTests.includes(t.testId);
              return (
                <TouchableOpacity
                  key={t.testId}
                  style={[styles.testBox, isSel && styles.testBoxActive]}
                  onPress={() => toggleTest(t.testId)}
                >
                  <Text style={[styles.testBoxText, isSel && styles.testBoxTextActive]}>
                    {t.testName} {isSel ? '✓' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity activeOpacity={0.8} style={styles.createBtn} onPress={handleCreate}>
            <Play size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.createBtnText}>Start Assessment Session</Text>
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
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.buttonRadius, // 12px
    paddingHorizontal: 14,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  testsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  testBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    marginRight: 8,
    marginBottom: 8,
  },
  testBoxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  testBoxText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  testBoxTextActive: {
    color: '#FFFFFF',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: layout.buttonRadius, // 12px
    height: 50,
    marginTop: 16,
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
