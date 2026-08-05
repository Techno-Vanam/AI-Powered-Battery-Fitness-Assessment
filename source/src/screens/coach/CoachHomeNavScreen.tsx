import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CoachHomeScreen } from './CoachHomeScreen';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'CoachHome'>;

/** Bridges React Navigation to coach-dashboard callback-based CoachHomeScreen. */
export default function CoachHomeNavScreen(_props: Props) {
  return (
    <CoachHomeScreen
      onOpenNotifications={() => {}}
      onNavigateAddAthlete={() => {}}
      onNavigateViewAthletes={() => {}}
      onNavigateViewAllSessions={() => {}}
    />
  );
}
