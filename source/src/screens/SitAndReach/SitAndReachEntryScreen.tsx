import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { submitTest } from '../../services/sitAndReachService';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'SitAndReachEntry'>;

export default function SitAndReachEntryScreen({ route, navigation }: Props) {
  const { athleteId, athleteName } = route.params;

  useEffect(() => {
    // Keep instruction page intact as requested
  }, []);

  const [trial1, setTrial1] = useState('');
  const [trial2, setTrial2] = useState('');
  const [trial3, setTrial3] = useState('');
  const [notes, setNotes] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const parsed = [trial1, trial2, trial3].map(v => parseFloat(v));
  const validTrials = parsed.every(v => !isNaN(v) && v >= -50 && v <= 100);
  const maxScore = validTrials ? Math.max(...parsed).toFixed(1) : '--';

  const handleSubmit = async () => {
    if (!validTrials) {
      Alert.alert('Invalid input', 'Enter 3 valid trial distances in centimeters (-50 to 100).');
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitTest({
        athleteId,
        trials: parsed as [number, number, number],
        notes,
        sessionDate: new Date().toISOString().slice(0, 10)
      });

      if (result.status === 'synced') {
        Alert.alert('Saved', `Best reach recorded: ${maxScore} cm`, [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        Alert.alert(
          'Saved offline',
          `No connection. Result (${maxScore} cm) is stored on this device and will upload automatically once you're back online.`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Could not save test result');
    } finally {
      setSubmitting(false);
    }
  };

  const startCameraAssessment = () => {
    navigation.navigate('SitAndReachCamera', { athleteId, athleteName });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Sit & Reach Assessment</Text>
      <Text style={styles.athlete}>{athleteName}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Live Camera Assessment</Text>
        <Text style={styles.cardText}>Use your phone camera to capture a real sit-and-reach trial with live pose detection and ruler calibration.</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• Position your side profile in view</Text>
          <Text style={styles.bulletItem}>• Keep legs, knees, torso, arms and ruler visible</Text>
          <Text style={styles.bulletItem}>• Calibrate the ruler before starting</Text>
          <Text style={styles.bulletItem}>• Perform 3 separate reach trials</Text>
        </View>
        <TouchableOpacity style={styles.startBtn} onPress={startCameraAssessment}>
          <Text style={styles.startText}>Start Camera Assessment</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.manualHeader}>
        <Text style={styles.sectionTitle}>Manual Entry</Text>
        <TouchableOpacity style={styles.manualToggleBtn} onPress={() => setShowManualEntry((prev) => !prev)}>
          <Text style={styles.manualToggleText}>{showManualEntry ? 'Hide' : 'Show'} manual entry</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.manualText}>Use manual entry only if you cannot perform the live camera assessment.</Text>

      {showManualEntry ? (
        <>
          {[
            { label: 'Trial 1 (cm)', value: trial1, setter: setTrial1 },
            { label: 'Trial 2 (cm)', value: trial2, setter: setTrial2 },
            { label: 'Trial 3 (cm)', value: trial3, setter: setTrial3 }
          ].map((t, i) => (
            <View key={i} style={styles.inputGroup}>
              <Text style={styles.label}>{t.label}</Text>
              <TextInput style={styles.input} keyboardType="decimal-pad" value={t.value} onChangeText={t.setter} placeholder="e.g. 32.5" />
            </View>
          ))}

          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Best Reach (auto-calculated)</Text>
            <Text style={styles.scoreValue}>{maxScore} cm</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput style={[styles.input, { height: 60 }]} multiline value={notes} onChangeText={setNotes} />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, (!validTrials || submitting) && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!validTrials || submitting}
          >
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Save Manual Result</Text>}
          </TouchableOpacity>
        </>
      ) : null}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20, flexGrow: 1, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  athlete: { fontSize: 16, color: '#555', marginBottom: 20 },
  card: { backgroundColor: '#f6f9ff', borderRadius: 14, padding: 18, marginBottom: 24, borderWidth: 1, borderColor: '#dde7f3' },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10, color: '#1a4d8f' },
  cardText: { fontSize: 14, color: '#444', marginBottom: 12, lineHeight: 20 },
  bulletList: { marginBottom: 16 },
  bulletItem: { fontSize: 14, color: '#333', lineHeight: 20 },
  startBtn: { backgroundColor: '#1a4d8f', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  startText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#e1e7f1', marginVertical: 24 },
  manualHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  manualToggleBtn: { padding: 6 },
  manualToggleText: { color: '#1a4d8f', fontWeight: '700' },
  manualText: { color: '#666', fontSize: 13, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  scoreBox: { backgroundColor: '#eef6ff', borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 20 },
  scoreLabel: { fontSize: 13, color: '#456' },
  scoreValue: { fontSize: 28, fontWeight: '700', color: '#1a4d8f', marginTop: 4 },
  submitBtn: { backgroundColor: '#1a4d8f', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginBottom: 30 },
  submitBtnDisabled: { backgroundColor: '#a9c3e0' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});
