import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Zap } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useSplashScreenViewModel } from '../hooks/useSplashScreenViewModel';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';
import { fontFamily } from '../theme/fonts';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const handleReady = useCallback(() => {
    navigation.replace('Onboarding');
  }, [navigation]);

  const { statusText } = useSplashScreenViewModel(handleReady);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.center}>
        <View style={styles.iconShell}>
          <View style={styles.iconInner}>
            <Zap size={40} color={colors.primary} strokeWidth={2.4} fill={colors.primaryLight} />
          </View>
        </View>

        <Text style={styles.appName}>Battery Fitness</Text>
        <Text style={styles.tagline}>AI-Powered Assessment</Text>

        <View style={styles.brandPill}>
          <Text style={styles.brandText}>TECHNO VANAM</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.statusText}>{statusText}</Text>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

const ICON_SIZE = 96;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    paddingHorizontal: layout.horizontalPadding,
    paddingBottom: 28,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 48,
  },
  iconShell: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    ...layout.shadowSubtle,
  },
  iconInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontFamily: fontFamily('800'),
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.6,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  tagline: {
    fontFamily: fontFamily('500'),
    fontSize: 16,
    lineHeight: 22,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  brandPill: {
    marginTop: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
  },
  brandText: {
    fontFamily: fontFamily('700'),
    fontSize: 11,
    letterSpacing: 2.2,
    color: colors.primary,
  },
  footer: {
    alignItems: 'center',
    gap: 10,
  },
  statusText: {
    fontFamily: fontFamily('500'),
    fontSize: 14,
    color: colors.textMuted,
  },
  versionText: {
    fontFamily: fontFamily('400'),
    fontSize: 12,
    color: colors.textTertiary,
  },
});
