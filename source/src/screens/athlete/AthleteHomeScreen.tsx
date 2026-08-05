import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Screen from '../../components/ui/Screen';
import AppText from '../../components/ui/AppText';
import Button from '../../components/ui/Button';
import SFSymbol from '../../components/ui/SFSymbol';
import {
  AssessmentHistoryList,
  AthleteBottomNav,
  AthleteReportCard,
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
import { colors, layout } from '../../theme';
import { t } from '../../utils/i18n';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Athlete Dashboard (Home) — Fixed 100vh viewport home screen with Chart.js Doughnut chart.
 * Header (Profile + Notification) is ONLY displayed on Home tab.
 * Home tab is strictly 100vh fixed (no scrolling).
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
      comingSoon(test?.name ?? t('dashboard.continueAssessment'));
    },
    [comingSoon],
  );

  const onTabChange = useCallback((tab: AthleteTab) => {
    setActiveTab(tab);
  }, []);

  const showLoading = loading && !data;
  const showError = !loading && !data;
  const incomplete = Boolean(data && data.progress.remaining > 0);

  return (
    <Screen
      fullWidth
      edges={['top', 'left', 'right']}
      style={styles.screen}
    >
      <View style={[styles.root, activeTab === 'home' && styles.rootFixed100vh]}>
        {showLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.textPrimary} size="large" />
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
          activeTab === 'home' ? (
            /* STRICT 100VH FIXED NON-SCROLLABLE HOME DASHBOARD */
            <View style={styles.fixedHome100vhContainer}>
              {/* Top Header (Profile top-left, Notification top-right) */}
              <DashboardHeader
                profile={data.profile}
                onProfilePress={() => navigation.navigate('AthleteProfile', { profile: data.profile })}
                onNotifications={() => comingSoon('Notifications')}
              />

              {fromCache && !isOnline ? (
                <View style={styles.offlineBanner}>
                  <AppText variant="caption" color={colors.warning}>
                    {t('dashboard.cachedOffline')}
                  </AppText>
                </View>
              ) : null}

              {/* Progress Card (Chart.js Style Doughnut Chart) */}
              <ProgressCard progress={data.progress} />

              {/* Assessment History Card (2 Items + inline View All button) */}
              <AssessmentHistoryList
                history={data.history}
                onView={(item: HistoryItem) => comingSoon(item.label)}
                onViewAll={() => setShowHistoryModal(true)}
              />

              {/* Current Test Card */}
              {incomplete ? (
                <CurrentTestCard
                  currentTest={data.currentTest}
                  onContinue={() => openAssessment()}
                />
              ) : null}
            </View>
          ) : (
            /* SCROLLABLE VIEW FOR OTHER SUB-PAGES */
            <ScrollView
              style={styles.scroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.subContent}
              bounces={false}
              overScrollMode="never"
            >
              {/* TAB 2: ASSESSMENTS LIST */}
              {activeTab === 'assessments' && (
                <TestJourneyList tests={data.tests} onOpenTest={openAssessment} />
              )}

              {/* TAB 3: RESULTS */}
              {activeTab === 'results' && (
                <>
                  <SectionTitle title="Assessment Results" />
                  <LatestResultCard latestResult={data.latestResult} />
                  <PerformanceSummary performance={data.performance} />
                </>
              )}

              {/* TAB 4: REPORTS */}
              {activeTab === 'reports' && (
                <>
                  <SectionTitle title="Digital Assessment Reports" />
                  <DigitalReportCard
                    onViewPdf={handleViewPdf}
                    onDownload={handleDownload}
                    onShare={handleShare}
                  />
                </>
              )}

              <View style={styles.bottomSpacer} />
            </ScrollView>
          )
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

        {/* Fixed 4-icon footer dock */}
        <AthleteBottomNav
          active={activeTab}
          onChange={onTabChange}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  root: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
  },
  rootFixed100vh: {
    height: SCREEN_HEIGHT,
    overflow: 'hidden',
  },
  fixedHome100vhContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    maxHeight: SCREEN_HEIGHT - 70,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 95,
    justifyContent: 'space-evenly',
    gap: 12,
  },
  scroll: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
  },
  subContent: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
    gap: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: layout.fieldGap,
    paddingHorizontal: layout.horizontalPadding,
  },
  offlineBanner: {
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bottomSpacer: {
    height: 8,
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    paddingVertical: 16,
  },
});

export default AthleteHomeScreen;
