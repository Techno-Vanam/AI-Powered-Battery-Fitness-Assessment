import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import { OnboardingFlow } from '../components/OnboardingFlow';
import RoleSelectScreen from '../screens/shared/RoleSelectScreen';
import AthleteLoginScreen from '../screens/athlete/AthleteLoginScreen';
import AthleteRegisterScreen from '../screens/athlete/AthleteRegisterScreen';
import AthleteOtpVerifyScreen from '../screens/athlete/AthleteOtpVerifyScreen';
import AthleteHomeScreen from '../screens/athlete/AthleteHomeScreen';
import AthleteSelfProfileScreen from '../screens/athlete/AthleteProfileScreen';
import { CoachLoginScreen } from '../screens/coach/CoachLoginScreen';
import CoachRegisterScreen from '../screens/coach/CoachRegisterScreen';
import CoachOtpVerifyScreen from '../screens/coach/CoachOtpVerifyScreen';
import CoachHomeNavScreen from '../screens/coach/CoachHomeNavScreen';
import ForgotPasswordScreen from '../screens/shared/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/shared/ResetPasswordScreen';
import SetPasswordScreen from '../screens/shared/SetPasswordScreen';
import TermsAndConditionsScreen from '../screens/shared/TermsAndConditionsScreen';
import WeightMeasurementScreen from '../screens/weight/WeightMeasurementScreen';
import LiveWeightScannerScreen from '../screens/weight/LiveWeightScannerScreen';
import OCRResultScreen from '../screens/weight/OCRResultScreen';
import PendingUploadScreen from '../screens/weight/PendingUploadScreen';
import { AthleteRegistrationScreen } from '../screens/AthleteRegistrationScreen';
import { AthleteListScreen } from '../screens/AthleteListScreen';
import { HeightTestInstructionsScreen } from '../screens/HeightTestInstructionsScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { HeightResultScreen } from '../screens/HeightResultScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SyncStatusScreen from '../screens/SyncStatusScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import SitAndReachEntryScreen from '../screens/SitAndReach/SitAndReachEntryScreen';
import SitAndReachHistoryScreen from '../screens/SitAndReach/SitAndReachHistoryScreen';
import SitAndReachCorrectScreen from '../screens/SitAndReach/SitAndReachCorrectScreen';
import type { Athlete } from '../database/repositories/AthleteRepository';
import { JumpSelectionScreen } from '../modules/jumpAssessment/screens/JumpSelectionScreen';
import { JumpCalibrationScreen } from '../modules/jumpAssessment/screens/JumpCalibrationScreen';
import { VerticalJumpScreen } from '../modules/jumpAssessment/screens/VerticalJumpScreen';
import { BroadJumpScreen } from '../modules/jumpAssessment/screens/BroadJumpScreen';
import { JumpFrameAnalysisScreen } from '../modules/jumpAssessment/screens/JumpFrameAnalysisScreen';
import { JumpResultScreen } from '../modules/jumpAssessment/screens/JumpResultScreen';
import { JumpHistoryScreen } from '../modules/jumpAssessment/screens/JumpHistoryScreen';
import { SKIP_LOGIN_FOR_TESTING } from '../config/devFlags';

