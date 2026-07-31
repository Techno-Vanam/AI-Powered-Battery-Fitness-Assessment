import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { CameraStats } from '@types/camera';

interface Props {
  stats: CameraStats;
}

export const CameraStatsHUD = memo(function CameraStatsHUD({ stats }: Props) {
  const fpsColor = stats.fps >= 25 ? '#22c55e' : stats.fps >= 15 ? '#f59e0b' : '#ef4444';

  return (
    <View style={styles.container}>
      <StatRow label="Status" value={stats.isActive ? 'Active' : 'Inactive'} valueColor={stats.isActive ? '#22c55e' : '#ef4444'} />
      <StatRow label="FPS" value={String(stats.fps)} valueColor={fpsColor} />
      <StatRow label="Resolution" value={stats.resolution} />
      <StatRow label="Device" value={stats.deviceName} numberOfLines={1} />
      <StatRow label="Frames" value={String(stats.frameCount)} />
    </View>
  );
});

interface StatRowProps {
  label: string;
  value: string;
  valueColor?: string;
  numberOfLines?: number;
}

function StatRow({ label, value, valueColor = '#fff', numberOfLines = 1 }: StatRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]} numberOfLines={numberOfLines}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 10,
    padding: 10,
    minWidth: 180,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
    gap: 8,
  },
  label: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '500',
  },
  value: {
    fontSize: 11,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
});
