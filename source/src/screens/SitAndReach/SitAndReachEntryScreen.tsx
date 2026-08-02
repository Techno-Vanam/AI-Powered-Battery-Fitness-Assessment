import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { submitTest } from '../../services/sitAndReachService';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'SitAndReachEntry'>;

export default function SitAndReachEntryScreen({ route, navigation }: Props) {
  const { athleteId, athleteName } = route.params;

  const [trial1, setTrial1] = useState('');
  const [trial2, setTrial2] = useState('');
  const [trial3, setTrial3] = useState('');
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sit & Reach Test</Text>
      <Text style={styles.athlete}>{athleteName}</Text>

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
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Save Test Result</Text>}
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
  scoreBox: { backgroundColor: '#eef6ff', borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 20 },
  scoreLabel: { fontSize: 13, color: '#456' },
  scoreValue: { fontSize: 28, fontWeight: '700', color: '#1a4d8f', marginTop: 4 },
  submitBtn: { backgroundColor: '#1a4d8f', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginBottom: 30 },
  submitBtnDisabled: { backgroundColor: '#a9c3e0' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});
