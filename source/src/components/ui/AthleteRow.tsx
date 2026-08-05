import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Athlete } from '../../types/app';
import { StatusBadge } from './StatusBadge';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';

interface AthleteRowProps {
  athlete: Athlete;
  onPress: () => void;
}

export const AthleteRow: React.FC<AthleteRowProps> = ({ athlete, onPress }) => {
  const completionText = `${athlete.testsCompleted}/10 Tests Completed`;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.container, layout.shadowSubtle]}
      onPress={onPress}
    >
      <View style={styles.avatarCircle}>
        <Text style={styles.initialsText}>{athlete.initials}</Text>
      </View>

      <View style={styles.infoCol}>
        <Text style={styles.nameText} numberOfLines={1}>{athlete.name}</Text>
        <Text style={styles.subText} numberOfLines={1}>
          {athlete.school} · Age {athlete.age}
        </Text>
      </View>

      <View style={styles.rightCol}>
        <Text style={styles.completionText}>{completionText}</Text>
        <View style={styles.badgeWrapper}>
          <StatusBadge status={athlete.status} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  initialsText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  infoCol: {
    flex: 1,
    marginRight: 8,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  subText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  completionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  badgeWrapper: {
    alignItems: 'flex-end',
  },
});
