import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';

interface StatCardProps {
  label: string;
  value: number | string;
  color?: string; // Number text color
  bgColor?: string; // Card background color
  borderColor?: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  color = colors.textPrimary,
  bgColor = colors.surface,
  borderColor = colors.border,
  icon,
  style,
}) => {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: bgColor, borderColor: borderColor },
        layout.shadowSubtle,
        style,
      ]}
    >
      <View style={styles.topRow}>
        <Text style={[styles.number, { color }]}>{value}</Text>
        {icon && <View style={styles.iconBox}>{icon}</View>}
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: layout.cardRadius, // 16px
    borderWidth: 1,
    padding: 16,
    justifyContent: 'space-between',
    minHeight: 100, // Equal height for all 4 cards
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  number: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
