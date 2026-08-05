import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from '../ui/AppText';
import DonutChart from './DonutChart';
import { colors, layout } from '../../theme';
import { portalStyles } from '../../theme/portalStyles';
import { t } from '../../utils/i18n';
import type { ProgressInfo } from '../../types/athleteDashboard';

type Props = {
  progress: ProgressInfo;
};

export default function ProgressCard({ progress }: Props) {
  return (
    <View style={[portalStyles.card, styles.card]}>
      <AppText variant="caption" color={colors.textSecondary} style={styles.cardTitle}>
        {t('dashboard.overallProgress')}
      </AppText>

      <View style={styles.chartContentRow}>
        <DonutChart
          percent={progress.percent}
          completed={progress.completed}
          remaining={progress.remaining}
          total={progress.completed + progress.remaining}
          size={108}
          strokeWidth={14}
        />

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <View style={[styles.statDot, { backgroundColor: colors.success }]} />
            <View style={styles.statTextRow}>
              <AppText variant="caption" color={colors.textSecondary} style={styles.statLabel}>
                {t('dashboard.completed')}
              </AppText>
              <AppText variant="h3" style={styles.statValue}>
                {progress.completed}
              </AppText>
            </View>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statDot, { backgroundColor: colors.primary }]} />
            <View style={styles.statTextRow}>
              <AppText variant="caption" color={colors.textSecondary} style={styles.statLabel}>
                {t('dashboard.remaining')}
              </AppText>
              <AppText variant="h3" style={styles.statValue}>
                {progress.remaining}
              </AppText>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  chartContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: 16,
  },
  statsContainer: {
    flex: 1,
    gap: 10,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: layout.radiusMd,
  },
  statDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
