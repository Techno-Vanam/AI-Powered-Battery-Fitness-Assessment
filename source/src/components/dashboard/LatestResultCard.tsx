import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from '../ui/AppText';
import SectionTitle from './SectionTitle';
import { colors } from '../../theme';
import { fontFamily } from '../../theme/fonts';
import { t } from '../../utils/i18n';
import type { LatestResultInfo } from '../../types/athleteDashboard';

type Props = { latestResult: LatestResultInfo };

export default function LatestResultCard({ latestResult }: Props) {
  if (!latestResult) return null;

  return (
    <View style={styles.card}>
      <SectionTitle title={t('dashboard.latestResult')} />
      <AppText variant="h3">{latestResult.testName}</AppText>
      <AppText style={styles.score}>{latestResult.score}</AppText>
      <AppText variant="caption" color={colors.textSecondary}>
        {t('dashboard.confidence')}: {latestResult.confidence}%
      </AppText>
      <AppText variant="caption" color={colors.textMuted}>
        completed {latestResult.minutesAgo} minutes ago
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 16,
    gap: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  score: {
    fontFamily: fontFamily('800'),
    fontSize: 32,
    lineHeight: 38,
    color: colors.textPrimary,
    letterSpacing: -0.8,
    marginVertical: 4,
  },
});
