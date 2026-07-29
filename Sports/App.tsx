/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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

const Stack = createNativeStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

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
            options={{ title: 'Verify OTP' }}
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
            options={{ title: 'Verify OTP' }}
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
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
