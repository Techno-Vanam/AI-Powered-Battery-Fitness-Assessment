import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import AppText from '../ui/AppText';
import { colors } from '../../theme';
import { t } from '../../utils/i18n';
import type { AiInsightsInfo } from '../../types/athleteDashboard';

type Props = { aiInsights: AiInsightsInfo };

export default function AiInsightsCard({ aiInsights }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <View style={styles.icon}>
          <Sparkles size={16} color="#FFFFFF" />
        </View>
        <AppText variant="h3">{t('dashboard.aiInsights')}</AppText>
      </View>
      <AppText variant="bodySm" color={colors.textLabel}>
        {aiInsights.summary}
      </AppText>
      <AppText variant="caption" color={colors.textSecondary}>
        {t('dashboard.overallAccuracy')}: {aiInsights.overallConfidence}%
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
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
