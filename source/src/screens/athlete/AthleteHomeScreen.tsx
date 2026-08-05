import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from '../../components/ui/AppText';
import Button from '../../components/ui/Button';
import SFSymbol from '../../components/ui/SFSymbol';
import {
  AssessmentHistoryList,
  AthleteBottomNav,
  AthleteTab,
  CurrentTestCard,
  DashboardHeader,
  DigitalReportCard,
  LatestResultCard,
  PerformanceSummary,
  ProgressCard,
  ReportCardModal,
  SectionTitle,
  TestJourneyList,
} from '../../components/dashboard';
import {
  fetchAthleteDashboard,
  syncAthleteDashboardNow,
} from '../../services/athleteDashboardService';
import { downloadReportFile, shareReportPDF } from '../../services/reportDownloadService';
import { MOCK_ATHLETE_DASHBOARD } from '../../data/mockAthleteDashboard';
import type { AthleteDashboardData, DashboardTest, HistoryItem } from '../../types/athleteDashboard';
import { navigateToDashboardTest } from '../../navigation/testRoutes';
import { colors } from '../../theme';
import { portalStyles } from '../../theme/portalStyles';
import { t } from '../../utils/i18n';

/**
 * Athlete portal home — layout aligned with coach portal (header + scroll + bottom tabs).
 */
const AthleteHomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<AthleteDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<AthleteTab>('home');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const handleViewPdf = useCallback(() => {
    setShowReportModal(true);
  }, []);

  const handleDownload = useCallback(() => {
    void downloadReportFile(data, 'ASMT-2026-0804-001', () => setShowReportModal(true));
  }, [data]);

  const handleShare = useCallback(() => {
    void shareReportPDF(data, 'ASMT-2026-0804-001');
  }, [data]);

  const load = useCallback(async (mode: 'initial' | 'sync' = 'initial') => {
    if (mode === 'initial') setLoading(true);

    try {
      const result =
        mode === 'sync' ? await syncAthleteDashboardNow() : await fetchAthleteDashboard();
      setData(result.data);
      setFromCache(result.fromCache);
      setIsOnline(result.isOnline);
    } catch {
      setData(MOCK_ATHLETE_DASHBOARD);
      setFromCache(true);
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load('initial');
  }, [load]);

  const comingSoon = useCallback((label?: string) => {
    Alert.alert(label ?? 'Info', t('dashboard.comingSoon'));
  }, []);

  const openAssessment = useCallback(
    (test?: DashboardTest) => {
      if (!data) {
        comingSoon();
        return;
      }

      const currentTestId = data.currentTest?.testId;
      const target =
        test ??
        (currentTestId ? data.tests.find(t => t.key === currentTestId || t.id === currentTestId) : null) ??
        null;

      if (!target) {
        comingSoon(data.currentTest?.name || 'Test');
        return;
      }

      const opened = navigateToDashboardTest(navigation, target, data.profile);
      if (!opened) {
        comingSoon(target.name);
      }
    },
    [comingSoon, data, navigation],
  );

  const onTabChange = useCallback((tab: AthleteTab) => {
    setActiveTab(tab);
  }, []);

  const showLoading = loading && !data;
  const showError = !loading && !data;
  const incomplete = Boolean(data && data.progress.remaining > 0);

  return (
    <View style={portalStyles.screen}>
      {showLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <AppText variant="bodySm" color={colors.textSecondary}>
            {t('dashboard.loading')}
          </AppText>
        </View>
      ) : null}

      {showError ? (
        <View style={styles.center}>
          <AppText variant="body">{t('dashboard.error')}</AppText>
          <Button title={t('dashboard.retry')} role="athlete" onPress={() => load('initial')} />
        </View>
      ) : null}

      {data ? (
        <>
          {activeTab === 'home' ? (
            <DashboardHeader
              profile={data.profile}
              onProfilePress={() => navigation.navigate('AthleteProfile', { profile: data.profile })}
              onNotifications={() => comingSoon('Notifications')}
            />
          ) : null}

          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {activeTab === 'home' ? (
              <>
                {fromCache && !isOnline ? (
                  <View style={styles.offlineBanner}>
                    <AppText variant="caption" color={colors.warning}>
                      {t('dashboard.cachedOffline')}
                    </AppText>
                  </View>
                ) : null}

                <ProgressCard progress={data.progress} />

                <AssessmentHistoryList
                  history={data.history}
                  onView={(item: HistoryItem) => comingSoon(item.label)}
                  onViewAll={() => setShowHistoryModal(true)}
                />

                {incomplete && data.currentTest ? (
                  <CurrentTestCard
                    currentTest={data.currentTest}
                    onContinue={() => openAssessment()}
                  />
                ) : null}
              </>
            ) : null}

            {activeTab === 'assessments' ? (
              <TestJourneyList tests={data.tests} onOpenTest={openAssessment} />
            ) : null}

            {activeTab === 'results' ? (
              <>
                <SectionTitle title="Assessment Results" />
                <LatestResultCard latestResult={data.latestResult} />
                <PerformanceSummary performance={data.performance} />
              </>
            ) : null}

            {activeTab === 'reports' ? (
              <>
                <SectionTitle title="Digital Assessment Reports" />
                <DigitalReportCard
                  onViewPdf={handleViewPdf}
                  onDownload={handleDownload}
                  onShare={handleShare}
                />
              </>
            ) : null}
          </ScrollView>
        </>
      ) : null}

        {/* Report Card Modal (Full screen view PDF / download / share) */}
        <ReportCardModal
          visible={showReportModal}
          onClose={() => setShowReportModal(false)}
          data={data}
          onDownload={handleDownload}
          onShare={handleShare}
        />

        {/* Full Assessment History Modal (Shifted down clear of status bar) */}
        {data && (
          <Modal
            visible={showHistoryModal}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setShowHistoryModal(false)}
          >
            <View style={[styles.modalContent, { paddingTop: Math.max(insets.top + 16, 52) }]}>
              <View style={styles.modalHeader}>
                <AppText variant="h3">Full Assessment History</AppText>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setShowHistoryModal(false)}
                >
                  <SFSymbol name="xmark" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.modalScroll}>
                <AssessmentHistoryList
                  history={data.history}
                  showAll={true}
                  hideHeader={true}
                  onView={(item: HistoryItem) => {
                    setShowHistoryModal(false);
                    comingSoon(item.label);
                  }}
                />
              </ScrollView>
            </View>
          </Modal>
        )}

        <AthleteBottomNav active={activeTab} onChange={onTabChange} />
    </View>
  );
};


const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    ...portalStyles.scrollContent,
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  offlineBanner: {
    backgroundColor: colors.warningBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modalContent: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    paddingVertical: 16,
  },
});

export default AthleteHomeScreen;

