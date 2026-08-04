import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Bell, Settings, User } from 'lucide-react-native';
import AppText from '../ui/AppText';
import { colors, layout } from '../../theme';
import type { AthleteProfile } from '../../types/athleteDashboard';

type Props = {
  profile: AthleteProfile;
  onNotifications?: () => void;
  onSettings?: () => void;
};

export default function DashboardHeader({ profile, onNotifications, onSettings }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={styles.avatar}>
          {profile.photoUrl ? (
            <Image source={{ uri: profile.photoUrl }} style={styles.photo} />
          ) : (
            <User size={22} color={colors.textPrimary} />
          )}
        </View>
        <View style={styles.meta}>
          <AppText variant="h3" numberOfLines={1} style={styles.name}>
            {profile.name}
          </AppText>
          <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
            {profile.athleteId}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary} numberOfLines={2}>
            {profile.age} yrs · {profile.gender} · {profile.institution}
          </AppText>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconBtn} onPress={onNotifications} activeOpacity={0.8}>
          <Bell size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={onSettings} activeOpacity={0.8}>
          <Settings size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  meta: { flex: 1, gap: 2 },
  name: { letterSpacing: -0.3 },
  actions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
