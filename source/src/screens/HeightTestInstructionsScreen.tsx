import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/camera';
import { ScreenHeader } from '../components/FormComponents';
import { AthleteUseCases } from '../domain/usecases/AthleteUseCases';
import { DEFAULT_MARKER_SIZE_CM, MIN_VIDEO_DURATION_SEC, MAX_VIDEO_DURATION_SEC } from '@height/config/heightTestConfig';

type Props = NativeStackScreenProps<RootStackParamList, 'HeightTestInstructions'>;

export function HeightTestInstructionsScreen({ navigation, route }: Props) {
  const { athlete } = route.params;
  const age = athlete.dateOfBirth
    ? AthleteUseCases.calculateAge(athlete.dateOfBirth)
    : null;

  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({
    marker: false,
    posture: false,
    camera: false,
    offline: false,
  });

  const toggleCheck = (key: string) => {
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checkedItems).every(Boolean);

  const handleStartCamera = () => {
    navigation.navigate('Camera', { athlete });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScreenHeader
          title="Height Test — AI Camera"
          subtitle="Offline on-device measurement with ArUco calibration"
          onBack={() => navigation.goBack()}
        />

        <View style={styles.athleteBanner}>
          <View style={styles.athleteAvatar}>
            <Text style={styles.athleteAvatarText}>
              {athlete.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.athleteInfo}>
            <Text style={styles.athleteName}>{athlete.name}</Text>
            <Text style={styles.athleteSub}>
              ID: {athlete.id} · {athlete.gender} {age ? `(${age} yrs)` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Setup checklist</Text>

          <CheckRow
            label={`Print ArUco marker (${DEFAULT_MARKER_SIZE_CM}×${DEFAULT_MARKER_SIZE_CM} cm default)`}
            sub="Tape marker on wall at same depth as athlete's back/heels"
            checked={checkedItems.marker}
            onToggle={() => toggleCheck('marker')}
          />
          <CheckRow
            label="Subject stands upright, full body in frame"
            sub="Bare feet, arms relaxed, facing camera"
            checked={checkedItems.posture}
            onToggle={() => toggleCheck('posture')}
          />
          <CheckRow
            label={`Record ${MIN_VIDEO_DURATION_SEC}–${MAX_VIDEO_DURATION_SEC} second video`}
            sub="Rear camera, stable phone at chest height"
            checked={checkedItems.camera}
            onToggle={() => toggleCheck('camera')}
          />
          <CheckRow
            label="Offline processing — no video upload"
            sub="AI runs on device; only numeric result syncs"
            checked={checkedItems.offline}
            onToggle={() => toggleCheck('offline')}
          />
        </View>

        <TouchableOpacity
          style={[styles.startBtn, !allChecked && styles.startBtnDisabled]}
          onPress={handleStartCamera}
          disabled={!allChecked}
        >
          <Text style={styles.startBtnText}>Open Camera</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function CheckRow({
  label,
  sub,
  checked,
  onToggle,
}: {
  label: string;
  sub: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity style={styles.checkRow} onPress={onToggle} activeOpacity={0.8}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkMark}>✓</Text>}
      </View>
      <View style={styles.checkText}>
        <Text style={styles.checkLabel}>{label}</Text>
        <Text style={styles.checkSub}>{sub}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  athleteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141b2d',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    gap: 14,
  },
  athleteAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  athleteAvatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  athleteInfo: { flex: 1 },
  athleteName: { color: '#fff', fontSize: 17, fontWeight: '700' },
  athleteSub: { color: '#94a3b8', fontSize: 13, marginTop: 2 },
  card: {
    backgroundColor: '#141b2d',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  checkRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  checkMark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  checkText: { flex: 1 },
  checkLabel: { color: '#e2e8f0', fontSize: 14, fontWeight: '600' },
  checkSub: { color: '#64748b', fontSize: 12, marginTop: 2 },
  startBtn: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startBtnDisabled: { opacity: 0.4 },
  startBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
