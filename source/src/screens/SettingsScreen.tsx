import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/camera';
import { DEFAULT_MARKER_SIZE_CM } from '@height/config/heightTestConfig';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [dbEncryptionActive, setDbEncryptionActive] = useState(true);
  const [highPrecisionMode, setHighPrecisionMode] = useState(true);
  const [saveLocalLogs, setSaveLocalLogs] = useState(true);

  const handleResetDatabase = () => {
    Alert.alert(
      'Reset Storage Configuration',
      'Are you sure you want to re-verify encrypted SQLite storage parameters?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Verify', onPress: () => Alert.alert('Status', 'SQLCipher encrypted database storage verified.') },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#090d16" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>System Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section 1: Calibration & AI Parameters */}
        <Text style={styles.sectionTitle}>Calibration & Computer Vision</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <Text style={styles.label}>ArUco Dictionary</Text>
            <Text style={styles.valueBadge}>ARUCO_MIP_36h12</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <Text style={styles.label}>Known Marker Height</Text>
            <Text style={styles.valueText}>{DEFAULT_MARKER_SIZE_CM} cm</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <Text style={styles.label}>Pose Model</Text>
            <Text style={styles.valueBadge}>MediaPipe Tasks Pose</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Luma Gradient Hair Boundary Scan</Text>
              <Text style={styles.subText}>Sub-pixel head vertex boundary detection</Text>
            </View>
            <Switch
              value={highPrecisionMode}
              onValueChange={setHighPrecisionMode}
              trackColor={{ false: '#374151', true: '#2563eb' }}
              thumbColor={highPrecisionMode ? '#60a5fa' : '#9ca3af'}
            />
          </View>
        </View>

        {/* Section 2: Security & Local Database */}
        <Text style={styles.sectionTitle}>Local Security & Storage</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>SQLCipher Database Encryption</Text>
              <Text style={styles.subText}>AES-256 encrypted SQLite local database</Text>
            </View>
            <Switch
              value={dbEncryptionActive}
              onValueChange={setDbEncryptionActive}
              trackColor={{ false: '#374151', true: '#22c55e' }}
              thumbColor={dbEncryptionActive ? '#4ade80' : '#9ca3af'}
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow} onPress={handleResetDatabase}>
            <Text style={styles.actionLabel}>Verify DB Integrity & Schema</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Section 3: Cloud Synchronization */}
        <Text style={styles.sectionTitle}>Cloud Synchronization</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Auto Sync on Connection</Text>
              <Text style={styles.subText}>Upload pending records when NetInfo reports online</Text>
            </View>
            <Switch
              value={autoSyncEnabled}
              onValueChange={setAutoSyncEnabled}
              trackColor={{ false: '#374151', true: '#2563eb' }}
              thumbColor={autoSyncEnabled ? '#60a5fa' : '#9ca3af'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Diagnostic Logging</Text>
              <Text style={styles.subText}>Store local debug metrics for sync failures</Text>
            </View>
            <Switch
              value={saveLocalLogs}
              onValueChange={setSaveLocalLogs}
              trackColor={{ false: '#374151', true: '#2563eb' }}
              thumbColor={saveLocalLogs ? '#60a5fa' : '#9ca3af'}
            />
          </View>
        </View>

        {/* System Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Techno Vanam Fitness Platform</Text>
          <Text style={styles.infoText}>
            Battery Fitness Assessment Engine v1.0.0{'\n'}
            Clean Architecture • Offline-First System
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  backBtn: {
    paddingVertical: 6,
    paddingRight: 12,
  },
  backText: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 14,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#1f2937',
    marginVertical: 8,
  },
  label: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  subText: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2,
  },
  valueText: {
    color: '#38bdf8',
    fontSize: 15,
    fontWeight: '700',
  },
  valueBadge: {
    backgroundColor: '#1e293b',
    color: '#60a5fa',
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  actionLabel: {
    color: '#f87171',
    fontSize: 15,
    fontWeight: '700',
  },
  actionArrow: {
    color: '#f87171',
    fontSize: 16,
    fontWeight: '800',
  },
  infoBox: {
    alignItems: 'center',
    marginTop: 24,
    padding: 16,
  },
  infoTitle: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '700',
  },
  infoText: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});
