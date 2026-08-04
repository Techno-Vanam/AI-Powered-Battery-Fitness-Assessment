import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import AppText from '../ui/AppText';
import { colors } from '../../theme';

type Props = {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
};

/** Premium circular action (reference style) */
export default function QuickActionButton({ label, icon, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.circle}>{icon}</View>
      <AppText variant="caption" color={colors.textLabel} numberOfLines={2} style={styles.label}>
        {label}
      </AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    width: '18%',
    alignItems: 'center',
    gap: 8,
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  label: {
    textAlign: 'center',
    fontSize: 11,
  },
});
