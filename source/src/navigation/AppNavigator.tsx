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
import CoachLoginScreen from '../screens/coach/CoachLoginScreen';
import CoachRegisterScreen from '../screens/coach/CoachRegisterScreen';
import CoachOtpVerifyScreen from '../screens/coach/CoachOtpVerifyScreen';
import CoachHomeScreen from '../screens/coach/CoachHomeScreen';
import ForgotPasswordScreen from '../screens/shared/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/shared/ResetPasswordScreen';
import SetPasswordScreen from '../screens/shared/SetPasswordScreen';
import TermsAndConditionsScreen from '../screens/shared/TermsAndConditionsScreen';
import WeightMeasurementScreen from '../screens/weight/WeightMeasurementScreen';
import LiveWeightScannerScreen from '../screens/weight/LiveWeightScannerScreen';
import OCRResultScreen from '../screens/weight/OCRResultScreen';
import PendingUploadScreen from '../screens/weight/PendingUploadScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  RoleSelect: undefined;
  AthleteLogin: undefined;
  AthleteRegister: undefined;
  AthleteOtpVerify: { local_id: string; otp: string };
  AthleteHome: undefined;
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
  WeightOCRResult: { weight: number | null; confidence: number; rawText: string; imagePath: string | null; recognitionMethod?: string };
  WeightPendingUploads: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type OnboardingProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

function OnboardingScreen({ navigation }: OnboardingProps) {
  const goToRoleSelect = () => {
    navigation.replace('RoleSelect');
  };

  return <OnboardingFlow onComplete={goToRoleSelect} />;
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Onboarding"
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
        <Stack.Screen name="CoachLogin" component={CoachLoginScreen} />
        <Stack.Screen name="CoachRegister" component={CoachRegisterScreen} />
        <Stack.Screen name="CoachOtpVerify" component={CoachOtpVerifyScreen} />
        <Stack.Screen name="CoachHome" component={CoachHomeScreen} />
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

