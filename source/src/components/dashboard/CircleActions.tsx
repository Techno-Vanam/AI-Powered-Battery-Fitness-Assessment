import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ClipboardList, History, Play, FileText } from 'lucide-react-native';
import AppText from '../ui/AppText';
import { colors, layout } from '../../theme';

type Props = {
  onStart: () => void;
  onContinue: () => void;
  onHistory: () => void;
  onReport: () => void;
};

const ACTIONS = [
  { key: 'start', label: 'Start', Icon: Play },
  { key: 'continue', label: 'Continue', Icon: ClipboardList },
  { key: 'history', label: 'History', Icon: History },
  { key: 'report', label: 'Report', Icon: FileText },
] as const;

export default function CircleActions({
  onStart,
  onContinue,
  onHistory,
  onReport,
}: Props) {
  const handlers = {
    start: onStart,
    continue: onContinue,
    history: onHistory,
    report: onReport,
  };

  return (
    <View style={styles.row}>
      {ACTIONS.map(({ key, label, Icon }) => (
        <TouchableOpacity
          key={key}
          style={styles.item}
          onPress={handlers[key]}
          activeOpacity={0.75}
        >
          <View style={styles.circle}>
            <Icon size={22} color={colors.textPrimary} strokeWidth={2} />
          </View>
          <AppText variant="caption" color={colors.textLabel}>
            {label}
          </AppText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  item: {
    alignItems: 'center',
    gap: 8,
    width: '22%',
  },
  circle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
});
