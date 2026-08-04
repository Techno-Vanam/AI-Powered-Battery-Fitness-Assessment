import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import SFSymbol from '../ui/SFSymbol';
import AppText from '../ui/AppText';
import { colors } from '../../theme';
import { t } from '../../utils/i18n';
import type { HistoryItem } from '../../types/athleteDashboard';

type Props = {
  history: HistoryItem[];
  onView: (item: HistoryItem) => void;
  onViewAll?: () => void;
  showAll?: boolean;
  hideHeader?: boolean;
};

export default function AssessmentHistoryList({
  history,
  onView,
  onViewAll,
  showAll = false,
  hideHeader = false,
}: Props) {
  const visibleHistory = showAll ? history : history.slice(0, 2);

  return (
    <View style={styles.container}>
      {!hideHeader && (
        <View style={styles.headerRow}>
          <AppText variant="h3" style={styles.title}>
            {t('dashboard.assessmentHistory')}
          </AppText>
          {onViewAll && !showAll && (
            <TouchableOpacity style={styles.viewBtn} onPress={onViewAll} activeOpacity={0.7}>
              <AppText variant="caption" color="#4F46E5" style={styles.viewBtnText}>
                View All
              </AppText>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.list}>
        {visibleHistory.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.row, index === visibleHistory.length - 1 && styles.rowLast]}
            onPress={() => onView(item)}
            activeOpacity={0.75}
          >
            <View style={styles.dot} />
            <View style={styles.meta}>
              <AppText variant="body" style={styles.itemLabel}>{item.label}</AppText>
              <AppText variant="caption" color={colors.textSecondary} style={styles.itemSub}>
                {new Date(item.date).toLocaleDateString()} · {item.status.replace('_', ' ')}
              </AppText>
            </View>
            <SFSymbol name="chevron.right" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  viewBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
  },
  viewBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60,60,67,0.18)',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#111827',
  },
  meta: { flex: 1, gap: 2 },
  itemLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemSub: {
    fontSize: 12,
  },
});
