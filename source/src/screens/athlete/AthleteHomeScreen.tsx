import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
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
import type {
  AthleteDashboardData,
  AthleteProfile,
  DashboardTest,
  HistoryItem,
} from '../../types/athleteDashboard';
import type { Athlete } from '../../database/repositories/AthleteRepository';
import { colors, layout } from '../../theme';
import { t } from '../../utils/i18n';

/** Map dashboard profile → height-flow Athlete model */
function athleteFromProfile(profile: AthleteProfile): Athlete {
  const now = Date.now();
  const birthYear = new Date().getFullYear() - Math.max(1, profile.age || 15);
  return {
    id: profile.athleteId,
    name: profile.name,
    gender: profile.gender.toLowerCase(),
    dateOfBirth: `${birthYear}-01-01`,
    phone: null,
    heightCategory: null,
    coachName: null,
    schoolAcademy: profile.institution,
    state: null,
    district: null,
    createdAt: now,
    updatedAt: now,
  };
}

function isHeightTest(test?: DashboardTest | null): boolean {
  if (!test) return false;
  return test.key === 'height' || test.id === 'height';
}

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

  const startHeightTest = useCallback(() => {
    if (!data?.profile) {
      comingSoon(t('dashboard.startAssessment'));
      return;
    }
    navigation.navigate('HeightTestInstructions', {
      athlete: athleteFromProfile(data.profile),
    });
  }, [comingSoon, data?.profile, navigation]);

  const openAssessment = useCallback(
    (test?: DashboardTest) => {
      // Height is the only battery test wired today; Continue / Start also open it.
      if (!test || isHeightTest(test)) {
        startHeightTest();
        return;
      }
      comingSoon(test.name);
    },
    [comingSoon, startHeightTest],
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
            />

            {/* 4. Quick Actions */}
            <QuickActionsRow
              onContinue={() => openAssessment()}
              onStart={startHeightTest}
              onResults={() =>
                navigation.navigate('History', { athleteId: data.profile.athleteId })
              }
              onReport={() => comingSoon(t('dashboard.viewReport'))}
              onHistory={() =>
                navigation.navigate('History', { athleteId: data.profile.athleteId })
              }
            />

            {/* 5. Current Test Card (only if incomplete) */}
            {incomplete ? (
              <CurrentTestCard
                currentTest={data.currentTest}
                onContinue={() => {
                  const current = data.tests.find(
                    t =>
                      t.key === data.currentTest?.testId ||
                      t.id === data.currentTest?.testId,
                  );
                  openAssessment(current);
                }}
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
          onCenterPress={startHeightTest}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
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
