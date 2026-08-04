import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { ArrowLeft, TrendingUp, Award, Building } from 'lucide-react-native';
import { StatCard } from '../../components/ui/StatCard';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ReportActionButtons } from '../../components/ui/ReportActionButtons';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';

interface AnalyticsDashboardScreenProps {
  onBack: () => void;
  onOpenViewer: (title: string) => void;
}

export const AnalyticsDashboardScreen: React.FC<AnalyticsDashboardScreenProps> = ({
  onBack,
  onOpenViewer,
}) => {
  const [timeframe, setTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');

  const chartData = [
    { label: 'Mon', val: 32 },
    { label: 'Tue', val: 45 },
    { label: 'Wed', val: 58 },
    { label: 'Thu', val: 40 },
    { label: 'Fri', val: 65 },
    { label: 'Sat', val: 72 },
    { label: 'Sun', val: 30 },
  ];

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Overall Analytics</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Timeframe Selector (Daily / Weekly / Monthly) */}
        <View style={styles.timeframeRow}>
          {(['Daily', 'Weekly', 'Monthly'] as const).map(tf => (
            <TouchableOpacity
              key={tf}
              style={[styles.tfBtn, timeframe === tf && styles.tfBtnActive]}
              onPress={() => setTimeframe(tf)}
            >
              <Text style={[styles.tfText, timeframe === tf && styles.tfTextActive]}>{tf}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 2x2 Stats Summary */}
        <View style={styles.statsRow}>
          <StatCard label="Completion Rate" value="88.75%" color={colors.success} />
          <View style={{ width: 8 }} />
          <StatCard label="Pending Rate" value="11.25%" color={colors.warning} />
        </View>

        {/* Assessment Volume Trend Bar Graph Visualizer */}
        <View style={[styles.card, layout.shadowSubtle, { marginTop: 12 }]}>
          <Text style={styles.cardTitle}>{timeframe} Assessment Volume</Text>
          <Text style={styles.cardSub}>Total assessments recorded per day</Text>

          <View style={styles.barChartContainer}>
            {chartData.map(item => (
              <View key={item.label} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { height: `${(item.val / 80) * 100}%` }]} />
                </View>
                <Text style={styles.barLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Coach Performance Benchmark */}
        <View style={[styles.card, layout.shadowSubtle, { marginTop: 14 }]}>
          <View style={styles.cardTitleRow}>
            <Award size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.cardTitle}>Coach Performance Benchmark</Text>
          </View>
          <Text style={styles.cardSub}>250 Athletes Assessed · 98.2% AI Validation Accuracy</Text>
          <View style={{ marginTop: 10 }}>
            <ProgressBar progress={98.2} color={colors.primary} height={8} />
          </View>
        </View>

        {/* School Comparison Breakdown */}
        <View style={[styles.card, layout.shadowSubtle, { marginTop: 14, marginBottom: 24 }]}>
          <View style={styles.cardTitleRow}>
            <Building size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.cardTitle}>School Comparison Breakdown</Text>
          </View>

          {[
            { school: 'Delhi Public School', rate: 94 },
            { school: 'St. Xavier High School', rate: 88 },
            { school: 'Modern School Vasant Vihar', rate: 85 },
            { school: 'Army Public School', rate: 82 },
          ].map(s => (
            <View key={s.school} style={styles.schoolItem}>
              <View style={styles.schoolTitleRow}>
                <Text style={styles.schoolName}>{s.school}</Text>
                <Text style={styles.schoolRate}>{s.rate}%</Text>
              </View>
              <ProgressBar progress={s.rate} color={colors.success} height={6} />
            </View>
          ))}

          <ReportActionButtons
            onView={() => onOpenViewer('Overall Analytics Summary Report')}
            onDownload={() => onOpenViewer('Overall Analytics Summary Report')}
            onShare={() => onOpenViewer('Overall Analytics Summary Report')}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: 16,
  },
  timeframeRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tfBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tfBtnActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tfText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tfTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    marginTop: 8,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
  },
  barTrack: {
    width: 14,
    height: 90,
    backgroundColor: colors.borderLight,
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 7,
  },
  barLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 6,
  },
  schoolItem: {
    marginTop: 10,
  },
  schoolTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  schoolName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  schoolRate: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.success,
  },
});
