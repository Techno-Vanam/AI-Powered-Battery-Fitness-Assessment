import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import AppText from '../ui/AppText';
import { colors, layout } from '../../theme';

interface Props {
  visible: boolean;
}

const OfflineBadge: React.FC<Props> = ({ visible }) => {
  if (!visible) return null;
  return (
    <View style={styles.badge}>
      <WifiOff size={layout.iconSm - 6} color={colors.warning} />
      <AppText variant="caption" color={colors.warning}>
        Offline mode
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBorder,
    borderWidth: 1,
    paddingHorizontal: layout.fieldGap + 2,
    paddingVertical: 4,
    borderRadius: layout.radiusXl,
    alignSelf: 'flex-start',
  },
});

export default OfflineBadge;
