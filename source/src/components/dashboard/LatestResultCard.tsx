import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AppText from '../ui/AppText';
import { colors } from '../../theme';
import { portalStyles } from '../../theme/portalStyles';
import { fontFamily } from '../../theme/fonts';
import { t } from '../../utils/i18n';
import type { LatestResultInfo } from '../../types/athleteDashboard';

type Props = { latestResult: LatestResultInfo };

export default function LatestResultCard({ latestResult }: Props) {
  if (!latestResult) return null;

  return (
    <View style={[portalStyles.card, styles.card]}>
      <Text style={portalStyles.sectionHeader}>{t('dashboard.latestResult')}</Text>
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
    gap: 4,
  },
  score: {
    fontFamily: fontFamily('800'),
    fontSize: 32,
    lineHeight: 38,
    color: colors.primary,
    letterSpacing: -0.8,
    marginVertical: 4,
  },
});
