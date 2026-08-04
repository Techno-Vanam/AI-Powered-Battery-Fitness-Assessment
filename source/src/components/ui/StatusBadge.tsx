import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AssessmentStatus } from '../../types/app';
import { colors } from '../../theme/colors';

interface StatusBadgeProps {
  status: AssessmentStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let badgeBg = colors.primaryLight;
  let textColor = colors.primary;

  if (status === 'Completed' || status === 'Assessed') {
    badgeBg = colors.successBg;
    textColor = colors.success;
  } else if (status === 'Pending') {
    badgeBg = colors.warningBg;
    textColor = colors.warning;
  } else if (status === 'In Progress' || status === 'Active') {
    badgeBg = colors.primaryLight;
    textColor = colors.primary;
  }

  return (
    <View style={[styles.badge, { backgroundColor: badgeBg }]}>
      <Text style={[styles.text, { color: textColor }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
