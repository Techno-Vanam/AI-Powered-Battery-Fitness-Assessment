import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import SFSymbol from '../ui/SFSymbol';
import AppText from '../ui/AppText';
import { colors } from '../../theme';
import type { AthleteProfile } from '../../types/athleteDashboard';

type Props = {
  profile: AthleteProfile;
  onProfilePress?: () => void;
  onNotifications?: () => void;
};

export default function DashboardHeader({ profile, onProfilePress, onNotifications }: Props) {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.left}
        onPress={onProfilePress}
        activeOpacity={0.8}
      >
        <View style={styles.avatar}>
          {profile.photoUrl ? (
            <Image source={{ uri: profile.photoUrl }} style={styles.photo} />
          ) : (
            <SFSymbol name="person.crop.circle" size={24} color={colors.textPrimary} />
          )}
        </View>
        <AppText variant="h3" numberOfLines={1} style={styles.name}>
          {profile.name}
        </AppText>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconBtn} onPress={onNotifications} activeOpacity={0.8}>
          <SFSymbol name="bell.fill" size={20} color={colors.textPrimary} />
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
    paddingVertical: 4,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
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
