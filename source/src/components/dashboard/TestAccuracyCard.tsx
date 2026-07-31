import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from '../ui/AppText';
import SectionTitle from './SectionTitle';
import { colors } from '../../theme';
import { t } from '../../utils/i18n';
import type { AccuracyItem } from '../../types/athleteDashboard';

type Props = {
  overall: number;
  items: AccuracyItem[];
};

export default function TestAccuracyCard({ overall, items }: Props) {
  return (
    <View style={styles.card}>
      <SectionTitle
        title={t('dashboard.testAccuracy')}
        subtitle={`${t('dashboard.overallAccuracy')}: ${overall}%`}
      />
      <View style={styles.list}>
        {items.map(item => (
          <View key={item.category} style={styles.row}>
            <AppText variant="bodySm" color={colors.textLabel} style={styles.label}>
              {item.category}
            </AppText>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${item.confidence}%` }]} />
            </View>
            <AppText variant="caption" color={colors.textSecondary} style={styles.pct}>
              {item.confidence}%
            </AppText>
          </View>
        ))}
      </View>
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
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  list: { gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: { width: 96 },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#111827',
    borderRadius: 8,
  },
  pct: { width: 36, textAlign: 'right' },
});
