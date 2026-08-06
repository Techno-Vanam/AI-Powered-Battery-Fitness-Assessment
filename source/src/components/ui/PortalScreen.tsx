import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';

type Props = {
  children: React.ReactNode;
  /** Default: top + horizontal; omit bottom when a tab bar handles gesture insets. */
  edges?: Edge[];
  style?: ViewStyle;
};

export function PortalScreen({
  children,
  edges = ['top', 'left', 'right'],
  style,
}: Props) {
  return (
    <SafeAreaView style={[styles.screen, style]} edges={edges}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default PortalScreen;
