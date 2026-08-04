import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  Activity, ArrowUp, Circle, MoveHorizontal, Ruler, Scale,
  Timer, Zap, RefreshCw,
} from 'lucide-react-native';
import AppText from '../ui/AppText';
import { colors } from '../../theme';
import { t } from '../../utils/i18n';
import type { DashboardTest } from '../../types/athleteDashboard';

type Props = {
  test: DashboardTest;
  onPress: () => void;
};

function TestIcon({ name }: { name: string }) {
  const color = colors.textPrimary;
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
  if (status === 'in_progress') return '#F59E0B';
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
    <View style={styles.card}>
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
        style={[styles.cta, done && styles.ctaSecondary]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <AppText variant="button" color={done ? colors.textPrimary : '#FFFFFF'}>
          {cta}
        </AppText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 14,
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 2 },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cta: {
    height: 44,
    borderRadius: 22,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
});
