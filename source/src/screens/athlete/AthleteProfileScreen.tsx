import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import SFSymbol from '../../components/ui/SFSymbol';
import Screen from '../../components/ui/Screen';
import AppText from '../../components/ui/AppText';
import { OfflineSyncCentre } from '../../components/dashboard';
import { colors } from '../../theme';
import type { AthleteProfile } from '../../types/athleteDashboard';

type Props = {
  navigation: any;
  route: any;
};

const DEFAULT_PROFILE: AthleteProfile = {
  name: 'Aarav Sharma',
  athleteId: 'NSRS-184729',
  age: 15,
  gender: 'Male',
  institution: 'Delhi Public School, R.K. Puram',
  photoUrl: null,
};

export default function AthleteProfileScreen({ navigation, route }: Props) {
  const initialProfile: AthleteProfile = route.params?.profile ?? DEFAULT_PROFILE;

  const [name, setName] = useState(initialProfile.name);
  const [age, setAge] = useState(String(initialProfile.age));
  const [gender, setGender] = useState(initialProfile.gender);
  const [institution, setInstitution] = useState(initialProfile.institution);
  const [athleteId, setAthleteId] = useState(initialProfile.athleteId);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }, 600);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          navigation.reset({ index: 0, routes: [{ name: 'RoleSelect' }] });
        },
      },
    ]);
  };

  return (
    <Screen fullWidth edges={['top', 'left', 'right']} style={styles.screen}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <SFSymbol name="arrow.left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="h3" style={styles.headerTitle}>
          Athlete Profile
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <SFSymbol name="person.crop.circle" size={40} color="#4F46E5" />
          </View>
          <AppText variant="h2" style={styles.profileName}>
            {name || 'Athlete Name'}
          </AppText>
          <AppText variant="caption" color={colors.textMuted}>
            {athleteId}
          </AppText>
        </View>

        <View style={styles.formCard}>
          <View style={styles.fieldGroup}>
            <AppText variant="caption" color={colors.textMuted} style={styles.label}>
              Full Name
            </AppText>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter full name"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.fieldGroup}>
            <AppText variant="caption" color={colors.textMuted} style={styles.label}>
              NSRS ID / Athlete ID
            </AppText>
            <TextInput
              style={styles.input}
              value={athleteId}
              onChangeText={setAthleteId}
              placeholder="NSRS-XXXXXX"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.rowTwo}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <AppText variant="caption" color={colors.textMuted} style={styles.label}>
                Age
              </AppText>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                placeholder="Age"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <AppText variant="caption" color={colors.textMuted} style={styles.label}>
                Gender
              </AppText>
              <TextInput
                style={styles.input}
                value={gender}
                onChangeText={setGender}
                placeholder="Gender"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <AppText variant="caption" color={colors.textMuted} style={styles.label}>
              School / Institution
            </AppText>
            <TextInput
              style={styles.input}
              value={institution}
              onChangeText={setInstitution}
              placeholder="School or Institution Name"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.btnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          <SFSymbol name="square.and.pencil" size={18} color="#FFFFFF" />
          <AppText variant="button" color="#FFFFFF">
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </AppText>
        </TouchableOpacity>

        <OfflineSyncCentre
          isOnline={true}
          sync={{ pendingVideos: 0, pendingResults: 0, pendingReports: 0, lastSyncAt: new Date().toISOString() }}
          syncing={false}
          onSyncNow={() => Alert.alert('Sync', 'Data is fully synchronized.')}
        />

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <SFSymbol name="rectangle.portrait.and.arrow.right" size={18} color="#EF4444" />
          <AppText variant="button" color="#EF4444">
            Log Out
          </AppText>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#F8FAFC',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    color: colors.textPrimary,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 22,
    color: colors.textPrimary,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  fieldGroup: {
    gap: 6,
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#111827',
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
});
