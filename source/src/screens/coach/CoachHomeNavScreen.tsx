import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CoachHomeScreen } from './CoachHomeScreen';
import { BottomTabBar, TabKey } from '../../components/coach/BottomTabBar';
import PortalScreen from '../../components/ui/PortalScreen';
import { AssessmentsScreen } from '../assessments/AssessmentsScreen';
import { ReportsDashboardScreen } from '../reports/ReportsDashboardScreen';
import { SettingsScreen } from '../settings/SettingsScreen';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'CoachHome'>;

export default function CoachHomeNavScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('Home');

  const handleSelectTab = useCallback(
    (tab: TabKey) => {
      if (tab === 'Athletes') {
        navigation.navigate('AthleteList', undefined);
        return;
      }
      setActiveTab(tab);
    },
    [navigation],
  );

  const handleSignOut = useCallback(() => {
    navigation.reset({ index: 0, routes: [{ name: 'RoleSelect' }] });
  }, [navigation]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Home':
        return (
          <CoachHomeScreen
            onOpenNotifications={() => {}}
            onNavigateAddAthlete={() => navigation.navigate('AthleteRegistration', undefined)}
            onNavigateViewAthletes={() => navigation.navigate('AthleteList', undefined)}
            onNavigateViewAllSessions={() => setActiveTab('Assessments')}
          />
        );
      case 'Assessments':
        return (
          <AssessmentsScreen
            onNewAssessment={() => navigation.navigate('AthleteList', { selectForTest: true })}
            onResumeSession={() => {}}
            onSelectTest={() => {}}
            onSelectAthlete={() => navigation.navigate('AthleteList', { selectForTest: true })}
            onOpenCompleted={() => {}}
            onOpenPending={() => {}}
          />
        );
      case 'Analytics':
        return (
          <ReportsDashboardScreen
            onOpenAthleteWiseReport={() => {}}
            onOpenTestWiseReport={() => {}}
            onOpenAnalyticsDashboard={() => {}}
            onViewReportDocument={() => {}}
            onOpenSearch={() => {}}
          />
        );
      case 'Profile':
        return (
          <SettingsScreen
            onOpenLanguage={() => {}}
            onOpenPrivacy={() => {}}
            onOpenAbout={() => {}}
            onOpenOfflineSync={() => navigation.navigate('SyncStatus')}
            onSignOut={handleSignOut}
          />
        );
      default:
        return null;
    }
  };

  return (
    <PortalScreen style={styles.shell}>
      <View style={styles.content}>{renderTabContent()}</View>
      <BottomTabBar activeTab={activeTab} onSelectTab={handleSelectTab} />
    </PortalScreen>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
