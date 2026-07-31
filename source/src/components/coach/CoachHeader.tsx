import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Bell, Settings, Wifi, WifiOff, User } from 'lucide-react-native';

interface CoachHeaderProps {
  coachName: string;
  institutionName: string;
  isOnline: boolean;
  unreadNotifications?: number;
  onPressNotifications?: () => void;
  onPressSettings?: () => void;
  avatarUrl?: string;
}

export const CoachHeader: React.FC<CoachHeaderProps> = ({
  coachName,
  institutionName,
  isOnline,
  unreadNotifications = 3,
  onPressNotifications,
  onPressSettings,
  avatarUrl,
}) => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User size={24} color="#7C3AED" />
            </View>
          )}
          <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10B981' : '#EF4444' }]} />
        </View>

        <View style={styles.textColumn}>
          <View style={styles.nameRow}>
            <Text style={styles.coachName} numberOfLines={1}>{coachName}</Text>
            <View style={[styles.badge, { backgroundColor: isOnline ? '#ECFDF5' : '#FEF2F2' }]}>
              {isOnline ? (
                <Wifi size={12} color="#10B981" />
              ) : (
                <WifiOff size={12} color="#EF4444" />
              )}
              <Text style={[styles.badgeText, { color: isOnline ? '#10B981' : '#EF4444' }]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
          <Text style={styles.institution} numberOfLines={1}>{institutionName} • {today}</Text>
        </View>
      </View>

      <View style={styles.rightActions}>
        <TouchableOpacity style={styles.iconBtn} onPress={onPressNotifications} activeOpacity={0.7}>
          <Bell size={20} color="#334155" />
          {unreadNotifications > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadNotifications}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={onPressSettings} activeOpacity={0.7}>
          <Settings size={20} color="#334155" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  textColumn: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coachName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  institution: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
