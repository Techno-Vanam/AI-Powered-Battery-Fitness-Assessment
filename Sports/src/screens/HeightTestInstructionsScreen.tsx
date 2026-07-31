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

type Props = NativeStackScreenProps<RootStackParamList, 'HeightTestInstructions'>;

export function HeightTestInstructionsScreen({ navigation, route }: Props) {
  const { athlete } = route.params;
  const age = athlete.dateOfBirth
    ? AthleteUseCases.calculateAge(athlete.dateOfBirth)
    : null;

  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({
    marker: true,
    posture: true,
    camera: true,
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
          title="Height Test Prep"
          subtitle="Follow instructions for optimal computer vision accuracy"
          onBack={() => navigation.goBack()}
        />

        {/* Selected Athlete Banner */}
        <View style={styles.athleteBanner}>
          <View style={styles.athleteAvatar}>
            <Text style={styles.athleteAvatarText}>
              {athlete.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.athleteInfo}>
            <Text style={styles.athleteName}>{athlete.name}</Text>
            <Text style={styles.athleteSub}>
              ID: {athlete.id} • {athlete.gender} {age ? `(${age} yrs)` : ''}
            </Text>
            <Text style={styles.athleteCat}>
              Category: {athlete.heightCategory ?? 'General'} • {athlete.schoolAcademy}
            </Text>
          </View>
        </View>

        {/* Checklist Step 1 */}
        <TouchableOpacity
          style={[styles.stepCard, checkedItems.marker && styles.stepCardActive]}
          onPress={() => toggleCheck('marker')}
          activeOpacity={0.8}
        >
          <View style={styles.stepHeader}>
            <Text style={styles.stepIcon}>📐</Text>
            <View style={styles.stepTitleBox}>
              <Text style={styles.stepTitle}>Step 1: ArUco Marker Placement</Text>
              <Text style={styles.stepDesc}>
                Place the standard 21 cm (4x4_50) ArUco marker flat on the floor directly next to the athlete's feet.
              </Text>
            </View>
            <View style={[styles.checkbox, checkedItems.marker && styles.checkboxActive]}>
              <Text style={styles.checkText}>{checkedItems.marker ? '✓' : ''}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Checklist Step 2 */}
        <TouchableOpacity
          style={[styles.stepCard, checkedItems.posture && styles.stepCardActive]}
          onPress={() => toggleCheck('posture')}
          activeOpacity={0.8}
        >
          <View style={styles.stepHeader}>
            <Text style={styles.stepIcon}>🧍</Text>
            <View style={styles.stepTitleBox}>
              <Text style={styles.stepTitle}>Step 2: Athlete Posture</Text>
              <Text style={styles.stepDesc}>
                Athlete should stand barefoot, upright against a plain wall with heels, buttocks, and upper back aligned. Keep head level.
              </Text>
            </View>
            <View style={[styles.checkbox, checkedItems.posture && styles.checkboxActive]}>
              <Text style={styles.checkText}>{checkedItems.posture ? '✓' : ''}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Checklist Step 3 */}
        <TouchableOpacity
          style={[styles.stepCard, checkedItems.camera && styles.stepCardActive]}
          onPress={() => toggleCheck('camera')}
          activeOpacity={0.8}
        >
          <View style={styles.stepHeader}>
            <Text style={styles.stepIcon}>📷</Text>
            <View style={styles.stepTitleBox}>
              <Text style={styles.stepTitle}>Step 3: Camera & Frame Alignment</Text>
              <Text style={styles.stepDesc}>
                Position device 2 to 3 metres away in portrait orientation. Ensure both head top vertex and ground marker are in frame.
              </Text>
            </View>
            <View style={[styles.checkbox, checkedItems.camera && styles.checkboxActive]}>
              <Text style={styles.checkText}>{checkedItems.camera ? '✓' : ''}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.startBtn, !allChecked && styles.startBtnDisabled]}
          onPress={handleStartCamera}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnText}>📷 Open Camera & Begin Measurement</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  athleteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 24,
  },
  athleteAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  athleteAvatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
  athleteInfo: {
    flex: 1,
  },
  athleteName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  athleteSub: {
    color: '#60a5fa',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  athleteCat: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2,
  },
  stepCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 14,
  },
  stepCardActive: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(30, 58, 138, 0.25)',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIcon: {
    fontSize: 26,
    marginRight: 12,
    marginTop: 2,
  },
  stepTitleBox: {
    flex: 1,
    marginRight: 10,
  },
  stepTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  stepDesc: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 19,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#4b5563',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#2563eb',
    borderColor: '#3b82f6',
  },
  checkText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  startBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  startBtnDisabled: {
    backgroundColor: '#1f2937',
    shadowOpacity: 0,
    elevation: 0,
  },
  startBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});
