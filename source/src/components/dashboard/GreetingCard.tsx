import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from '../ui/AppText';
import { colors } from '../../theme';
import { t } from '../../utils/i18n';
import type { GreetingInfo } from '../../types/athleteDashboard';

type Props = {
  name: string;
  greeting: GreetingInfo;
};

function greetingPrefix(): string {
  const hour = new Date().getHours();
  if (hour < 12) return t('dashboard.greeting.morning');
  if (hour < 17) return t('dashboard.greeting.afternoon');
  return t('dashboard.greeting.evening');
}

export default function GreetingCard({ name, greeting }: Props) {
  const prefix = useMemo(() => greetingPrefix(), []);
  const firstName = name.split(' ')[0] || name;

  return (
    <View style={styles.card}>
      <AppText variant="caption" color={colors.textMuted}>
        {t('dashboard.assessmentStatus')}
      </AppText>
      <AppText variant="h2" style={styles.title}>
        {prefix}, {firstName}!
      </AppText>
      <AppText variant="bodySm" color={colors.textSecondary}>
        {t('dashboard.lastAssessment')}:{' '}
        {greeting.lastAssessmentDate
          ? new Date(greeting.lastAssessmentDate).toLocaleDateString()
          : '—'}
      </AppText>
      <View style={styles.pill}>
        <AppText variant="caption" color={colors.textPrimary}>
          {greeting.statusLabel ||
            `${greeting.completedTests}/${greeting.totalTests} Tests Completed`}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 6,
  },
  title: {
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  pill: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
