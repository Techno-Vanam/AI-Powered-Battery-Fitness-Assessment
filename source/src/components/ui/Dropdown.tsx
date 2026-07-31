import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, layout, Role, roleColors } from '../../theme';
import { fontFamily } from '../../theme/fonts';
import AppText from './AppText';

export type DropdownItem = {
  label: string;
  value: string;
};

type Props = {
  items: DropdownItem[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  title?: string;
  icon?: React.ReactNode;
  hasError?: boolean;
  role?: Role;
  compact?: boolean;
  style?: ViewStyle;
};

export default function Dropdown({
  items,
  value,
  onChange,
  placeholder = 'Select',
  title = 'Select an option',
  icon,
  hasError,
  role = 'athlete',
  compact = false,
  style,
}: Props) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const accent = roleColors(role);

  const selected = useMemo(
    () => items.find(item => item.value === value),
    [items, value],
  );

  const select = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => setOpen(true)}
        style={[
          styles.trigger,
          compact && styles.triggerCompact,
          hasError && styles.triggerError,
          style,
        ]}
      >
        {icon}
        <AppText
          variant="body"
          color={selected ? colors.textPrimary : colors.textMuted}
          style={[styles.triggerText, compact && styles.triggerTextCompact]}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder}
        </AppText>
        <ChevronDown size={compact ? 16 : 18} color={colors.textMuted} />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
            onPress={e => e.stopPropagation()}
          >
            <View style={styles.handle} />
            <AppText variant="h3" style={styles.sheetTitle}>
              {title}
            </AppText>

            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {items.map(item => {
                const active = item.value === value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    activeOpacity={0.7}
                    onPress={() => select(item.value)}
                    style={[
                      styles.option,
                      active && { backgroundColor: accent.light },
                    ]}
                  >
                    <AppText
                      variant="body"
                      color={active ? accent.primary : colors.textPrimary}
                      style={active ? styles.optionTextActive : undefined}
                    >
                      {item.label}
                    </AppText>
                    {active ? (
                      <Check size={18} color={accent.primary} strokeWidth={2.5} />
                    ) : (
                      <View style={styles.checkSpacer} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.fieldGap + 2,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: layout.radiusMd,
    paddingHorizontal: layout.fieldGap + 6,
    height: layout.inputHeight,
  },
  triggerCompact: {
    flex: 1,
    gap: 4,
    paddingHorizontal: layout.fieldGap,
  },
  triggerError: {
    borderColor: colors.errorBorder,
    backgroundColor: colors.errorBg,
  },
  triggerText: {
    flex: 1,
    fontFamily: fontFamily('400'),
    fontSize: layout.inputHeight * 0.29,
  },
  triggerTextCompact: {
    fontSize: layout.inputHeight * 0.26,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: layout.radiusSheet,
    borderTopRightRadius: layout.radiusSheet,
    paddingTop: 10,
    maxHeight: '62%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 14,
  },
  sheetTitle: {
    paddingHorizontal: layout.horizontalPadding,
    marginBottom: 8,
  },
  list: {
    maxHeight: layout.screenHeight * 0.42,
  },
  listContent: {
    paddingHorizontal: layout.horizontalPadding - 4,
    paddingBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: layout.inputHeight - 2,
    paddingHorizontal: layout.fieldGap + 6,
    borderRadius: layout.radiusMd,
  },
  optionTextActive: {
    fontFamily: fontFamily('600'),
  },
  checkSpacer: {
    width: 18,
    height: 18,
  },
});
