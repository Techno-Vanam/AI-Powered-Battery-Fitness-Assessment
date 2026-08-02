import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import AppText from '../ui/AppText';
import SectionTitle from './SectionTitle';
import { colors } from '../../theme';
import { t } from '../../utils/i18n';
import type { CurrentTestInfo } from '../../types/athleteDashboard';

type Props = {
  currentTest: CurrentTestInfo;
  onContinue: () => void;
};

export default function CurrentTestCard({ currentTest, onContinue }: Props) {
  if (!currentTest) return null;

  return (
    <View style={styles.card}>
      <SectionTitle title={t('dashboard.currentTest')} />
      <AppText variant="h3">{currentTest.name}</AppText>
      <AppText variant="bodySm" color={colors.textSecondary}>
        Status: {currentTest.status.replace('_', ' ')}
      </AppText>
      <View style={styles.meta}>
        <AppText variant="caption" color={colors.textMuted}>
          {t('dashboard.attemptsLeft')}: {currentTest.attemptsRemaining}
        </AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {t('dashboard.estTime')}: {currentTest.estimatedMinutes} min
        </AppText>
      </View>
      <TouchableOpacity style={styles.cta} onPress={onContinue} activeOpacity={0.85}>
        <AppText variant="button" color="#FFFFFF">
          {t('dashboard.continue')}
        </AppText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF7ED',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#FED7AA',
    padding: 16,
    gap: 4,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  cta: {
    marginTop: 10,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
