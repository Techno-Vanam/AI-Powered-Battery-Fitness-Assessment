import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { colors, layout } from '../../theme';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  centered?: boolean;
  keyboard?: boolean;
  /** Skip max-width / side padding so content can use the full screen width */
  fullWidth?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  edges?: Edge[];
};

export function Screen({
  children,
  scroll = false,
  centered = false,
  keyboard = false,
  fullWidth = false,
  style,
  contentStyle,
  header,
  footer,
  edges = ['top', 'bottom', 'left', 'right'],
}: Props) {
  const wrapStyle = fullWidth ? styles.contentWrapFull : styles.contentWrap;

  const inner = scroll ? (
    <ScrollView
      contentContainerStyle={[
        fullWidth ? styles.scrollContentFull : styles.scrollContent,
        centered && styles.centered,
        contentStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={wrapStyle}>{children}</View>
    </ScrollView>
  ) : (
    <View
      style={[
        fullWidth ? styles.staticContentFull : styles.staticContent,
        centered && styles.centered,
        contentStyle,
      ]}
    >
      <View style={wrapStyle}>{children}</View>
    </View>
  );

  const body = keyboard ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      {inner}
    </KeyboardAvoidingView>
  ) : (
    inner
  );

  return (
    <SafeAreaView style={[styles.safeArea, style]} edges={edges}>
      {header}
      <View style={styles.flex}>{body}</View>
      {footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: layout.horizontalPadding,
    paddingBottom: layout.verticalPadding + layout.sectionGap / 2,
    paddingTop: layout.verticalPadding,
  },
  staticContent: {
    flex: 1,
    paddingHorizontal: layout.horizontalPadding,
    paddingVertical: layout.verticalPadding,
  },
  staticContentFull: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  scrollContentFull: {
    flexGrow: 1,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  centered: {
    justifyContent: 'center',
  },
  contentWrap: {
    flex: 1,
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
  },
  contentWrapFull: {
    flex: 1,
    width: '100%',
    alignSelf: 'stretch',
  },
});

export default Screen;
