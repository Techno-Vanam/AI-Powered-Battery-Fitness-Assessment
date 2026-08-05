import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/camera';
import { AthleteUseCases } from '../domain/usecases/AthleteUseCases';
import { LOW_CONFIDENCE_THRESHOLD } from '@height/config/heightTestConfig';

type Props = NativeStackScreenProps<RootStackParamList, 'HeightResult'>;

export function HeightResultScreen({ navigation, route }: Props) {
  const {
    athlete,
    heightCm,
    confidence,
    timestamp,
    measurementId,
    attemptCount,
    canRetry,
  } = route.params;

  const feet = Math.floor(heightCm / 30.48);
  const inches = Math.round((heightCm % 30.48) / 2.54);
  const dateStr = new Date(timestamp).toLocaleString();
  const age = athlete.dateOfBirth
    ? AthleteUseCases.calculateAge(athlete.dateOfBirth)
    : null;

  const confidenceColor = confidence >= 80 ? '#22c55e' : confidence >= LOW_CONFIDENCE_THRESHOLD ? '#f59e0b' : '#ef4444';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.successBadgeContainer}>
          <View style={styles.successCircle}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Measurement Complete</Text>
          <Text style={styles.savedTag}>Saved offline · queued for sync</Text>
        </View>

        <View style={styles.heightDisplayBox}>
          <Text style={styles.heightLabel}>MEASURED HEIGHT</Text>
          <Text style={styles.heightCmText}>{heightCm.toFixed(1)} cm</Text>
          <Text style={styles.heightFeetText}>
            {feet} ft {inches} in
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Confidence</Text>
          <Text style={[styles.confidenceBig, { color: confidenceColor }]}>
            {confidence}%
          </Text>
          {canRetry && (
            <Text style={styles.lowConfHint}>
              Low confidence — you can re-measure without losing this attempt.
            </Text>
          )}
          <Row label="Attempt #" value={String(attemptCount)} />
          <Row label="Measurement ID" value={measurementId.substring(0, 8) + '…'} />
          <Row label="Timestamp" value={dateStr} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Athlete</Text>
          <Row label="Name" value={athlete.name} highlight />
          <Row label="ID" value={athlete.id} />
          <Row label="Gender & Age" value={`${athlete.gender}${age ? ` (${age} yrs)` : ''}`} />
          <Row label="School" value={athlete.schoolAcademy ?? 'N/A'} />
        </View>

        <View style={styles.actionColumn}>
          {canRetry && (
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('Camera', { athlete })}
            >
              <Text style={styles.secondaryBtnText}>Re-measure</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('AthleteHome')}
          >
            <Text style={styles.primaryBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ghostBtn}
            onPress={() => navigation.navigate('SyncStatus')}
          >
            <Text style={styles.ghostBtnText}>View Sync Queue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && styles.rowHighlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  successBadgeContainer: { alignItems: 'center', marginBottom: 24 },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  checkIcon: { color: '#fff', fontSize: 28, fontWeight: '700' },
  successTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  savedTag: { color: '#64748b', fontSize: 13, marginTop: 6 },
  heightDisplayBox: {
    backgroundColor: '#141b2d',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  heightLabel: { color: '#64748b', fontSize: 12, letterSpacing: 1 },
  heightCmText: { color: '#fff', fontSize: 48, fontWeight: '800', marginTop: 4 },
  heightFeetText: { color: '#94a3b8', fontSize: 16, marginTop: 4 },
  card: {
    backgroundColor: '#141b2d',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    gap: 8,
  },
  cardSectionTitle: { color: '#94a3b8', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  confidenceBig: { fontSize: 32, fontWeight: '800', marginBottom: 8 },
  lowConfHint: { color: '#f59e0b', fontSize: 13, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  rowLabel: { color: '#64748b', fontSize: 14 },
  rowValue: { color: '#e2e8f0', fontSize: 14, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  rowHighlight: { color: '#fff', fontWeight: '700' },
  actionColumn: { gap: 12, marginTop: 8 },
  primaryBtn: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: '#f59e0b',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#f59e0b', fontSize: 15, fontWeight: '600' },
  ghostBtn: { paddingVertical: 12, alignItems: 'center' },
  ghostBtnText: { color: '#64748b', fontSize: 14 },
});
