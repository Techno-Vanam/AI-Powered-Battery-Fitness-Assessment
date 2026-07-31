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

type Props = NativeStackScreenProps<RootStackParamList, 'HeightResult'>;

export function HeightResultScreen({ navigation, route }: Props) {
  const {
    athlete,
    heightCm,
    confidence,
    markerConfidence,
    poseConfidence,
    timestamp,
    testId,
  } = route.params;

  const feet = Math.floor(heightCm / 30.48);
  const inches = Math.round((heightCm % 30.48) / 2.54);
  const dateStr = new Date(timestamp).toLocaleString();
  const age = athlete.dateOfBirth
    ? AthleteUseCases.calculateAge(athlete.dateOfBirth)
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Success Header Badge */}
        <View style={styles.successBadgeContainer}>
          <View style={styles.successCircle}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Measurement Complete!</Text>
          <Text style={styles.savedTag}>💾 Saved to Local Database & Sync Queue</Text>
        </View>

        {/* Height Display Box */}
        <View style={styles.heightDisplayBox}>
          <Text style={styles.heightLabel}>MEASURED HEIGHT</Text>
          <Text style={styles.heightCmText}>{heightCm.toFixed(1)} cm</Text>
          <Text style={styles.heightFeetText}>
            {feet} feet {inches} inches
          </Text>
        </View>

        {/* Athlete Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Athlete Profile</Text>
          <Row label="Athlete Name" value={athlete.name} highlight />
          <Row label="Athlete ID" value={athlete.id} />
          <Row label="Gender & Age" value={`${athlete.gender} ${age ? `(${age} yrs)` : ''}`} />
          <Row label="Category" value={athlete.heightCategory ?? 'N/A'} />
          <Row label="Coach Name" value={athlete.coachName ?? 'N/A'} />
          <Row label="School / Academy" value={athlete.schoolAcademy ?? 'N/A'} />
          <Row label="State / District" value={`${athlete.state ?? ''}, ${athlete.district ?? ''}`} />
        </View>

        {/* Computer Vision Confidence Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Computer Vision Confidence</Text>
          <Row label="Overall Confidence" value={`${(confidence * 100).toFixed(0)}%`} highlightColor="#22c55e" />
          <Row label="Pose Landmark Lock" value={`${(poseConfidence * 100).toFixed(0)}%`} />
          <Row label="ArUco Marker Scale" value={`${(markerConfidence * 100).toFixed(0)}%`} />
          <Row label="Test Record ID" value={testId.substring(0, 8) + '…'} />
          <Row label="Timestamp" value={dateStr} />
        </View>

        {/* Actions */}
        <View style={styles.actionColumn}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Camera', { athlete })}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>📐 Measure Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('History', { athleteId: athlete.id })}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>📊 View Test History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tertiaryBtn}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.85}
          >
            <Text style={styles.tertiaryBtnText}>🏠 Return to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  highlight = false,
  highlightColor,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  highlightColor?: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text
        style={[
          styles.rowValue,
          highlight && styles.rowValueHighlight,
          Boolean(highlightColor) && { color: highlightColor },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  successBadgeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1.5,
    borderColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  checkIcon: {
    color: '#22c55e',
    fontSize: 30,
    fontWeight: '900',
  },
  successTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
  savedTag: {
    color: '#60a5fa',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  heightDisplayBox: {
    backgroundColor: '#111827',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 20,
  },
  heightLabel: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 6,
  },
  heightCmText: {
    color: '#22c55e',
    fontSize: 54,
    fontWeight: '900',
    lineHeight: 60,
  },
  heightFeetText: {
    color: '#9ca3af',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 16,
  },
  cardSectionTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#1f2937',
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rowLabel: {
    color: '#9ca3af',
    fontSize: 13,
  },
  rowValue: {
    color: '#e5e7eb',
    fontSize: 13,
    fontWeight: '600',
  },
  rowValueHighlight: {
    color: '#60a5fa',
    fontWeight: '800',
  },
  actionColumn: {
    gap: 12,
    marginTop: 8,
  },
  primaryBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryBtn: {
    backgroundColor: '#1f2937',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  secondaryBtnText: {
    color: '#d1d5db',
    fontSize: 15,
    fontWeight: '700',
  },
  tertiaryBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  tertiaryBtnText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
});
