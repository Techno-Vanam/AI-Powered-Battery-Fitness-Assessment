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
  style,
  contentStyle,
  header,
  footer,
  edges = ['top', 'bottom', 'left', 'right'],
}: Props) {
  const inner = scroll ? (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        centered && styles.centered,
        contentStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.contentWrap}>{children}</View>
    </ScrollView>
  ) : (
    <View style={[styles.staticContent, centered && styles.centered, contentStyle]}>
      <View style={styles.contentWrap}>{children}</View>
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
  centered: {
    justifyContent: 'center',
  },
  contentWrap: {
    flex: 1,
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
  },
});

export default Screen;
