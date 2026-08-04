import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import AppText from '../ui/AppText';
import { colors } from '../../theme';
import { fontFamily } from '../../theme/fonts';
import { t } from '../../utils/i18n';
import type { ProgressInfo } from '../../types/athleteDashboard';

type Props = {
  progress: ProgressInfo;
  onContinue: () => void;
};

export default function ProgressCard({ progress, onContinue }: Props) {
  return (
    <View style={styles.card}>
      <AppText variant="caption" color={colors.textMuted}>
        {t('dashboard.overallProgress')}
      </AppText>
      <View style={styles.valueRow}>
        <AppText style={styles.value}>{progress.percent}%</AppText>
      </View>
      <View style={styles.counts}>
        <AppText variant="caption" color={colors.textSecondary}>
          {t('dashboard.completed')}: {progress.completed}
        </AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          {t('dashboard.remaining')}: {progress.remaining}
        </AppText>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(100, Math.max(0, progress.percent))}%` }]} />
      </View>
      <TouchableOpacity style={styles.cta} onPress={onContinue} activeOpacity={0.85}>
        <AppText variant="button" color="#FFFFFF">
          {t('dashboard.continueAssessment')}
        </AppText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 18,
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  value: {
    fontFamily: fontFamily('800'),
    fontSize: 40,
    lineHeight: 48,
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  counts: {
    flexDirection: 'row',
    gap: 14,
  },
  track: {
    height: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
    marginTop: 4,
  },
  fill: {
    height: '100%',
    backgroundColor: '#111827',
    borderRadius: 8,
  },
  cta: {
    marginTop: 8,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
