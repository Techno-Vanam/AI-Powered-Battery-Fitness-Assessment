import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bell, User } from 'lucide-react-native';
import { portalStyles } from '../../theme/portalStyles';
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
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={portalStyles.topBar}>
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
          <Text style={portalStyles.greetingText}>{getGreeting()}</Text>
          <Text style={portalStyles.nameText} numberOfLines={1}>
            {profile.name}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={portalStyles.bellBtn} onPress={onNotifications} activeOpacity={0.8}>
        <Bell size={20} color={colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
    borderWidth: 1,
    borderColor: colors.warningBorder,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  nameBox: {
    flex: 1,
    justifyContent: 'center',
  },
});
