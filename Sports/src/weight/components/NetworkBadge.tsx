import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface NetworkBadgeProps {
  isOnline: boolean;
  onToggleSimulated?: () => void;
}

export const NetworkBadge: React.FC<NetworkBadgeProps> = ({ isOnline, onToggleSimulated }) => {
  return (
    <TouchableOpacity
      activeOpacity={onToggleSimulated ? 0.7 : 1}
      onPress={onToggleSimulated}
      style={[styles.badge, isOnline ? styles.onlineBadge : styles.offlineBadge]}
    >
      <View style={[styles.dot, isOnline ? styles.onlineDot : styles.offlineDot]} />
      <Text style={styles.badgeText}>
        {isOnline ? 'Online (MySQL Sync Ready)' : 'Offline (SQLite Cache Active)'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
    marginVertical: 8
  },
  onlineBadge: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
    borderWidth: 1
  },
  offlineBadge: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
    borderWidth: 1
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8
  },
  onlineDot: {
    backgroundColor: '#2E7D32'
  },
  offlineDot: {
    backgroundColor: '#C62828'
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333'
  }
});
