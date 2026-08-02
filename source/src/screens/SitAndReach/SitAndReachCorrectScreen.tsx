import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { submitCorrection } from '../../services/sitAndReachService';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'SitAndReachCorrect'>;

export default function SitAndReachCorrectScreen({ route, navigation }: Props) {
  const { test, athleteId, athleteName } = route.params;

  const [trial1, setTrial1] = useState(String(test.trial_1));
  const [trial2, setTrial2] = useState(String(test.trial_2));
  const [trial3, setTrial3] = useState(String(test.trial_3));
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const parsed = [trial1, trial2, trial3].map(v => parseFloat(v));
  const validTrials = parsed.every(v => !isNaN(v) && v >= -50 && v <= 100);
  const maxScore = useMemo(() => (validTrials ? Math.max(...parsed).toFixed(1) : '--'), [trial1, trial2, trial3, validTrials, parsed]);

  const handleSubmit = async () => {
    if (!validTrials) {
      Alert.alert('Invalid input', 'Enter 3 valid trial distances in centimeters (-50 to 100).');
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitCorrection({
        correctionOfId: test.id,
        athleteId,
        trials: parsed as [number, number, number],
        notes,
        sessionDate: new Date().toISOString().slice(0, 10)
      });

      Alert.alert(
        result.status === 'synced' ? 'Correction saved' : 'Correction queued offline',
        result.status === 'synced'
          ? `Corrected best reach: ${maxScore} cm`
          : `No connection. Correction (${maxScore} cm) will sync automatically once you're back online.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Could not save correction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Correct Sit & Reach Entry</Text>
      <Text style={styles.athlete}>{athleteName}</Text>

      {[
        { label: 'Trial 1 (cm)', value: trial1, setter: setTrial1 },
        { label: 'Trial 2 (cm)', value: trial2, setter: setTrial2 },
        { label: 'Trial 3 (cm)', value: trial3, setter: setTrial3 }
      ].map((t, i) => (
        <View key={i} style={styles.inputGroup}>
          <Text style={styles.label}>{t.label}</Text>
          <TextInput style={styles.input} keyboardType="decimal-pad" value={t.value} onChangeText={t.setter} />
        </View>
      ))}

      <View style={styles.scoreBox}>
        <Text style={styles.scoreLabel}>Corrected Best Reach</Text>
        <Text style={styles.scoreValue}>{maxScore} cm</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Correction reason (optional)</Text>
        <TextInput style={[styles.input, { height: 60 }]} multiline value={notes} onChangeText={setNotes} />
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, (!validTrials || submitting) && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={!validTrials || submitting}
      >
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Save Correction</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  athlete: { fontSize: 16, color: '#555', marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  scoreBox: { backgroundColor: '#fff3e0', borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 20 },
  scoreLabel: { fontSize: 13, color: '#7a5200' },
  scoreValue: { fontSize: 28, fontWeight: '700', color: '#a15c00', marginTop: 4 },
  submitBtn: { backgroundColor: '#a15c00', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginBottom: 30 },
  submitBtnDisabled: { backgroundColor: '#d9b98a' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});
