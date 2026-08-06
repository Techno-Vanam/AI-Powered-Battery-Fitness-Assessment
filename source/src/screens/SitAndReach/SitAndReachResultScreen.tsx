import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { submitTest } from '../../services/sitAndReachService';

type Props = NativeStackScreenProps<RootStackParamList, 'SitAndReachResult'>;

export default function SitAndReachResultScreen({ route, navigation }: Props) {
  const { athleteId, athleteName, trials } = route.params;
  const [submitting, setSubmitting] = useState(false);

  const best = Math.max(...trials);

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const result = await submitTest({ athleteId, trials: trials as [number,number,number], sessionDate: new Date().toISOString().slice(0,10) });
      Alert.alert(result.status === 'synced' ? 'Saved' : 'Queued', `Best reach: ${best.toFixed(1)} cm`, [{ text: 'OK', onPress: () => navigation.popToTop() }]);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not save');
    } finally { setSubmitting(false) }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sit & Reach Final Results</Text>
      <Text style={styles.athlete}>Athlete: {athleteName}</Text>
      
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>3 Trials Completed</Text>
        <View style={styles.row}><Text style={styles.label}>Trial 1:</Text><Text style={styles.val}>{trials[0].toFixed(1)} cm</Text></View>
        <View style={styles.row}><Text style={styles.label}>Trial 2:</Text><Text style={styles.val}>{trials[1].toFixed(1)} cm</Text></View>
        <View style={styles.row}><Text style={styles.label}>Trial 3:</Text><Text style={styles.val}>{trials[2].toFixed(1)} cm</Text></View>
      </View>

      <View style={styles.bestBox}>
        <Text style={styles.bestTitle}>BEST SCORE</Text>
        <Text style={styles.bestValue}>{best.toFixed(1)} cm</Text>
      </View>

      <TouchableOpacity style={[styles.btn, submitting && styles.btnDisabled]} onPress={handleSave} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save & Sync Assessment</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9fbfd' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4, color: '#111' },
  athlete: { fontSize: 15, color: '#555', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  sectionHeader: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#2b3648' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  label: { fontSize: 15, color: '#475569' },
  val: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  bestBox: { backgroundColor: '#e0f2fe', borderColor: '#bae6fd', borderWidth: 1, borderRadius: 14, padding: 20, alignItems: 'center', marginBottom: 24 },
  bestTitle: { fontSize: 13, fontWeight: '700', color: '#0369a1', letterSpacing: 1 },
  bestValue: { fontSize: 36, fontWeight: '800', color: '#0284c7', marginTop: 4 },
  btn: { backgroundColor: '#1a4d8f', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#9bb2d8' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 }
});
