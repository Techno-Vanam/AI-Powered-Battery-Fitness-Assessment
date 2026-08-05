import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { ArrowLeft, Award, AlertCircle, TrendingUp } from 'lucide-react-native';
import { STANDARD_10_TESTS } from '../../data/mockData';
import { StatCard } from '../../components/ui/StatCard';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ReportActionButtons } from '../../components/ui/ReportActionButtons';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';

interface TestWiseReportScreenProps {
  onBack: () => void;
  onOpenViewer: (title: string) => void;
}

export const TestWiseReportScreen: React.FC<TestWiseReportScreenProps> = ({
  onBack,
  onOpenViewer,
}) => {
  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test-wise Battery Analytics</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Benchmark Summary */}
        <View style={styles.statsRow}>
          <StatCard label="Overall Pass Rate" value="84.2%" color={colors.success} />
          <View style={{ width: 8 }} />
          <StatCard label="Avg Score / Test" value="7.8 / 10" color={colors.primary} />
        </View>

        {/* Test Performance Breakdown */}
        {STANDARD_10_TESTS.map((t, idx) => {
          const passPct = 80 + (idx % 15);
          const avgVal = idx % 2 === 0 ? '172 cm' : '4.32 sec';

          return (
            <View key={t.testId} style={[styles.card, layout.shadowSubtle]}>
              <View style={styles.cardHeader}>
                <View style={styles.titleCol}>
                  <Text style={styles.testTitle}>{t.testName}</Text>
                  <Text style={styles.testCat}>{t.category}</Text>
                </View>
                <View style={styles.passBadge}>
                  <Text style={styles.passText}>{passPct}% Pass Rate</Text>
                </View>
              </View>

              <View style={styles.progressWrap}>
                <ProgressBar progress={passPct} color={colors.success} height={6} />
              </View>

              <View style={styles.perfRow}>
                <View style={styles.perfItem}>
                  <Award size={14} color={colors.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.perfLabel}>Top Performer: </Text>
                  <Text style={styles.perfVal}>Aarav Sharma</Text>
                </View>

                <View style={styles.perfItem}>
                  <AlertCircle size={14} color={colors.warning} style={{ marginRight: 4 }} />
                  <Text style={styles.perfLabel}>Needs Focus: </Text>
                  <Text style={styles.perfVal}>Rohan Mehta</Text>
                </View>
              </View>

              <ReportActionButtons
                onView={() => onOpenViewer(`Test Report - ${t.testName}`)}
                onDownload={() => onOpenViewer(`Test Report - ${t.testName}`)}
                onShare={() => onOpenViewer(`Test Report - ${t.testName}`)}
              />
            </View>
          );
        })}
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
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleCol: {
    flex: 1,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  testCat: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  passBadge: {
    backgroundColor: colors.successBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  passText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
  },
  progressWrap: {
    marginVertical: 10,
  },
  perfRow: {
    marginTop: 6,
    marginBottom: 8,
  },
  perfItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  perfLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  perfVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
