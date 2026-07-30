/**
 * Sports Assessment Platform
 * Offline-First Auth Flow — App Entry Point
 */

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import 'react-native-get-random-values'; // Must be first for uuid to work

import { createTables } from './src/db/schema';
import { startSyncListener } from './src/services/syncService';

import SelectModeScreen from './src/screens/shared/SelectModeScreen';
import AthleteRegisterScreen from './src/screens/athlete/AthleteRegisterScreen';
import AthleteLoginScreen from './src/screens/athlete/AthleteLoginScreen';
import AthleteOtpVerifyScreen from './src/screens/athlete/AthleteOtpVerifyScreen';
import CoachRegisterScreen from './src/screens/coach/CoachRegisterScreen';
import CoachLoginScreen from './src/screens/coach/CoachLoginScreen';
import CoachOtpVerifyScreen from './src/screens/coach/CoachOtpVerifyScreen';
import SetPasswordScreen from './src/screens/shared/SetPasswordScreen';
import ForgotPasswordScreen from './src/screens/shared/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/shared/ResetPasswordScreen';
import TermsAndConditionsScreen from './src/screens/shared/TermsAndConditionsScreen';
import AthleteHomeScreen from './src/screens/athlete/AthleteHomeScreen';
import CoachHomeScreen from './src/screens/coach/CoachHomeScreen';

const Stack = createNativeStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    // Initialize SQLite tables on first run (synchronous)
    try {
      createTables();
      console.log('[DB] Database initialized successfully');
    } catch (e) {
      console.error('[DB] Failed to initialize database:', e);
    }

    // Start background sync listener (runs whenever network comes back online)
    const unsubscribeSync = startSyncListener();

    return () => {
      unsubscribeSync();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor="#F8FAFC" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="SelectMode"
          screenOptions={{
            headerShown: true,
            headerBackTitleVisible: false,
            headerStyle: { backgroundColor: '#F8FAFC' },
            headerShadowVisible: false,
            headerTintColor: '#0F172A',
          }}
        >
          <Stack.Screen
            name="SelectMode"
            component={SelectModeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AthleteRegister"
            component={AthleteRegisterScreen}
            options={{ title: 'New Athlete' }}
          />
          <Stack.Screen
            name="AthleteOtpVerify"
            component={AthleteOtpVerifyScreen}
            options={{ title: 'Verify OTP', headerBackVisible: false }}
          />
          <Stack.Screen
            name="AthleteLogin"
            component={AthleteLoginScreen}
            options={{ title: 'Athlete Login' }}
          />
          <Stack.Screen
            name="CoachRegister"
            component={CoachRegisterScreen}
            options={{ title: 'New Coach' }}
          />
          <Stack.Screen
            name="CoachOtpVerify"
            component={CoachOtpVerifyScreen}
            options={{ title: 'Verify OTP', headerBackVisible: false }}
          />
          <Stack.Screen
            name="CoachLogin"
            component={CoachLoginScreen}
            options={{ title: 'Coach Login' }}
          />
          <Stack.Screen
            name="SetPassword"
            component={SetPasswordScreen}
            options={{ title: 'Set Password', headerBackVisible: false }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ title: 'Forgot Password' }}
          />
          <Stack.Screen
            name="ResetPassword"
            component={ResetPasswordScreen}
            options={{ title: 'Reset Password', headerBackVisible: false }}
          />
          <Stack.Screen
            name="TermsAndConditions"
            component={TermsAndConditionsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AthleteHome"
            component={AthleteHomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CoachHome"
            component={CoachHomeScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
