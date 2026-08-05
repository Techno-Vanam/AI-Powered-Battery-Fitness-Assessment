import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface QuickActionButtonProps {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  label,
  icon,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconCircle}>{icon}</View>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: 64,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
});
