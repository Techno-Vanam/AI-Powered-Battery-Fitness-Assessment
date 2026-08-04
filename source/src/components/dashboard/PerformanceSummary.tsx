import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from '../ui/AppText';
import SectionTitle from './SectionTitle';
import { fontFamily } from '../../theme/fonts';
import { t } from '../../utils/i18n';
import type { PerformanceMetric } from '../../types/athleteDashboard';

type Props = { performance: PerformanceMetric[] };

const PALETTE = ['#6C63FF', '#5B9DFF', '#2EC4A6', '#FF8A4C'];

export default function PerformanceSummary({ performance }: Props) {
  return (
    <View>
      <SectionTitle title={t('dashboard.performanceSummary')} />
      <View style={styles.grid}>
        {performance.map((item, index) => {
          const bg = PALETTE[index % PALETTE.length];
          return (
            <View key={item.key} style={[styles.cell, { backgroundColor: bg }]}>
              <AppText variant="caption" color="rgba(255,255,255,0.85)" numberOfLines={1}>
                {item.label}
              </AppText>
              <AppText style={styles.value}>
                {item.value}
                {item.unit ? (
                  <AppText style={styles.unit}> {item.unit}</AppText>
                ) : null}
              </AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cell: {
    flexGrow: 1,
    flexBasis: '46%',
    minWidth: '46%',
    maxWidth: '48%',
    borderRadius: 20,
    padding: 16,
    minHeight: 100,
    justifyContent: 'space-between',
    gap: 8,
  },
  value: {
    fontFamily: fontFamily('800'),
    fontSize: 26,
    lineHeight: 32,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  unit: {
    fontFamily: fontFamily('500'),
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
});
