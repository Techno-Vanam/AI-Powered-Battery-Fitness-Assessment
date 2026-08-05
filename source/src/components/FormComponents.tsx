import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TextInputProps,
} from 'react-native';

// ─── Header Component ────────────────────────────────────────────────────────
interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, onBack, rightElement }: HeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        {onBack ? (
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <Text style={styles.headerTitle}>{title}</Text>
        {rightElement ? rightElement : <View style={styles.backPlaceholder} />}
      </View>
      {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
    </View>
  );
}

// ─── Input Field Component ──────────────────────────────────────────────────
interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: string;
  isRequired?: boolean;
}

export function InputField({
  label,
  error,
  icon,
  isRequired,
  style,
  editable = true,
  ...props
}: InputFieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <View style={styles.labelRow}>
        <Text style={styles.fieldLabel}>
          {label} {isRequired && <Text style={styles.requiredStar}>*</Text>}
        </Text>
      </View>
      <View
        style={[
          styles.inputWrapper,
          error ? styles.inputWrapperError : null,
          !editable ? styles.inputWrapperDisabled : null,
        ]}
      >
        {icon && <Text style={styles.inputIcon}>{icon}</Text>}
        <TextInput
          style={[styles.input, !editable ? styles.inputDisabled : null, style]}
          placeholderTextColor="#4b5563"
          editable={editable}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>⚠️ {error}</Text>}
    </View>
  );
}

// ─── Select Picker Modal Component ──────────────────────────────────────────
interface SelectPickerProps {
  label: string;
  value: string;
  options: readonly string[] | string[];
  onSelect: (val: string) => void;
  error?: string;
  icon?: string;
  placeholder?: string;
  isRequired?: boolean;
}

export function SelectPicker({
  label,
  value,
  options,
  onSelect,
  error,
  icon,
  placeholder = 'Select option',
  isRequired,
}: SelectPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label} {isRequired && <Text style={styles.requiredStar}>*</Text>}
      </Text>
      <TouchableOpacity
        style={[styles.inputWrapper, error ? styles.inputWrapperError : null]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        {icon && <Text style={styles.inputIcon}>{icon}</Text>}
        <Text style={[styles.selectText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <Text style={styles.chevronIcon}>▼</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>⚠️ {error}</Text>}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCloseBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={options as string[]}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    item === value && styles.optionItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(item);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item === value && styles.optionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {item === value && <Text style={styles.checkIcon}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Filter Chip Component ────────────────────────────────────────────────────
interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  count?: number;
}

export function FilterChip({ label, selected, onPress, count }: FilterChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
      {count !== undefined && (
        <View style={[styles.countBadge, selected && styles.countBadgeSelected]}>
          <Text style={[styles.countText, selected && styles.countTextSelected]}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Status Badge Component ──────────────────────────────────────────────────
interface StatusBadgeProps {
  status: 'pending' | 'uploading' | 'uploaded' | 'failed' | 'retrying' | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getBadgeConfig = () => {
    switch (status.toLowerCase()) {
      case 'uploaded':
      case 'synced':
        return { label: 'Synced', color: '#22c55e', bg: '#064e3b' };
      case 'uploading':
      case 'syncing':
        return { label: 'Syncing', color: '#60a5fa', bg: '#1e3a8a' };
      case 'failed':
        return { label: 'Failed', color: '#f87171', bg: '#7f1d1d' };
      case 'retrying':
        return { label: 'Retrying', color: '#c084fc', bg: '#581c87' };
      default:
        return { label: 'Pending Sync', color: '#fbbf24', bg: '#78350f' };
    }
  };

  const config = getBadgeConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.badgeText, { color: config.color }]}>
        ● {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: 12,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  backPlaceholder: {
    width: 38,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  fieldLabel: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  requiredStar: {
    color: '#ef4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 14,
    height: 50,
  },
  inputWrapperError: {
    borderColor: '#ef4444',
    backgroundColor: '#2d1517',
  },
  inputWrapperDisabled: {
    backgroundColor: '#111827',
    borderColor: '#1f2937',
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
  },
  inputDisabled: {
    color: '#9ca3af',
  },
  selectText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
  },
  placeholderText: {
    color: '#4b5563',
  },
  chevronIcon: {
    color: '#6b7280',
    fontSize: 12,
  },
  errorText: {
    color: '#f87171',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 12,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  modalCloseBtn: {
    color: '#9ca3af',
    fontSize: 18,
    fontWeight: '600',
    padding: 4,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  optionItemSelected: {
    backgroundColor: '#1e3a8a',
  },
  optionText: {
    color: '#d1d5db',
    fontSize: 15,
  },
  optionTextSelected: {
    color: '#60a5fa',
    fontWeight: '700',
  },
  checkIcon: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: '800',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#3b82f6',
  },
  chipText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: '#374151',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  countBadgeSelected: {
    backgroundColor: '#1d4ed8',
  },
  countText: {
    color: '#d1d5db',
    fontSize: 11,
    fontWeight: '700',
  },
  countTextSelected: {
    color: '#ffffff',
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
