import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { User, Activity, LogOut, Scale, ChevronRight } from 'lucide-react-native';
import Screen from '../../components/ui/Screen';
import AppText from '../../components/ui/AppText';
import Button from '../../components/ui/Button';
import {
  AchievementsRow,
  AiInsightsCard,
  AssessmentHistoryList,
  AthleteBottomNav,
  AthleteTab,
  CurrentTestCard,
  DashboardHeader,
  DigitalReportCard,
  GreetingCard,
  LatestResultCard,
  OfflineSyncCentre,
  PerformanceSummary,
  ProgressCard,
  QuickActionsRow,
  TestAccuracyCard,
  TestJourneyList,
} from '../../components/dashboard';
import {
  fetchAthleteDashboard,
  syncAthleteDashboardNow,
} from '../../services/athleteDashboardService';
import { MOCK_ATHLETE_DASHBOARD } from '../../data/mockAthleteDashboard';
import type { AthleteDashboardData, DashboardTest, HistoryItem } from '../../types/athleteDashboard';
import { colors, layout } from '../../theme';
import { t } from '../../utils/i18n';

/**
 * Athlete Dashboard (Home) — sections 1–15 in order.
 * Data: GET /api/athlete/dashboard (mock + AsyncStorage offline cache).
 */
const AthleteHomeScreen = ({ navigation }: any) => {
  const [data, setData] = useState<AthleteDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<AthleteTab>('home');

  const load = useCallback(async (mode: 'initial' | 'sync' = 'initial') => {
    if (mode === 'sync') setSyncing(true);
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
      setSyncing(false);
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

  const onTabChange = useCallback(
    (tab: AthleteTab) => {
      setActiveTab(tab);
      if (tab === 'home') return;
      if (tab === 'profile') {
        Alert.alert('Profile', undefined, [
          {
            text: 'Log Out',
            style: 'destructive',
            onPress: () => navigation.reset({ index: 0, routes: [{ name: 'RoleSelect' }] }),
          },
          { text: 'Cancel', style: 'cancel' },
        ]);
        return;
      }
      comingSoon(t(`dashboard.nav.${tab}`));
    },
    [comingSoon, navigation],
  );

  const showLoading = loading && !data;
  const showError = !loading && !data;
  const incomplete = Boolean(data && data.progress.remaining > 0);

  return (
    <Screen
      fullWidth
      edges={['top', 'left', 'right']}
      style={styles.screen}
    >
      <View style={styles.root}>
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
          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
            bounces={false}
            overScrollMode="never"
          >
            {/* 1. Header */}
            <DashboardHeader
              profile={data.profile}
              onNotifications={() => comingSoon('Notifications')}
              onSettings={() => comingSoon('Settings')}
            />

            {fromCache && !isOnline ? (
              <View style={styles.offlineBanner}>
                <AppText variant="caption" color={colors.warning}>
                  {t('dashboard.cachedOffline')}
                </AppText>
              </View>
            ) : null}

            {/* 2. Greeting Card */}
            <GreetingCard name={data.profile.name} greeting={data.greeting} />

            {/* 3. Overall Assessment Progress */}
            <ProgressCard
              progress={data.progress}
              onContinue={() => openAssessment()}
            />            {/* 4. Quick Actions */}
            <QuickActionsRow
              onContinue={() => openAssessment()}
              onStart={() => comingSoon(t('dashboard.startAssessment'))}
              onResults={() => comingSoon(t('dashboard.viewResults'))}
              onReport={() => comingSoon(t('dashboard.viewReport'))}
              onHistory={() => comingSoon(t('dashboard.assessmentHistory'))}
            />

            {/* Weight Measurement Module Card */}
            <TouchableOpacity
              style={styles.moduleCard}
              onPress={() => navigation.navigate('WeightMeasurementHome')}
              activeOpacity={0.85}
            >
              <View style={styles.moduleCardLeft}>
                <View style={styles.moduleIconBox}>
                  <Scale size={layout.iconLg} color={colors.primary} />
                </View>
                <View style={styles.moduleTextCol}>
                  <AppText variant="h3">Weight Measurement</AppText>
                  <AppText variant="bodySm" color={colors.textSecondary}>
                    Auto-scan digital scale LCD display via camera
                  </AppText>
                </View>
              </View>
              <ChevronRight size={layout.iconMd} color={colors.primary} />
            </TouchableOpacity>

            {/* 5. Current Test Card (only if incomplete) */}
            {incomplete ? (
              <CurrentTestCard
                currentTest={data.currentTest}
                onContinue={() => openAssessment()}
              />
            ) : null}

            {/* 6. Test Journey (10 Tests) */}
            <TestJourneyList tests={data.tests} onOpenTest={openAssessment} />

            {/* 7. Latest Result */}
            <LatestResultCard latestResult={data.latestResult} />

            {/* 8. Performance Summary */}
            <PerformanceSummary performance={data.performance} />

            {/* 9. AI Insights */}
            <AiInsightsCard aiInsights={data.aiInsights} />

            {/* 10. Test Accuracy */}
            <TestAccuracyCard
              overall={data.accuracy.overall}
              items={data.accuracy.items}
            />

            {/* 11. Assessment History */}
            <AssessmentHistoryList
              history={data.history}
              onView={(item: HistoryItem) => comingSoon(item.label)}
            />

            {/* 12. Digital Report Card */}
            <DigitalReportCard
              onViewPdf={() => comingSoon(t('dashboard.viewPdf'))}
              onDownload={() => comingSoon(t('dashboard.download'))}
              onShare={() => comingSoon(t('dashboard.share'))}
            />

            {/* 13. Achievements */}
            <AchievementsRow achievements={data.achievements} />

            {/* 14. Offline Sync Centre */}
            <OfflineSyncCentre
              isOnline={isOnline}
              sync={data.sync}
              syncing={syncing}
              onSyncNow={() => load('sync')}
            />

            <View style={styles.bottomSpacer} />
          </ScrollView>
        ) : null}

        {/* 15. Floating premium dock */}
        <AthleteBottomNav
          active={activeTab}
          onChange={onTabChange}
          onCenterPress={() => comingSoon(t('dashboard.startAssessment'))}
        />
      </View>
    </Screen>
  );
};


const styles = StyleSheet.create({
  moduleCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: layout.horizontalPadding,
    borderRadius: layout.radiusLg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginVertical: 4,
  },
  moduleCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.horizontalPadding,
    flex: 1,
  },
  moduleIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleTextCol: {
    gap: 2,
    flex: 1,
  },
  screen: {
    backgroundColor: '#FFFFFF',
  },
  root: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  content: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
    gap: 20,
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
    paddingVertical: 8,
  },
  bottomSpacer: {
    height: 8,
  },
});

export default AthleteHomeScreen;

