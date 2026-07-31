import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TrendingUp, ArrowRight, Award, Activity } from 'lucide-react-native';
import { AnalyticsPreview } from '../../services/dashboardService';

interface AnalyticsSummaryCardProps {
  analytics: AnalyticsPreview;
  onPressViewAll: () => void;
}

export const AnalyticsSummaryCard: React.FC<AnalyticsSummaryCardProps> = ({
  analytics,
  onPressViewAll,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.iconCircle}>
            <TrendingUp size={18} color="#7C3AED" />
          </View>
          <View>
            <Text style={styles.title}>Battery Performance Analytics</Text>
            <Text style={styles.subtitle}>Aggregate metrics across 10-test battery</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.linkBtn} onPress={onPressViewAll} activeOpacity={0.7}>
          <Text style={styles.linkText}>Full Report</Text>
          <ArrowRight size={14} color="#7C3AED" />
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Avg. Height</Text>
          <Text style={styles.metricVal}>{analytics.avg_height}</Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Avg. Weight</Text>
          <Text style={styles.metricVal}>{analytics.avg_weight}</Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Fastest 30m Sprint</Text>
          <Text style={[styles.metricVal, { color: '#10B981' }]}>{analytics.fastest_sprint}</Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Max Vertical Jump</Text>
          <Text style={[styles.metricVal, { color: '#7C3AED' }]}>{analytics.highest_vertical_jump}</Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Best Broad Jump</Text>
          <Text style={styles.metricVal}>{analytics.best_broad_jump}</Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Avg. Sit-Ups</Text>
          <Text style={styles.metricVal}>{analytics.avg_sit_ups}</Text>
        </View>
      </View>

      {/* Completion progress ring banner */}
      <View style={styles.completionBanner}>
        <View style={styles.ringInfo}>
          <Award size={20} color="#7C3AED" />
          <View style={styles.completionTextCol}>
            <Text style={styles.completionTitle}>Battery Battery Completion</Text>
            <Text style={styles.completionSub}>Overall completion rate across registered athletes</Text>
          </View>
        </View>
        <View style={styles.percentPill}>
          <Text style={styles.percentPillText}>{analytics.overall_completion_pct}%</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricBox: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  completionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  ringInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  completionTextCol: {
    flex: 1,
  },
  completionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5B21B6',
  },
  completionSub: {
    fontSize: 10,
    color: '#6D28D9',
    marginTop: 1,
  },
  percentPill: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  percentPillText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
