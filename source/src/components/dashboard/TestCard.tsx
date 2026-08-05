import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  Activity, ArrowUp, Circle, MoveHorizontal, Ruler, Scale,
  Timer, Zap, RefreshCw,
} from 'lucide-react-native';
import AppText from '../ui/AppText';
import { colors } from '../../theme';
import { portalStyles } from '../../theme/portalStyles';
import { t } from '../../utils/i18n';
import type { DashboardTest } from '../../types/athleteDashboard';

type Props = {
  test: DashboardTest;
  onPress: () => void;
};

function TestIcon({ name }: { name: string }) {
  const color = colors.primary;
  const size = 18;
  switch (name) {
    case 'ruler':
      return <Ruler size={size} color={color} />;
    case 'scale':
      return <Scale size={size} color={color} />;
    case 'stretch':
      return <Activity size={size} color={color} />;
    case 'arrow-up':
      return <ArrowUp size={size} color={color} />;
    case 'move':
      return <MoveHorizontal size={size} color={color} />;
    case 'circle':
      return <Circle size={size} color={color} />;
    case 'zap':
      return <Zap size={size} color={color} />;
    case 'repeat':
      return <RefreshCw size={size} color={color} />;
    case 'timer':
      return <Timer size={size} color={color} />;
    default:
      return <Activity size={size} color={color} />;
  }
}

function statusColor(status: DashboardTest['status']) {
  if (status === 'completed') return colors.success;
  if (status === 'in_progress') return colors.primary;
  return colors.textMuted;
}

export default function TestCard({ test, onPress }: Props) {
  const done = test.status === 'completed';
  const cta = done
    ? t('dashboard.view')
    : test.status === 'in_progress'
      ? t('dashboard.continue')
      : t('dashboard.start');

  return (
    <View style={[portalStyles.card, styles.card]}>
      <View style={styles.top}>
        <View style={styles.iconBox}>
          <TestIcon name={test.icon} />
        </View>
        <View style={styles.info}>
          <AppText variant="body" numberOfLines={1}>
            {test.name}
          </AppText>
          <AppText variant="caption" color={statusColor(test.status)}>
            {test.status === 'completed'
              ? t('dashboard.completed')
              : test.status === 'in_progress'
                ? 'In progress'
                : 'Pending'}
          </AppText>
        </View>
        <AppText variant="h3" color={colors.textPrimary}>
          {test.score ?? '—'}
        </AppText>
      </View>

      <View style={styles.stats}>
        <AppText variant="caption" color={colors.textMuted}>
          {t('dashboard.confidence')}: {test.confidence != null ? `${test.confidence}%` : '—'}
        </AppText>
        <AppText variant="caption" color={colors.textMuted}>
          Attempts: {test.attempts}/{test.maxAttempts}
        </AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {t('dashboard.bestAttempt')}: {test.bestAttempt ?? '—'}
        </AppText>
      </View>

      <TouchableOpacity
        style={[done ? portalStyles.ctaSecondary : portalStyles.ctaPrimary, styles.cta]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Text style={[styles.ctaText, done ? styles.ctaTextSecondary : styles.ctaTextPrimary]}>
          {cta}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 0,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 2 },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  cta: {
    width: '100%',
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
  },
  ctaTextPrimary: {
    color: colors.textInverse,
  },
  ctaTextSecondary: {
    color: colors.primary,
  },
});
