import React, { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import SFSymbol from './SFSymbol';
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
        <SFSymbol name="chevron.down" size={compact ? 16 : 18} color={colors.textMuted} />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setOpen(false)}
          />
          <View style={styles.dialogBox}>
            <View style={styles.dialogHeader}>
              <AppText variant="h3" style={styles.dialogTitle}>
                {title}
              </AppText>
              <TouchableOpacity
                onPress={() => setOpen(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.closeBtn}
              >
                <SFSymbol name="xmark" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

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
                      <SFSymbol name="checkmark" size={18} color={accent.primary} strokeWidth={2.5} />
                    ) : (
                      <View style={styles.checkSpacer} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.overlay,
    paddingHorizontal: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  dialogBox: {
    width: '90%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: layout.radiusLg,
    paddingVertical: 16,
    paddingHorizontal: 16,
    maxHeight: '65%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  dialogTitle: {
    fontSize: 16,
    fontFamily: fontFamily('600'),
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  list: {
    maxHeight: 280,
  },
  listContent: {
    gap: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 46,
    paddingHorizontal: 12,
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
