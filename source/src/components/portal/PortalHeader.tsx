import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bell } from 'lucide-react-native';
import { portalStyles } from '../../theme/portalStyles';
import { colors } from '../../theme/colors';

type Props = {
  greeting: string;
  title: string;
  onNotifications?: () => void;
  badgeCount?: number;
  leading?: React.ReactNode;
};

export default function PortalHeader({
  greeting,
  title,
  onNotifications,
  badgeCount = 0,
  leading,
}: Props) {
  return (
    <View style={portalStyles.topBar}>
      {leading ?? (
        <View style={styles.greetingCol}>
          <Text style={portalStyles.greetingText}>{greeting}</Text>
          <Text style={portalStyles.nameText} numberOfLines={1}>
            {title}
          </Text>
        </View>
      )}

      {onNotifications ? (
        <TouchableOpacity style={portalStyles.bellBtn} onPress={onNotifications} activeOpacity={0.8}>
          <Bell size={20} color={colors.textPrimary} />
          {badgeCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badgeCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  greetingCol: {
    flex: 1,
    flexDirection: 'column',
  },
  spacer: {
    width: 40,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
