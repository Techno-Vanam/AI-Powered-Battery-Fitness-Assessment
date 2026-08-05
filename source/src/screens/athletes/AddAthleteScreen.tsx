import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import { ArrowLeft, UserPlus, Check } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { SportType } from '../../types/app';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';

interface AddAthleteScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const AddAthleteScreen: React.FC<AddAthleteScreenProps> = ({ onBack, onSuccess }) => {
  const { addAthlete } = useApp();

  const [name, setName] = useState('');
  const [age, setAge] = useState('16');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [school, setSchool] = useState('Delhi Public School');
  const [sport, setSport] = useState<SportType>('Athletics');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [consent, setConsent] = useState(true);

  const sportsList: SportType[] = ['Athletics', 'Swimming', 'Football', 'Badminton', 'Basketball', 'Volleyball'];

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter the athlete full name.');
      return;
    }

    addAthlete({
      name: name.trim(),
      age: parseInt(age, 10) || 16,
      gender,
      school: school.trim() || 'Delhi Public School',
      sport,
      phone: phone.trim(),
      nsrsAadhaarId: idNumber.trim() || `NSRS-2026-${Math.floor(Math.random() * 9000) + 1000}`,
    });

    onSuccess();
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Athlete</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Aarav Sharma"
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={setName}
          />

          <View style={styles.rowTwo}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.fieldLabel}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="16"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.fieldLabel}>Gender</Text>
              <View style={styles.genderRow}>
                {(['Male', 'Female'] as const).map(g => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                    onPress={() => setGender(g)}
                  >
                    <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <Text style={styles.fieldLabel}>School / Academic Institution</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Delhi Public School"
            placeholderTextColor={colors.textTertiary}
            value={school}
            onChangeText={setSchool}
          />

          <Text style={styles.fieldLabel}>Primary Sport</Text>
          <View style={styles.sportWrap}>
            {sportsList.map(sp => (
              <TouchableOpacity
                key={sp}
                style={[styles.sportChip, sport === sp && styles.sportChipActive]}
                onPress={() => setSport(sp)}
              >
                <Text style={[styles.sportText, sport === sp && styles.sportTextActive]}>{sp}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>NSRS / APPAR / Aadhaar Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. NSRS-2026-8841"
            placeholderTextColor={colors.textTertiary}
            value={idNumber}
            onChangeText={setIdNumber}
          />

          <Text style={styles.fieldLabel}>Phone Number (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter phone number"
            placeholderTextColor={colors.textTertiary}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          {/* Consent Checkbox */}
          <TouchableOpacity
            style={styles.consentRow}
            activeOpacity={0.8}
            onPress={() => setConsent(!consent)}
          >
            <View style={[styles.checkbox, consent && styles.checkboxActive]}>
              {consent && <Check size={14} color="#FFFFFF" />}
            </View>
            <Text style={styles.consentText}>
              I confirm parental consent and authorization for physical fitness battery assessment.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} style={styles.submitBtn} onPress={handleSubmit}>
            <UserPlus size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.submitBtnText}>Register Athlete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: 16,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.buttonRadius, // 12px
    paddingHorizontal: 14,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  rowTwo: {
    flexDirection: 'row',
  },
  genderRow: {
    flexDirection: 'row',
    height: 46,
  },
  genderBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.buttonRadius,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
    backgroundColor: colors.surfaceSecondary,
  },
  genderBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  genderTextActive: {
    color: '#FFFFFF',
  },
  sportWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  sportChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    marginRight: 6,
    marginBottom: 8,
  },
  sportChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sportText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sportTextActive: {
    color: '#FFFFFF',
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  consentText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: layout.buttonRadius, // 12px
    height: 50,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
