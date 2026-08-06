import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SFSymbol from '../ui/SFSymbol';
import { colors } from '../../theme';
import { portalStyles } from '../../theme/portalStyles';
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
          <Text style={portalStyles.sectionHeader}>{t('dashboard.assessmentHistory')}</Text>
          {onViewAll && !showAll ? (
            <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
              <Text style={portalStyles.viewAllText}>View All</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      <View style={[portalStyles.card, styles.list]}>
        {visibleHistory.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.row, index === visibleHistory.length - 1 && styles.rowLast]}
            onPress={() => onView(item)}
            activeOpacity={0.75}
          >
            <View style={styles.dot} />
            <View style={styles.meta}>
              <Text style={styles.itemLabel}>{item.label}</Text>
              <Text style={styles.itemSub}>
                {new Date(item.date).toLocaleDateString()} · {item.status.replace('_', ' ')}
              </Text>
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
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  list: {
    padding: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  meta: { flex: 1, gap: 2 },
  itemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  itemSub: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
