import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface PrimaryActionButtonProps {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  badgeCount?: number;
  primary?: boolean;
  color?: string;
}

export const PrimaryActionButton: React.FC<PrimaryActionButtonProps> = ({
  label,
  icon,
  onPress,
  badgeCount,
  primary = false,
  color = '#7C3AED',
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        primary ? { backgroundColor: color, borderColor: color } : styles.secondaryButton,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        {icon}
        {badgeCount !== undefined && badgeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeCount}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.label, primary ? styles.primaryLabel : styles.secondaryLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minWidth: '30%',
    aspectRatio: 1.25,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  primaryLabel: {
    color: '#FFFFFF',
  },
  secondaryLabel: {
    color: '#1E293B',
  },
});
