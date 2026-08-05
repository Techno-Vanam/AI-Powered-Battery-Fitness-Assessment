import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Alert } from 'react-native';
import { User, BarChart2, PieChart, FileText } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { ReportActionButtons } from '../../components/ui/ReportActionButtons';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';

interface ReportsDashboardScreenProps {
  onOpenAthleteWiseReport: () => void;
  onOpenTestWiseReport: () => void;
  onOpenAnalyticsDashboard: () => void;
  onViewReportDocument: (reportType: string, format: 'PDF' | 'Excel' | 'CSV') => void;
  onOpenSearch: () => void;
}

export const ReportsDashboardScreen: React.FC<ReportsDashboardScreenProps> = ({
  onOpenAthleteWiseReport,
  onOpenTestWiseReport,
  onOpenAnalyticsDashboard,
  onViewReportDocument,
}) => {

  const handleDownloadClick = (reportType: string) => {
    Alert.alert(
      'Download Report',
      `Select format to download ${reportType}:`,
      [
        {
          text: 'PDF Document (.pdf)',
          onPress: () => onViewReportDocument(reportType, 'PDF'),
        },
        {
          text: 'Excel Sheet (.xlsx)',
          onPress: () => onViewReportDocument(reportType, 'Excel'),
        },
        {
          text: 'CSV File (.csv)',
          onPress: () => onViewReportDocument(reportType, 'CSV'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleShareClick = (reportType: string) => {
    Alert.alert(
      'Share Report',
      `Select format to share ${reportType}:`,
      [
        {
          text: 'PDF Document (.pdf)',
          onPress: () => onViewReportDocument(reportType, 'PDF'),
        },
        {
          text: 'Excel Sheet (.xlsx)',
          onPress: () => onViewReportDocument(reportType, 'Excel'),
        },
        {
          text: 'CSV File (.csv)',
          onPress: () => onViewReportDocument(reportType, 'CSV'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Reports</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. Athlete-wise Report Card */}
        <View style={[styles.reportCard, layout.shadowSubtle]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconCircle}>
              <User size={22} color={colors.primary} />
            </View>
            <View style={styles.cardTitleCol}>
              <Text style={styles.cardTitle}>1. Athlete-wise Report</Text>
              <Text style={styles.cardSub}>Individual athlete performance & AI recommendations</Text>
            </View>
          </View>

          <ReportActionButtons
            onView={onOpenAthleteWiseReport}
            onDownload={() => handleDownloadClick('Athlete-wise Report')}
            onShare={() => handleShareClick('Athlete-wise Report')}
          />
        </View>

        {/* 2. Test-wise Report Card */}
        <View style={[styles.reportCard, layout.shadowSubtle]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconCircle}>
              <BarChart2 size={22} color={colors.primary} />
            </View>
            <View style={styles.cardTitleCol}>
              <Text style={styles.cardTitle}>2. Test-wise Report</Text>
              <Text style={styles.cardSub}>Average scores, pass %, top/lowest performers</Text>
            </View>
          </View>

          <ReportActionButtons
            onView={onOpenTestWiseReport}
            onDownload={() => handleDownloadClick('Test-wise Report')}
            onShare={() => handleShareClick('Test-wise Report')}
          />
        </View>

        {/* 3. Overall Analytics Card */}
        <View style={[styles.reportCard, layout.shadowSubtle]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconCircle}>
              <PieChart size={22} color={colors.primary} />
            </View>
            <View style={styles.cardTitleCol}>
              <Text style={styles.cardTitle}>3. Overall Analytics</Text>
              <Text style={styles.cardSub}>Daily/Weekly/Monthly charts & school benchmarks</Text>
            </View>
          </View>

          <ReportActionButtons
            onView={onOpenAnalyticsDashboard}
            onDownload={() => handleDownloadClick('Analytics Summary')}
            onShare={() => handleShareClick('Analytics Summary')}
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitleCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  quickExportSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  quickExportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  quickExportText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
