import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import AppText from '../ui/AppText';
import SectionTitle from './SectionTitle';
import { colors } from '../../theme';
import { t } from '../../utils/i18n';
import type { HistoryItem } from '../../types/athleteDashboard';

type Props = {
  history: HistoryItem[];
  onView: (item: HistoryItem) => void;
};

export default function AssessmentHistoryList({ history, onView }: Props) {
  return (
    <View>
      <SectionTitle title={t('dashboard.assessmentHistory')} />
      <View style={styles.list}>
        {history.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.row, index === history.length - 1 && styles.rowLast]}
            onPress={() => onView(item)}
            activeOpacity={0.75}
          >
            <View style={styles.dot} />
            <View style={styles.meta}>
              <AppText variant="body">{item.label}</AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                {new Date(item.date).toLocaleDateString()} · {item.status.replace('_', ' ')}
              </AppText>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
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
});
