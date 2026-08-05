import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Switch,
  Modal,
} from 'react-native';
import {
  Edit3,
  Globe,
  Shield,
  Wifi,
  Database,
  Moon,
  Info,
  HelpCircle,
  FileText,
  LogOut,
  Trash2,
  Bell,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import { PillSwitch } from '../../components/ui/PillSwitch';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';

interface SettingsScreenProps {
  onOpenLanguage: () => void;
  onOpenPrivacy: () => void;
  onOpenAbout: () => void;
  onOpenOfflineSync: () => void;
  onSignOut: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onOpenLanguage,
  onOpenPrivacy,
  onOpenAbout,
  onOpenOfflineSync,
  onSignOut,
}) => {
  const {
    coachProfile,
    updateCoachProfile,
    settings,
    updateSettings,
    toggleNotificationPref,
    themeColors,
  } = useApp();
  const t = useTranslation();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState(coachProfile.name);
  const [schoolInput, setSchoolInput] = useState(coachProfile.schoolName);
  const [phoneInput, setPhoneInput] = useState(coachProfile.phone || '');
  const [emailInput, setEmailInput] = useState(coachProfile.email);
  const [designationInput, setDesignationInput] = useState(coachProfile.designation);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const handleSaveProfile = () => {
    updateCoachProfile({
      name: nameInput,
      schoolName: schoolInput,
      phone: phoneInput.trim(),
      email: emailInput,
      designation: designationInput,
      avatarInitials: nameInput
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(n => n[0].toUpperCase())
        .join(''),
    });
    setIsEditingProfile(false);
  };

  const notificationPrefKeys: Array<{ key: string; label: string }> = [
    { key: 'Assessment completed',     label: t('notif_assessment_completed') },
    { key: 'Assessment pending',       label: t('notif_assessment_pending')   },
    { key: 'Offline sync completed',   label: t('notif_offline_sync')         },
    { key: 'Internet restored',        label: t('notif_internet_restored')    },
    { key: 'New athlete added',        label: t('notif_new_athlete')          },
    { key: 'Assessment resumed',       label: t('notif_assessment_resumed')   },
    { key: 'Daily summary',            label: t('notif_daily_summary')        },
    { key: 'Weekly summary',           label: t('notif_weekly_summary')       },
    { key: 'Low storage',              label: t('notif_low_storage')          },
    { key: 'Backup successful',        label: t('notif_backup_successful')    },
  ];

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>{t('settings')}</Text>
        <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditingProfile(!isEditingProfile)}>
          <Edit3 size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Coach Profile Card */}
        <View style={[styles.profileCard, layout.shadowSubtle]}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{coachProfile.avatarInitials || 'RK'}</Text>
          </View>

          {isEditingProfile ? (
            <View style={styles.editForm}>
              <Text style={styles.fieldLabel}>{t('field_name')}</Text>
              <TextInput style={styles.input} value={nameInput} onChangeText={setNameInput} />

              <Text style={styles.fieldLabel}>{t('field_school')}</Text>
              <TextInput style={styles.input} value={schoolInput} onChangeText={setSchoolInput} />

              <Text style={styles.fieldLabel}>{t('field_phone')}</Text>
              <TextInput
                style={styles.input}
                value={phoneInput}
                onChangeText={setPhoneInput}
                placeholder={t('field_phone_placeholder')}
                placeholderTextColor={colors.textTertiary}
              />

              <Text style={styles.fieldLabel}>{t('field_email')}</Text>
              <TextInput style={styles.input} value={emailInput} onChangeText={setEmailInput} />

              <Text style={styles.fieldLabel}>{t('field_designation')}</Text>
              <TextInput style={styles.input} value={designationInput} onChangeText={setDesignationInput} />

              <TouchableOpacity style={styles.saveProfileBtn} onPress={handleSaveProfile}>
                <Text style={styles.saveProfileText}>{t('save_profile')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.profileDetails}>
              <Text style={styles.coachName}>{coachProfile.name}</Text>
              <Text style={styles.designationText}>{coachProfile.designation}</Text>
              <Text style={styles.schoolText}>{coachProfile.schoolName}</Text>
              {coachProfile.phone ? (
                <Text style={styles.contactText}>{coachProfile.phone}</Text>
              ) : null}
              <Text style={styles.contactText}>{coachProfile.email}</Text>
            </View>
          )}
        </View>

        {/* General Settings */}
        <Text style={styles.sectionHeader}>{t('general_settings')}</Text>
        <View style={[styles.settingGroup, layout.shadowSubtle]}>
          <TouchableOpacity style={styles.settingRow} onPress={onOpenLanguage}>
            <Globe size={18} color={colors.primary} style={styles.rowIcon} />
            <Text style={styles.rowLabel}>{t('language')}</Text>
            <Text style={styles.rowValue}>{settings.language}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow} onPress={onOpenPrivacy}>
            <Shield size={18} color={colors.primary} style={styles.rowIcon} />
            <Text style={styles.rowLabel}>{t('privacy_consent')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow} onPress={onOpenOfflineSync}>
            <Wifi size={18} color={colors.primary} style={styles.rowIcon} />
            <Text style={styles.rowLabel}>{t('offline_sync')}</Text>
          </TouchableOpacity>

          <View style={styles.settingRow}>
            <Database size={18} color={colors.primary} style={styles.rowIcon} />
            <Text style={styles.rowLabel}>{t('auto_backup')}</Text>
            {/* Orange & White Pill Switch Toggle */}
            <Switch
              value={settings.autoBackupEnabled}
              onValueChange={v => updateSettings({ autoBackupEnabled: v })}
              trackColor={{ false: '#E5E5EA', true: '#FF9500' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E5E5EA"
            />
          </View>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <Moon size={18} color={colors.primary} style={styles.rowIcon} />
            <Text style={styles.rowLabel}>{t('dark_mode')}</Text>
            {/* Orange & White Pill Switch Toggle */}
            <Switch
              value={settings.darkMode}
              onValueChange={v => updateSettings({ darkMode: v })}
              trackColor={{ false: '#E5E5EA', true: '#FF9500' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E5E5EA"
            />
          </View>
        </View>

        {/* Notification Preferences (Toggle List with Orange & White Switches) */}
        <Text style={styles.sectionHeader}>{t('notification_preferences')}</Text>
        <View style={[styles.settingGroup, layout.shadowSubtle]}>
          {notificationPrefKeys.map(({ key, label }, idx) => {
            const val = settings.notificationPreferences[key] ?? true;
            const isLast = idx === notificationPrefKeys.length - 1;

            return (
              <View key={key} style={[styles.settingRow, isLast && { borderBottomWidth: 0 }]}>
                <Bell size={16} color={colors.primary} style={styles.rowIcon} />
                <Text style={styles.rowLabel}>{label}</Text>
                <Switch
                  value={val}
                  onValueChange={() => toggleNotificationPref(key)}
                  trackColor={{ false: '#E5E5EA', true: '#FF9500' }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#E5E5EA"
                />
              </View>
            );
          })}
        </View>

        {/* App Info */}
        <Text style={styles.sectionHeader}>{t('app_info')}</Text>
        <View style={[styles.settingGroup, layout.shadowSubtle]}>
          <TouchableOpacity style={styles.settingRow} onPress={onOpenAbout}>
            <Info size={18} color={colors.primary} style={styles.rowIcon} />
            <Text style={styles.rowLabel}>{t('about_app')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow} onPress={onOpenAbout}>
            <HelpCircle size={18} color={colors.primary} style={styles.rowIcon} />
            <Text style={styles.rowLabel}>{t('help_support')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow} onPress={onOpenAbout}>
            <FileText size={18} color={colors.primary} style={styles.rowIcon} />
            <Text style={styles.rowLabel}>{t('terms_conditions')}</Text>
          </TouchableOpacity>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.rowLabel, { marginLeft: 30 }]}>{t('app_version')}</Text>
            <Text style={styles.rowValue}>v1.0.0 (Build 2026.08)</Text>
          </View>
        </View>

        {/* Account Actions */}
        <Text style={styles.sectionHeader}>{t('account_actions')}</Text>
        <View style={[styles.settingGroup, layout.shadowSubtle, { marginBottom: 32 }]}>
          <TouchableOpacity style={styles.settingRow} onPress={onSignOut}>
            <LogOut size={18} color={colors.primary} style={styles.rowIcon} />
            <Text style={[styles.rowLabel, { color: colors.primary, fontWeight: '700' }]}>{t('sign_out')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingRow, { borderBottomWidth: 0 }]}
            onPress={() => setIsDeleteModalVisible(true)}
          >
            <Trash2 size={18} color={colors.error} style={styles.rowIcon} />
            <Text style={[styles.rowLabel, { color: colors.error, fontWeight: '700' }]}>
              {t('delete_account')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Delete Account Modal Confirmation */}
      <Modal visible={isDeleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{t('delete_account')}</Text>
            <Text style={styles.modalBody}>
              {t('delete_account_confirm')}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsDeleteModalVisible(false)}
              >
                <Text style={styles.cancelText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmBtn}
                onPress={() => {
                  setIsDeleteModalVisible(false);
                  onSignOut();
                }}
              >
                <Text style={styles.deleteConfirmText}>{t('delete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  editBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight, // #FFF5E6
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary, // Orange #FF9500
  },
  profileDetails: {
    alignItems: 'center',
  },
  coachName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  designationText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2,
  },
  schoolText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  contactText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  editForm: {
    width: '100%',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    color: colors.textPrimary,
  },
  saveProfileBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  saveProfileText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 8,
  },
  settingGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rowIcon: {
    marginRight: 12,
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  rowValue: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  deleteConfirmBtn: {
    backgroundColor: colors.error,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  deleteConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
