import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from './AppNavigator';
import type { AthleteProfile, DashboardTest } from '../types/athleteDashboard';
import type { Athlete } from '../database/repositories/AthleteRepository';

/** Tests with a working screen flow in the app. */
export const IMPLEMENTED_TEST_KEYS = new Set([
  'height',
  'weight',
  'sit_reach',
  'vertical_jump',
  'broad_jump',
]);

/** Tests shown on the athlete dashboard (includes upcoming tests). */
export const DASHBOARD_TEST_KEYS = new Set([
  ...IMPLEMENTED_TEST_KEYS,
  'sit_ups',
]);

export const DASHBOARD_PERFORMANCE_KEYS = new Set([
  'height',
  'weight',
  'bmi',
  'flexibility',
  'vertical_jump',
  'broad_jump',
  'sit_ups',
]);

export function athleteFromProfile(profile: AthleteProfile): Athlete {
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

export function numericAthleteId(athleteId: string): number {
  const digits = athleteId.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 1;
}

export type TestNavigationTarget = {
  screen: keyof RootStackParamList;
  params?: RootStackParamList[keyof RootStackParamList];
};

export function getTestNavigationTarget(
  test: DashboardTest,
  profile: AthleteProfile,
): TestNavigationTarget | null {
  const key = test.key || test.id;

  switch (key) {
    case 'height':
      return {
        screen: 'HeightTestInstructions',
        params: { athlete: athleteFromProfile(profile) },
      };
    case 'weight':
      return { screen: 'WeightMeasurementHome' };
    case 'sit_reach':
      return {
        screen: 'SitAndReachEntry',
        params: {
          athleteId: numericAthleteId(profile.athleteId),
          athleteName: profile.name,
        },
      };
    case 'vertical_jump':
      return { screen: 'JumpCalibration', params: { testType: 'vertical' } };
    case 'broad_jump':
      return { screen: 'JumpCalibration', params: { testType: 'broad' } };
    default:
      return null;
  }
}

export function navigateToDashboardTest(
  navigation: NavigationProp<RootStackParamList>,
  test: DashboardTest,
  profile: AthleteProfile,
): boolean {
  const target = getTestNavigationTarget(test, profile);
  if (!target) {
    return false;
  }

  if (target.params !== undefined) {
    (navigation.navigate as any)(target.screen, target.params);
  } else {
    (navigation.navigate as any)(target.screen);
  }

  return true;
}
