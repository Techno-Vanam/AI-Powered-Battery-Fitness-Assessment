import React, { useEffect, useState, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PerformanceMonitor, type PerformanceMetrics } from '@utils/PerformanceMonitor';

interface Props {
  visible?: boolean;
}

export const PerformanceOverlay = memo(function PerformanceOverlay({ visible = true }: Props) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(PerformanceMonitor.getMetrics());
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const unsubscribe = PerformanceMonitor.subscribe(setMetrics);
    return () => unsubscribe();
  }, []);

  if (!visible) return null;

  const previewFpsColor = metrics.previewFps >= 26 ? '#22c55e' : metrics.previewFps >= 20 ? '#f59e0b' : '#ef4444';
  const aiFpsColor = metrics.aiFps >= 18 ? '#22c55e' : metrics.aiFps >= 14 ? '#f59e0b' : '#ef4444';

  const statusBg =
    metrics.status === 'OPTIMAL' ? 'rgba(34,197,94,0.2)' :
    metrics.status === 'MODERATE' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)';

  const statusBorder =
    metrics.status === 'OPTIMAL' ? '#22c55e' :
    metrics.status === 'MODERATE' ? '#f59e0b' : '#ef4444';

  if (collapsed) {
    return (
      <TouchableOpacity
        style={styles.collapsedBadge}
        onPress={() => setCollapsed(false)}
        activeOpacity={0.8}
      >
        <Text style={[styles.badgeText, { color: previewFpsColor }]}>
          ⚡ {metrics.previewFps} / {metrics.aiFps} FPS
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity
        style={[styles.card, { borderColor: statusBorder, backgroundColor: statusBg }]}
        onPress={() => setCollapsed(true)}
        activeOpacity={0.9}
      >
        <View style={styles.header}>
          <Text style={styles.title}>⚡ Low-End Performance Monitor</Text>
          <Text style={[styles.statusTag, { color: statusBorder }]}>
            {metrics.status}
          </Text>
        </View>

        {/* FPS Section */}
        <View style={styles.grid}>
          <View style={styles.metricBox}>
            <Text style={styles.label}>Preview FPS</Text>
            <Text style={[styles.value, { color: previewFpsColor }]}>
              {metrics.previewFps} <Text style={styles.unit}>/ 30</Text>
            </Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.label}>AI FPS (20 Target)</Text>
            <Text style={[styles.value, { color: aiFpsColor }]}>
              {metrics.aiFps} <Text style={styles.unit}>/ 20</Text>
            </Text>
          </View>
        </View>

        {/* Processing Latency Section */}
        <View style={styles.grid}>
          <View style={styles.metricBox}>
            <Text style={styles.label}>ArUco Latency</Text>
            <Text style={styles.valueMs}>{metrics.arucoLatencyMs} ms</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.label}>Pose Latency</Text>
            <Text style={styles.valueMs}>{metrics.poseLatencyMs} ms</Text>
          </View>
        </View>

        {/* Memory & Throttling Status */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Pipeline: <Text style={styles.bold}>{metrics.totalPipelineLatencyMs} ms</Text> · Heap: <Text style={styles.bold}>{metrics.memoryUsageMb} MB</Text>
          </Text>
          <Text style={styles.throttleTag}>
            {metrics.isAiThrottled ? '✓ 20 FPS Throttled' : 'Full Speed'}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 14,
    right: 14,
    zIndex: 999,
  },
  collapsedBadge: {
    position: 'absolute',
    top: 100,
    left: 14,
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3b82f6',
    zIndex: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  statusTag: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  metricBox: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  label: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  valueMs: {
    color: '#60a5fa',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  unit: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 6,
    marginTop: 2,
  },
  footerText: {
    color: '#9ca3af',
    fontSize: 11,
  },
  bold: {
    color: '#ffffff',
    fontWeight: '700',
  },
  throttleTag: {
    color: '#22c55e',
    fontSize: 10,
    fontWeight: '700',
  },
});
