import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { Edge, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { bottomInsetPadding, colors, layout } from '../../theme';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  centered?: boolean;
  keyboard?: boolean;
  /** Expand content to fill the viewport inside safe area (100vh-style). */
  fill?: boolean;
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
  fill = false,
  fullWidth = false,
  style,
  contentStyle,
  header,
  footer,
  edges = ['top', 'bottom', 'left', 'right'],
}: Props) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const wrapStyle = fullWidth ? styles.contentWrapFull : styles.contentWrap;
  const footerInset = edges.includes('bottom') ? 0 : bottomInsetPadding(insets.bottom);

  const insetTop = edges.includes('top') ? insets.top : 0;
  const insetBottom = edges.includes('bottom') ? insets.bottom : 0;
  const fillMinHeight = fill ? Math.max(windowHeight - insetTop - insetBottom, 0) : undefined;

  const scrollContentStyle = [
    fullWidth ? styles.scrollContentFull : styles.scrollContent,
    fill && fillMinHeight != null ? { minHeight: fillMinHeight } : null,
    centered && styles.centered,
    contentStyle,
  ];

  const staticContentStyle = [
    fullWidth ? styles.staticContentFull : styles.staticContent,
    fill && styles.fillStatic,
    centered && styles.centered,
    contentStyle,
  ];

  const inner = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={scrollContentStyle}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={[wrapStyle, fill && styles.fillWrap]}>{children}</View>
    </ScrollView>
  ) : (
    <View style={staticContentStyle}>
      <View style={[wrapStyle, fill && styles.fillWrap]}>{children}</View>
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
      {footer ? <View style={{ paddingBottom: footerInset }}>{footer}</View> : null}
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
    flexGrow: 1,
    justifyContent: 'center',
  },
  fillStatic: {
    flex: 1,
  },
  fillWrap: {
    flexGrow: 1,
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