export type RootStackParamList = {
  Onboarding: undefined;
  RoleSelect: undefined;
  AthleteLogin: undefined;
  AthleteRegister: undefined;
  AthleteOtpVerify: { local_id: string; otp: string };
  AthleteHome: undefined;
  AthleteProfile: { profile?: import('../types/athleteDashboard').AthleteProfile };
  CoachLogin: undefined;
  CoachRegister: undefined;
  CoachOtpVerify: { local_id: string; otp: string };
  CoachHome: undefined;
  ForgotPassword: undefined;
  ResetPassword: { local_id: string };
  SetPassword: { local_id: string; role: 'athlete' | 'coach' };
  TermsAndConditions: { onAccept?: () => void };
  WeightMeasurementHome: undefined;
  WeightLiveScanner: undefined;
  WeightOCRResult: {
    weight: number | null;
    confidence: number;
    rawText: string;
    imagePath: string | null;
    recognitionMethod?: string;
  };
  WeightPendingUploads: undefined;
  AthleteRegistration: { athleteId?: string; athlete?: Athlete } | undefined;
  AthleteList: { selectForTest?: boolean } | undefined;
  HeightTestInstructions: { athlete: Athlete };
  Camera: { athlete: Athlete } | { athleteName?: string } | undefined;
  History: { athleteId?: string } | undefined;
  SyncStatus: undefined;
  Settings: undefined;
  HeightResult: {
    athlete: Athlete;
    measurementId: string;
    heightCm: number;
    confidence: number;
    timestamp: number;
    attemptCount: number;
    canRetry: boolean;
  };
  SitAndReachEntry: { athleteId: number; athleteName: string };
  SitAndReachHistory: { athleteId: number; athleteName: string };
  SitAndReachCorrect: {
    test: { id: number; trial_1: string; trial_2: string; trial_3: string };
    athleteId: number;
    athleteName: string;
  };
  JumpSelection: undefined;
  JumpCalibration: { testType: 'vertical' | 'broad' };
  VerticalJump: { pixelsPerCm?: number };
  BroadJump: { pixelsPerCm?: number };
  JumpFrameAnalysis: { testType?: 'vertical' | 'broad'; videoUri?: string };
  JumpResult: { testType: 'vertical' | 'broad'; metrics: unknown; method?: 'airtime' | 'live' };
  JumpHistory: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type OnboardingProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

<<<<<<< HEAD
function OnboardingScreen({ navigation }: OnboardingProps) {
  const goToRoleSelect = () => {
    navigation.replace('RoleSelect');
  };

  return <OnboardingFlow onComplete={goToRoleSelect} />;
=======
// Assessment Stack Screens
import { AssessmentsScreen } from '../screens/assessments/AssessmentsScreen';
import { NewAssessmentScreen } from '../screens/assessments/NewAssessmentScreen';
import { AssessmentProgressScreen } from '../screens/assessments/AssessmentProgressScreen';
import { TestSelectionScreen } from '../screens/assessments/TestSelectionScreen';
import { TestDetailsScreen } from '../screens/assessments/TestDetailsScreen';
import { CompletedAssessmentsScreen } from '../screens/assessments/CompletedAssessmentsScreen';
import { PendingAssessmentsScreen } from '../screens/assessments/PendingAssessmentsScreen';

// Reports Stack Screens
import { ReportsDashboardScreen } from '../screens/reports/ReportsDashboardScreen';
import { AthleteWiseReportScreen } from '../screens/reports/AthleteWiseReportScreen';
import { TestWiseReportScreen } from '../screens/reports/TestWiseReportScreen';
import { AnalyticsDashboardScreen } from '../screens/reports/AnalyticsDashboardScreen';
import { ReportViewerScreen } from '../screens/reports/ReportViewerScreen';

// Settings Stack Screens
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { LanguageSelectionScreen } from '../screens/settings/LanguageSelectionScreen';
import { PrivacyConsentScreen } from '../screens/settings/PrivacyConsentScreen';
import { AboutAppScreen } from '../screens/settings/AboutAppScreen';
import { OfflineSyncScreen } from '../screens/settings/OfflineSyncScreen';

// Search Screen
import { SearchScreen } from '../screens/search/SearchScreen';
import { Athlete } from '../types/app';
import { colors } from '../theme/colors';

type NavigationState =
  | 'Splash'
  | 'RoleSelect'
  | 'Login'
  | 'CoachLogin'
  | 'AthleteLogin'
  | 'CoachRegister'
  | 'AthleteRegister'
  | 'OtpVerify'
  | 'CoachOtpVerify'
  | 'AthleteOtpVerify'
  | 'ForgotPassword'
  | 'ResetPassword'
  | 'SetPassword'
  | 'TermsAndConditions'
  | 'Main'
  | 'AthleteHome'
  | 'AthleteSelfProfile'
  | 'Notifications'
  | 'SessionHistory'
  | 'AddAthlete'
  | 'AthleteProfile'
  | 'EditAthlete'
  | 'NewAssessment'
  | 'AssessmentProgress'
  | 'TestSelection'
  | 'TestDetails'
  | 'CompletedAssessments'
  | 'PendingAssessments'
  | 'AthleteWiseReport'
  | 'TestWiseReport'
  | 'AnalyticsDashboard'
  | 'ReportViewer'
  | 'LanguageSelection'
  | 'PrivacyConsent'
  | 'AboutApp'
  | 'OfflineSync'
  | 'Search';

interface NavEntry {
  route: NavigationState;
  tab: MainTabType;
}

function MainAppContainer() {
  const { selectedTab, setSelectedTab, athletes, settings, themeColors } = useApp();
  const isDark = settings.darkMode;
  const [currentRoute, setCurrentRouteState] = useState<NavigationState>('RoleSelect');

  // Chronological navigation stack
  const [navHistory, setNavHistory] = useState<NavEntry[]>([
    { route: 'RoleSelect', tab: 'Home' },
  ]);

  // Active selections for sub-screens
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete>(athletes[0]);
  const [selectedTestId, setSelectedTestId] = useState<string>('t1');
  const [selectedTestName, setSelectedTestName] = useState<string>('Height');
  const [reportViewerTitle, setReportViewerTitle] = useState<string>('Assessment Report');

  // Push navigation entry onto stack
  const navigateTo = (route: NavigationState, tab?: MainTabType) => {
    const targetTab = tab ?? selectedTab;
    setCurrentRouteState(route);
    if (tab) {
      setSelectedTab(tab);
    }
    setNavHistory(prev => {
      const last = prev[prev.length - 1];
      if (last && last.route === route && last.tab === targetTab) {
        return prev;
      }
      return [...prev, { route, tab: targetTab }];
    });
  };

  // Pop navigation entry from stack (Back behavior)
  const goBackNav = () => {
    if (navHistory.length > 1) {
      const newHistory = [...navHistory];
      newHistory.pop(); // Pop current
      const prevEntry = newHistory[newHistory.length - 1];
      setNavHistory(newHistory);
      setCurrentRouteState(prevEntry.route);
      setSelectedTab(prevEntry.tab);
      return true;
    }
    return false; // Exit app if at initial root
  };

  // Hardware Back Button Handler for Android
  useEffect(() => {
    const onBackPress = () => {
      return goBackNav();
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [navHistory]);

  const fakeNav = {
    navigate: (screen: string, params?: any) => {
      if (screen === 'RoleSelect') navigateTo('RoleSelect');
      else if (screen === 'AthleteLogin') navigateTo('AthleteHome');
      else if (screen === 'CoachLogin' || screen === 'Login') navigateTo('CoachLogin');
      else if (screen === 'AthleteRegister') navigateTo('AthleteRegister');
      else if (screen === 'CoachRegister') navigateTo('CoachRegister');
      else if (screen === 'AthleteOtpVerify') navigateTo('AthleteOtpVerify');
      else if (screen === 'CoachOtpVerify' || screen === 'OtpVerify') navigateTo('CoachOtpVerify');
      else if (screen === 'AthleteHome') navigateTo('AthleteHome');
      else if (screen === 'CoachHome' || screen === 'Main') navigateTo('Main', 'Home');
      else if (screen === 'ForgotPassword') navigateTo('ForgotPassword');
      else if (screen === 'ResetPassword') navigateTo('ResetPassword');
      else if (screen === 'SetPassword') navigateTo('SetPassword');
      else if (screen === 'TermsAndConditions') navigateTo('TermsAndConditions');
      else navigateTo(screen as NavigationState);
    },
    reset: ({ routes }: any) => {
      const target = routes[0]?.name;
      if (target === 'AthleteHome') navigateTo('AthleteHome');
      else if (target === 'CoachHome' || target === 'Main') navigateTo('Main', 'Home');
      else if (target === 'RoleSelect') navigateTo('RoleSelect');
      else if (target) navigateTo(target as NavigationState);
    },
    goBack: () => goBackNav(),
    replace: (screen: string) => {
      if (screen === 'AthleteHome') navigateTo('AthleteHome');
      else if (screen === 'CoachHome' || screen === 'Main') navigateTo('Main', 'Home');
      else navigateTo(screen as NavigationState);
    },
    push: (screen: string) => navigateTo(screen as NavigationState),
  };

  const showTabBar =
    currentRoute !== 'Splash' &&
    currentRoute !== 'RoleSelect' &&
    currentRoute !== 'Login' &&
    currentRoute !== 'CoachLogin' &&
    currentRoute !== 'AthleteLogin' &&
    currentRoute !== 'CoachRegister' &&
    currentRoute !== 'AthleteRegister' &&
    currentRoute !== 'OtpVerify' &&
    currentRoute !== 'CoachOtpVerify' &&
    currentRoute !== 'AthleteOtpVerify' &&
    currentRoute !== 'ForgotPassword' &&
    currentRoute !== 'ResetPassword' &&
    currentRoute !== 'SetPassword' &&
    currentRoute !== 'TermsAndConditions' &&
    currentRoute !== 'AthleteHome' &&
    currentRoute !== 'AthleteSelfProfile';

  const navigateToAthleteProfile = (ath: Athlete) => {
    setSelectedAthlete(ath);
    navigateTo('AthleteProfile');
  };

  const renderActiveScreen = () => {
    switch (currentRoute) {
      case 'Splash':
        return <SplashScreen onFinish={() => navigateTo('RoleSelect')} />;

      case 'RoleSelect':
        return <RoleSelectScreen navigation={fakeNav as any} route={{} as any} />;

      case 'Login':
      case 'CoachLogin':
        return (
          <CoachLoginScreen
            onLoginSuccess={() => navigateTo('CoachOtpVerify')}
            onForgotPassword={() => navigateTo('ForgotPassword')}
          />
        );

      case 'AthleteLogin':
        return <AthleteHomeScreen navigation={fakeNav as any} />;

      case 'CoachRegister':
        return <CoachRegisterScreen navigation={fakeNav as any} route={{} as any} />;

      case 'AthleteRegister':
        return <AthleteRegisterScreen navigation={fakeNav as any} route={{} as any} />;

      case 'OtpVerify':
      case 'CoachOtpVerify':
        return (
          <CoachOtpVerifyScreen
            route={{ params: { local_id: 'coach-1', otp: '123456' } } as any}
            navigation={fakeNav as any}
          />
        );

      case 'AthleteOtpVerify':
        return (
          <AthleteOtpVerifyScreen
            route={{ params: { local_id: 'ath-1', otp: '123456' } } as any}
            navigation={fakeNav as any}
          />
        );

      case 'AthleteHome':
        return <AthleteHomeScreen navigation={fakeNav as any} />;

      case 'AthleteSelfProfile':
        return <AthleteSelfProfileScreen navigation={fakeNav as any} route={{} as any} />;

      case 'ForgotPassword':
        return (
          <ForgotPasswordScreen
            navigation={fakeNav as any}
            route={{} as any}
          />
        );

      case 'ResetPassword':
        return (
          <ResetPasswordScreen
            navigation={fakeNav as any}
            route={{ params: { local_id: 'user-1' } } as any}
          />
        );

      case 'SetPassword':
        return (
          <SetPasswordScreen
            navigation={fakeNav as any}
            route={{ params: { local_id: 'user-1', role: 'athlete' } } as any}
          />
        );

      case 'TermsAndConditions':
        return (
          <TermsAndConditionsScreen
            navigation={fakeNav as any}
            route={{ params: { onAccept: () => goBackNav() } } as any}
          />
        );

      case 'Notifications':
        return <NotificationsScreen onBack={() => goBackNav()} />;

      case 'SessionHistory':
        return <SessionHistoryScreen onBack={() => goBackNav()} />;

      case 'AddAthlete':
        return (
          <AddAthleteScreen
            onBack={() => goBackNav()}
            onSuccess={() => navigateTo('Main', 'Athletes')}
          />
        );

      case 'AthleteProfile':
        return (
          <AthleteProfileScreen
            athlete={selectedAthlete}
            onBack={() => goBackNav()}
            onOpenProgress={() => navigateTo('AthleteWiseReport')}
            onEditAthlete={ath => {
              setSelectedAthlete(ath);
              navigateTo('EditAthlete');
            }}
          />
        );

      case 'EditAthlete':
        return (
          <EditAthleteScreen
            athlete={selectedAthlete}
            onBack={() => goBackNav()}
            onSuccess={() => goBackNav()}
          />
        );

      case 'NewAssessment':
        return (
          <NewAssessmentScreen
            onBack={() => goBackNav()}
            onStartSession={() => navigateTo('AssessmentProgress')}
          />
        );

      case 'AssessmentProgress':
        return (
          <AssessmentProgressScreen
            athlete={selectedAthlete}
            initialTestId={selectedTestId}
            onBack={() => goBackNav()}
            onSuccess={() => navigateTo('Main', 'Assess')}
          />
        );

      case 'TestSelection':
        return (
          <TestSelectionScreen
            onBack={() => goBackNav()}
            onSelectTest={(id, name) => {
              setSelectedTestId(id);
              setSelectedTestName(name);
              navigateTo('TestDetails');
            }}
          />
        );

      case 'TestDetails':
        return (
          <TestDetailsScreen
            testId={selectedTestId}
            testName={selectedTestName}
            onBack={() => goBackNav()}
            onStartAssessment={(ath, tId) => {
              setSelectedAthlete(ath);
              setSelectedTestId(tId);
              navigateTo('AssessmentProgress');
            }}
          />
        );

      case 'CompletedAssessments':
        return (
          <CompletedAssessmentsScreen
            onBack={() => goBackNav()}
            onSelectAthlete={navigateToAthleteProfile}
          />
        );

      case 'PendingAssessments':
        return (
          <PendingAssessmentsScreen
            onBack={() => goBackNav()}
            onSelectAthlete={navigateToAthleteProfile}
          />
        );

      case 'AthleteWiseReport':
        return (
          <AthleteWiseReportScreen
            onBack={() => goBackNav()}
            onOpenViewer={(ttl, ath) => {
              if (ath) setSelectedAthlete(ath);
              setReportViewerTitle(ttl);
              navigateTo('ReportViewer');
            }}
          />
        );

      case 'TestWiseReport':
        return (
          <TestWiseReportScreen
            onBack={() => goBackNav()}
            onOpenViewer={ttl => {
              setReportViewerTitle(ttl);
              navigateTo('ReportViewer');
            }}
          />
        );

      case 'AnalyticsDashboard':
        return (
          <AnalyticsDashboardScreen
            onBack={() => goBackNav()}
            onOpenViewer={ttl => {
              setReportViewerTitle(ttl);
              navigateTo('ReportViewer');
            }}
          />
        );

      case 'ReportViewer':
        return (
          <ReportViewerScreen
            athlete={selectedAthlete}
            title={reportViewerTitle}
            onBack={() => goBackNav()}
          />
        );

      case 'LanguageSelection':
        return <LanguageSelectionScreen onBack={() => goBackNav()} />;

      case 'PrivacyConsent':
        return <PrivacyConsentScreen onBack={() => goBackNav()} />;

      case 'AboutApp':
        return <AboutAppScreen onBack={() => goBackNav()} />;

      case 'OfflineSync':
        return <OfflineSyncScreen onBack={() => goBackNav()} />;

      case 'Search':
        return (
          <SearchScreen
            onBack={() => goBackNav()}
            onSelectAthlete={navigateToAthleteProfile}
          />
        );

      case 'Main':
      default:
        switch (selectedTab) {
          case 'Home':
            return (
              <CoachHomeScreen
                onOpenNotifications={() => navigateTo('Notifications')}
                onNavigateAddAthlete={() => navigateTo('AddAthlete')}
                onNavigateViewAthletes={() => navigateTo('Main', 'Athletes')}
                onNavigateViewAllSessions={() => navigateTo('SessionHistory')}
              />
            );

          case 'Athletes':
            return (
              <AthleteListScreen
                onAddAthlete={() => navigateTo('AddAthlete')}
                onSelectAthlete={navigateToAthleteProfile}
              />
            );

          case 'Assess':
            return (
              <AssessmentsScreen
                onNewAssessment={() => navigateTo('NewAssessment')}
                onResumeSession={() => navigateTo('AssessmentProgress')}
                onSelectTest={(tId, tName) => {
                  setSelectedTestId(tId);
                  setSelectedTestName(tName);
                  navigateTo('TestDetails');
                }}
                onSelectAthlete={navigateToAthleteProfile}
                onOpenCompleted={() => navigateTo('CompletedAssessments')}
                onOpenPending={() => navigateTo('PendingAssessments')}
              />
            );

          case 'Reports':
            return (
              <ReportsDashboardScreen
                onOpenAthleteWiseReport={() => navigateTo('AthleteWiseReport')}
                onOpenTestWiseReport={() => navigateTo('TestWiseReport')}
                onOpenAnalyticsDashboard={() => navigateTo('AnalyticsDashboard')}
                onViewReportDocument={(rType, _fmt) => {
                  setReportViewerTitle(rType);
                  navigateTo('ReportViewer');
                }}
                onOpenSearch={() => navigateTo('Search')}
              />
            );

          case 'Settings':
            return (
              <SettingsScreen
                onOpenLanguage={() => navigateTo('LanguageSelection')}
                onOpenPrivacy={() => navigateTo('PrivacyConsent')}
                onOpenAbout={() => navigateTo('AboutApp')}
                onOpenOfflineSync={() => navigateTo('OfflineSync')}
                onSignOut={() => navigateTo('Login')}
              />
            );
        }
    }
  };

  const insets = useSafeAreaInsets();
  const bottomPadding = showTabBar ? 74 + Math.max(insets.bottom, 12) : 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={themeColors.background}
        translucent={false}
      />
      <View style={[styles.contentContainer, { backgroundColor: themeColors.background, paddingBottom: bottomPadding }]}>
        {renderActiveScreen()}
      </View>
      {showTabBar && (
        <BottomTabBar
          onTabPress={tab => {
            navigateTo('Main', tab);
          }}
        />
      )}
    </SafeAreaView>
  );
>>>>>>> feature/coach-dashboard
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={SKIP_LOGIN_FOR_TESTING ? 'JumpSelection' : 'Onboarding'}
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen
          name="RoleSelect"
          component={RoleSelectScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen name="AthleteLogin" component={AthleteLoginScreen} />
        <Stack.Screen name="AthleteRegister" component={AthleteRegisterScreen} />
        <Stack.Screen name="AthleteOtpVerify" component={AthleteOtpVerifyScreen} />
        <Stack.Screen name="AthleteHome" component={AthleteHomeScreen} />
        <Stack.Screen name="AthleteProfile" component={AthleteProfileScreen} />
        <Stack.Screen name="CoachLogin" component={CoachLoginScreen} />
        <Stack.Screen name="CoachRegister" component={CoachRegisterScreen} />
        <Stack.Screen name="CoachOtpVerify" component={CoachOtpVerifyScreen} />
        <Stack.Screen name="CoachHome" component={CoachHomeNavScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="SetPassword" component={SetPasswordScreen} />
        <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
        <Stack.Screen name="WeightMeasurementHome" component={WeightMeasurementScreen} />
        <Stack.Screen
          name="WeightLiveScanner"
          component={LiveWeightScannerScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="WeightOCRResult" component={OCRResultScreen} />
        <Stack.Screen name="WeightPendingUploads" component={PendingUploadScreen} />
        <Stack.Screen name="AthleteRegistration" component={AthleteRegistrationScreen} />
        <Stack.Screen name="AthleteList" component={AthleteListScreen} />
        <Stack.Screen name="HeightTestInstructions" component={HeightTestInstructionsScreen} />
        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{ orientation: 'portrait', animation: 'slide_from_right' }}
        />
        <Stack.Screen name="HeightResult" component={HeightResultScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="SyncStatus" component={SyncStatusScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="SitAndReachEntry" component={SitAndReachEntryScreen} />
        <Stack.Screen name="SitAndReachHistory" component={SitAndReachHistoryScreen} />
        <Stack.Screen name="SitAndReachCorrect" component={SitAndReachCorrectScreen} />
        <Stack.Screen name="JumpSelection" component={JumpSelectionScreen} />
        <Stack.Screen name="JumpCalibration" component={JumpCalibrationScreen} />
        <Stack.Screen name="VerticalJump" component={VerticalJumpScreen} />
        <Stack.Screen name="BroadJump" component={BroadJumpScreen} />
        <Stack.Screen name="JumpFrameAnalysis" component={JumpFrameAnalysisScreen} />
        <Stack.Screen name="JumpResult" component={JumpResultScreen} />
        <Stack.Screen name="JumpHistory" component={JumpHistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
