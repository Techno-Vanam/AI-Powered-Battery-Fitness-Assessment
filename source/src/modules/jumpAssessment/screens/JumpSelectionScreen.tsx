/**
 * Jump Test Selection — live vertical/broad jump + airtime video analysis.
 * Restored from feature/vertical-and-broad-jump with portal styling.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCameraPermissions } from '../hooks/useCameraPermissions';

interface Props {
  navigation: any;
}

export const JumpSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const { requestPermission } = useCameraPermissions();

  const handleStartLiveTest = async (testType: 'vertical' | 'broad') => {
    await requestPermission();
    navigation.navigate('JumpCalibration', { testType });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>Jump Assessment Suite</Text>
        <Text style={styles.headerSubtitle}>
          AI-powered offline jump testing — no video stored on device
        </Text>

        <TouchableOpacity
          style={[styles.card, styles.cardPrimary]}
          activeOpacity={0.85}
          onPress={() => void handleStartLiveTest('vertical')}
        >
          <Text style={styles.cardBadge}>LIVE TEST</Text>
          <Text style={styles.cardTitle}>Standing Vertical Jump</Text>
          <Text style={styles.cardDesc}>
            Calibrate with ArUco or A4 paper, capture standing reach, then measure maximum fingertip height during the jump.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.85}
          onPress={() => void handleStartLiveTest('broad')}
        >
          <Text style={styles.cardBadge}>LIVE TEST</Text>
          <Text style={styles.cardTitle}>Standing Broad Jump</Text>
          <Text style={styles.cardDesc}>
            Measure horizontal distance from takeoff line to stable heel landing using live pose tracking.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.cardAirtime]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('JumpFrameAnalysis', { testType: 'vertical' })}
        >
          <Text style={[styles.cardBadge, styles.badgeAirtime]}>
            AIRTIME METHOD · H = (g×t²)/8
          </Text>
          <Text style={styles.cardTitle}>Airtime Frame Analysis</Text>
          <Text style={styles.cardDesc}>
            Import or record a jump video, mark takeoff and landing frames, and calculate height from flight time.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('JumpHistory')}
        >
          <Text style={styles.historyButtonText}>View Assessment History</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flexGrow: 1,
    padding: 20,
    gap: 16,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#000000',
    marginTop: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPrimary: {
    borderColor: '#FFD699',
    backgroundColor: '#FFF5E6',
  },
  cardAirtime: {
    borderColor: '#A3E9B8',
  },
  cardBadge: {
    color: '#FF9500',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  badgeAirtime: {
    color: '#34C759',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 6,
  },
  cardDesc: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
  },
  historyButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  historyButtonText: {
    color: '#FF9500',
    fontWeight: '700',
    fontSize: 15,
  },
});
