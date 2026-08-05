import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bell, User } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import type { AthleteProfile } from '../../types/athleteDashboard';

type Props = {
  profile: AthleteProfile;
  onProfilePress?: () => void;
  onNotifications?: () => void;
};

export default function DashboardHeader({ profile, onProfilePress, onNotifications }: Props) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning 👋';
    if (hour < 17) return 'Good Afternoon 👋';
    return 'Good Evening 👋';
  };

  return (
    <View style={styles.topBar}>
      <TouchableOpacity
        style={styles.greetingCol}
        onPress={onProfilePress}
        activeOpacity={0.85}
      >
        <View style={styles.avatar}>
          {profile.photoUrl ? (
            <Image source={{ uri: profile.photoUrl }} style={styles.photo} />
          ) : (
            <User size={22} color={colors.primary} />
          )}
        </View>
        <View style={styles.nameBox}>
          <Text style={styles.greetingText}>{getGreeting()}</Text>
          <Text style={styles.nameText} numberOfLines={1}>
            {profile.name}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.bellBtn} onPress={onNotifications} activeOpacity={0.8}>
        <Bell size={20} color={colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: 8,
  },
  greetingCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  nameBox: {
    flex: 1,
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
    marginBottom: 1,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
