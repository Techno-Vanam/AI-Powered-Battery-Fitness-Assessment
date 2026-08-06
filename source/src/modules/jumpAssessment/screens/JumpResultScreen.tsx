/**
 * Jump Assessment Result Screen
 * Displays final vertical / broad metrics, attempt comparisons, and save action.
 */

import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { jumpHistoryRepo } from '../services/jumpHistoryRepository';

interface Props {
  navigation: any;
  route: any;
}

export const JumpResultScreen: React.FC<Props> = ({ navigation, route }) => {
  const { testType, metrics, method } = route.params || {};
  const isAirtimeMethod = method === 'airtime';

  useEffect(() => {
    // Save metric attempt locally
    void jumpHistoryRepo.saveAttempt({
      id: `attempt_${Date.now()}`,
      testType,
      timestamp: Date.now(),
      verticalMetrics: testType === 'vertical' ? metrics : undefined,
      broadMetrics: testType === 'broad' ? metrics : undefined,
      isValid: true,
    });
  }, [testType, metrics]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.badge}>ASSESSMENT COMPLETED</Text>
      <Text style={styles.title}>
        {testType === 'vertical' ? 'Standing Vertical Jump' : 'Standing Broad Jump'}
      </Text>

      {testType === 'vertical' && metrics && isAirtimeMethod ? (
        <View style={styles.resultBox}>
          <Text style={styles.scoreLabel}>JUMP HEIGHT (AIRTIME METHOD)</Text>
          <Text style={styles.scoreValue}>{metrics.verticalJumpCm} cm</Text>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Airtime:</Text>
            <Text style={styles.rowValue}>{metrics.airtimeMs} ms</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Takeoff Velocity:</Text>
            <Text style={styles.rowValue}>{metrics.takeoffVelocityMs} m/s</Text>
          </View>

          {metrics.peakPowerWatts != null ? (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Peak Power (Sayers):</Text>
              <Text style={styles.rowValue}>{metrics.peakPowerWatts} W</Text>
            </View>
          ) : null}

          {metrics.relativePowerWkg != null ? (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Relative Power:</Text>
              <Text style={styles.rowValue}>{metrics.relativePowerWkg} W/kg</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {testType === 'vertical' && metrics && !isAirtimeMethod ? (
        <View style={styles.resultBox}>
          <Text style={styles.scoreLabel}>VERTICAL JUMP HEIGHT</Text>
          <Text style={styles.scoreValue}>{metrics.verticalJumpCm} cm</Text>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Standing Reach:</Text>
            <Text style={styles.rowValue}>{metrics.standingReachCm} cm</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Highest Reach:</Text>
            <Text style={styles.rowValue}>{metrics.highestReachCm} cm</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Est. Takeoff Velocity:</Text>
            <Text style={styles.rowValue}>{metrics.takeoffVelocityMs} m/s</Text>
          </View>
        </View>
      ) : null}

      {testType === 'broad' && metrics ? (
        <View style={styles.resultBox}>
          <Text style={styles.scoreLabel}>BROAD JUMP DISTANCE</Text>
          <Text style={styles.scoreValue}>{metrics.broadJumpDistanceCm} cm</Text>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Landing Heel Stability:</Text>
            <Text style={styles.rowValue}>{metrics.landingStabilityMs} ms</Text>
          </View>
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.retryBtn}
        onPress={() =>
          isAirtimeMethod
            ? navigation.replace('JumpFrameAnalysis', { testType })
            : navigation.replace('JumpCalibration', { testType })
        }
      >
        <Text style={styles.retryText}>Retry Attempt</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.doneBtn}
        onPress={() => navigation.navigate('JumpSelection')}
      >
        <Text style={styles.doneText}>Done & Return</Text>
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  badge: {
    color: '#00E676',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  resultBox: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginVertical: 12,
  },
  scoreLabel: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  scoreValue: {
    color: '#38BDF8',
    fontSize: 48,
    fontWeight: '900',
    marginVertical: 8,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 4,
  },
  rowLabel: {
    color: '#94A3B8',
    fontSize: 14,
  },
  rowValue: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  retryBtn: {
    width: '100%',
    backgroundColor: '#334155',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  doneBtn: {
    width: '100%',
    backgroundColor: '#00E676',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 16,
  },
});
