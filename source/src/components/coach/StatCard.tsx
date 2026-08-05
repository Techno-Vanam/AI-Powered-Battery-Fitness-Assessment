import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  accentColor?: string;
  backgroundColor?: string;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accentColor = '#7C3AED',
  backgroundColor = '#FFFFFF',
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: `${accentColor}15` }]}>
          {icon}
        </View>
        <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
      </View>

      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 144,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginRight: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
});
