import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Activity, CheckCircle2, Clock3 } from 'lucide-react-native';
import AppText from '../ui/AppText';
import { colors, layout } from '../../theme';
import { fontFamily } from '../../theme/fonts';
import type { HistoryItem, LatestResultInfo } from '../../types/athleteDashboard';

type Props = {
  latestResult: LatestResultInfo;
  history: HistoryItem[];
  onSeeAll?: () => void;
  onOpen?: (id: string) => void;
};

export default function LatestActivityList({
  latestResult,
  history,
  onSeeAll,
  onOpen,
}: Props) {
  const rows: {
    id: string;
    title: string;
    subtitle: string;
    value: string;
    tone: 'done' | 'pending' | 'progress';
  }[] = [];

  if (latestResult) {
    rows.push({
      id: 'latest',
      title: latestResult.testName,
      subtitle: `${latestResult.minutesAgo} min ago`,
      value: latestResult.score,
      tone: 'done',
    });
  }

  history.slice(0, 4).forEach(item => {
    rows.push({
      id: item.id,
      title: item.label,
      subtitle: new Date(item.date).toLocaleDateString(),
      value: item.status === 'completed' ? 'Done' : item.status === 'in_progress' ? 'Active' : 'Open',
      tone:
        item.status === 'completed'
          ? 'done'
          : item.status === 'in_progress'
            ? 'progress'
            : 'pending',
    });
  });

  return (
    <View>
      <View style={styles.header}>
        <AppText variant="h3">Latest activity</AppText>
        <TouchableOpacity onPress={onSeeAll} hitSlop={8}>
          <AppText variant="caption" color={colors.athlete.primary}>
            See all
          </AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {rows.map(row => (
          <TouchableOpacity
            key={row.id}
            style={styles.row}
            activeOpacity={0.8}
            onPress={() => onOpen?.(row.id)}
          >
            <View
              style={[
                styles.icon,
                row.tone === 'done' && styles.iconDone,
                row.tone === 'progress' && styles.iconProgress,
              ]}
            >
              {row.tone === 'done' ? (
                <CheckCircle2 size={18} color={colors.success} />
              ) : row.tone === 'progress' ? (
                <Clock3 size={18} color={colors.warning} />
              ) : (
                <Activity size={18} color={colors.textMuted} />
              )}
            </View>
            <View style={styles.meta}>
              <AppText variant="bodySm" numberOfLines={1}>
                {row.title}
              </AppText>
              <AppText variant="caption" color={colors.textMuted}>
                {row.subtitle}
              </AppText>
            </View>
            <AppText style={styles.value} color={colors.textPrimary}>
              {row.value}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: layout.fieldGap + 2,
  },
  list: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDone: { backgroundColor: colors.successBg },
  iconProgress: { backgroundColor: colors.warningBg },
  meta: { flex: 1, gap: 2 },
  value: {
    fontFamily: fontFamily('700'),
    fontSize: 14,
  },
});
