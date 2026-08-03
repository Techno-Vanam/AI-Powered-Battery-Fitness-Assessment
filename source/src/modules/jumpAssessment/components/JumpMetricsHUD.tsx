/**
 * Realtime Jump Metrics HUD Component
 * Displays jump status, countdown, standing reach, peak height, and distance metrics.
 */

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { JumpState } from '../types/jump';

interface Props {
  jumpState: JumpState;
  countdownSeconds?: number;
  standingReachCm?: number;
  highestReachCm?: number;
  broadJumpDistanceCm?: number;
  warningMessage?: string | null;
}

export const JumpMetricsHUD: React.FC<Props> = ({
  jumpState,
  countdownSeconds,
  standingReachCm,
  highestReachCm,
  broadJumpDistanceCm,
  warningMessage,
}) => {
  return (
    <View style={styles.hudContainer} pointerEvents="none">
      {/* Top Banner Status */}
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>State: {jumpState}</Text>
      </View>

      {/* Warning Alert Banner */}
      {warningMessage ? (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>{warningMessage}</Text>
        </View>
      ) : null}

      {/* Countdown Center Overlay */}
      {jumpState === 'COUNTDOWN' && countdownSeconds !== undefined ? (
        <View style={styles.countdownCenter}>
          <Text style={styles.countdownNumber}>{countdownSeconds}</Text>
        </View>
      ) : null}

      {/* Bottom Metrics Bar */}
      <View style={styles.metricsBar}>
        {standingReachCm !== undefined ? (
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Standing Reach</Text>
            <Text style={styles.metricValue}>{standingReachCm} cm</Text>
          </View>
        ) : null}

        {highestReachCm !== undefined ? (
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Highest Reach</Text>
            <Text style={styles.metricValue}>{highestReachCm} cm</Text>
          </View>
        ) : null}

        {broadJumpDistanceCm !== undefined ? (
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Broad Jump Distance</Text>
            <Text style={styles.metricValue}>{broadJumpDistanceCm} cm</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  hudContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 16,
    zIndex: 20,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#00E676',
    fontWeight: 'bold',
    fontSize: 14,
  },
  warningBanner: {
    backgroundColor: '#FF3D00',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  warningText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
  },
  countdownCenter: {
    position: 'absolute',
    top: '40%',
    left: '40%',
    right: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownNumber: {
    color: '#FFD600',
    fontSize: 84,
    fontWeight: '900',
  },
  metricsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 16,
    padding: 12,
  },
  metricCard: {
    alignItems: 'center',
  },
  metricLabel: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
