import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Modal
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  User, Calendar, Phone, CreditCard, Building2, CheckSquare, Square,
  ChevronDown, AlertCircle, Check
} from 'lucide-react-native';
import { registerUser } from '../../services/authService';

// ---------------------------------------------------------------------------
// Validation Schema
// ---------------------------------------------------------------------------
const idTypeSchema = (idType: string | undefined) => {
  if (idType === 'APAAR') return yup.string().matches(/^\d{12}$/, 'Enter a valid 12-digit APAAR ID').required();
  if (idType === 'AADHAR') return yup.string().matches(/^\d{12}$/, 'Enter a valid 12-digit Aadhar number').required();
  // NSRS
  return yup.string().matches(/^\d{4,20}$/, 'Enter a valid NSRS number (digits only)').required();
};

const schema = yup.object({
  fullName: yup
    .string()
    .required('Please enter a valid name')
    .matches(/^[A-Za-z]+(\s[A-Za-z]+)*$/, 'Please enter a valid name')
    .min(2, 'Please enter a valid name')
    .max(50, 'Please enter a valid name'),
  dobDay: yup.string().required('Please select a valid date of birth'),
  dobMonth: yup.string().required('Please select a valid date of birth'),
  dobYear: yup.string().required('Please select a valid date of birth'),
  gender: yup.string().required('Please select a gender'),
  phone: yup
    .string()
    .optional()
    .test('phone-format', 'Enter a valid 10-digit phone number', val => {
      if (!val || val === '') return true;
      return /^[6-9]\d{9}$/.test(val);
    }),
  idType: yup.string().oneOf(['NSRS', 'APAAR', 'AADHAR'], 'Please select an ID type').required('Please select an ID type'),
  idNumber: yup.string().when('idType', ([idType], schema) => idTypeSchema(idType)),
  school: yup.string().min(2, 'Please enter your school or institution').required('Please enter your school or institution'),
  consent: yup.boolean().oneOf([true], 'Please accept the Terms & Conditions to continue').required(),
  guardianName: yup.string().when('$isMinor', ([isMinor], schema) =>
    isMinor ? schema.required('Guardian name is required') : schema.optional()
  ),
  guardianRelation: yup.string().when('$isMinor', ([isMinor], schema) =>
    isMinor ? schema.required('Relationship is required') : schema.optional()
  ),
});

type FormData = yup.InferType<typeof schema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const MONTHS = [
  { label: 'Jan', value: '01' }, { label: 'Feb', value: '02' }, { label: 'Mar', value: '03' },
  { label: 'Apr', value: '04' }, { label: 'May', value: '05' }, { label: 'Jun', value: '06' },
  { label: 'Jul', value: '07' }, { label: 'Aug', value: '08' }, { label: 'Sep', value: '09' },
  { label: 'Oct', value: '10' }, { label: 'Nov', value: '11' }, { label: 'Dec', value: '12' },
];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

const calcAge = (day: string, month: string, year: string): number | null => {
  if (!day || !month || !year) return null;
  const dob = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const today = new Date();
  if (isNaN(dob.getTime()) || dob > today) return null;
  // Validate the date round-trips (catches Feb 30, etc.)
  if (dob.getDate() !== parseInt(day) || dob.getMonth() !== parseInt(month) - 1 || dob.getFullYear() !== parseInt(year)) return null;
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
};

// ---------------------------------------------------------------------------
// Picker Modal
// ---------------------------------------------------------------------------
interface PickerItem { label: string; value: string; }
interface PickerModalProps {
  visible: boolean;
  title: string;
  items: PickerItem[];
  selected: string;
  onSelect: (val: string) => void;
  onClose: () => void;
}
const PickerModal: React.FC<PickerModalProps> = ({ visible, title, items, selected, onSelect, onClose }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalSheet}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>Done</Text></TouchableOpacity>
        </View>
        <ScrollView>
          {items.map(item => (
            <TouchableOpacity key={item.value} style={styles.modalItem} onPress={() => { onSelect(item.value); onClose(); }}>
              <Text style={[styles.modalItemText, selected === item.value && styles.modalItemSelected]}>{item.label}</Text>
              {selected === item.value && <Check size={18} color="#4F46E5" />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

// ---------------------------------------------------------------------------
// Error display
// ---------------------------------------------------------------------------
const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? (
    <View style={styles.errorRow}>
      <AlertCircle size={12} color="#EF4444" />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  ) : null;

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------
const AthleteRegisterScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [pickerVisible, setPickerVisible] = useState<string | null>(null);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      fullName: '', dobDay: '', dobMonth: '', dobYear: '', gender: '',
      phone: '', idType: 'NSRS', idNumber: '', school: '', consent: false,
      guardianName: '', guardianRelation: 'Father',
    },
    context: { isMinor: false },
  });

  const dobDay = watch('dobDay');
  const dobMonth = watch('dobMonth');
  const dobYear = watch('dobYear');
  const idType = watch('idType');
  const consent = watch('consent');
  const gender = watch('gender');
  const guardianRelation = watch('guardianRelation');

  const age = calcAge(dobDay, dobMonth, dobYear);
  const isMinor = age !== null && age < 18;

  const getIdPlaceholder = () => {
    if (idType === 'APAAR') return '12-digit APAAR ID';
    if (idType === 'AADHAR') return '12-digit Aadhar Number';
    return 'NSRS Number (digits only)';
  };

  const onSubmit = useCallback(async (data: FormData) => {
    const ageCheck = calcAge(data.dobDay, data.dobMonth, data.dobYear);
    if (ageCheck === null) {
      Alert.alert('Invalid Date', 'Please select a valid date of birth.');
      return;
    }

    setLoading(true);
    try {
      const dob = `${data.dobYear}-${data.dobMonth}-${data.dobDay}`;
      const { local_id, otp } = registerUser({
        role: 'athlete',
        full_name: data.fullName,
        dob,
        gender: data.gender,
        phone: data.phone || undefined,
        id_type: data.idType,
        id_number: data.idNumber,
        school_or_org: data.school,
        consent_given: data.consent ? 1 : 0,
        guardian_name: isMinor ? data.guardianName : undefined,
        guardian_relation: isMinor ? data.guardianRelation : undefined,
      });

      navigation.navigate('AthleteOtpVerify', { local_id, otp });
    } catch (e: any) {
      Alert.alert('Registration Failed', e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isMinor, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join as an athlete and track your journey.</Text>
          </View>

          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.group}>
              <Text style={styles.label}>Full Name</Text>
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, value } }) => (
                  <View style={[styles.inputRow, errors.fullName && styles.inputError]}>
                    <User size={18} color="#94A3B8" />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Arjun Sharma"
                      placeholderTextColor="#94A3B8"
                      value={value}
                      onChangeText={onChange}
                      autoCapitalize="words"
                    />
                  </View>
                )}
              />
              <FieldError message={errors.fullName?.message} />
            </View>

            {/* Date of Birth */}
            <View style={styles.group}>
              <Text style={styles.label}>Date of Birth</Text>
              <View style={styles.dobRow}>
                {/* Day */}
                <TouchableOpacity
                  style={[styles.dobPicker, errors.dobDay && styles.inputError]}
                  onPress={() => setPickerVisible('day')}
                >
                  <Calendar size={14} color="#94A3B8" />
                  <Text style={[styles.dobText, !dobDay && styles.placeholder]}>{dobDay || 'DD'}</Text>
                  <ChevronDown size={14} color="#94A3B8" />
                </TouchableOpacity>
                {/* Month */}
                <TouchableOpacity
                  style={[styles.dobPicker, errors.dobMonth && styles.inputError]}
                  onPress={() => setPickerVisible('month')}
                >
                  <Text style={[styles.dobText, !dobMonth && styles.placeholder]}>
                    {dobMonth ? MONTHS.find(m => m.value === dobMonth)?.label : 'MM'}
                  </Text>
                  <ChevronDown size={14} color="#94A3B8" />
                </TouchableOpacity>
                {/* Year */}
                <TouchableOpacity
                  style={[styles.dobPicker, { flex: 1.3 }, errors.dobYear && styles.inputError]}
                  onPress={() => setPickerVisible('year')}
                >
                  <Text style={[styles.dobText, !dobYear && styles.placeholder]}>{dobYear || 'YYYY'}</Text>
                  <ChevronDown size={14} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              {age !== null && (
                <View style={styles.agePill}>
                  <Text style={styles.ageText}>Age: {age} years {isMinor ? '(Minor)' : ''}</Text>
                </View>
              )}
              <FieldError message={errors.dobDay?.message || errors.dobMonth?.message || errors.dobYear?.message} />
            </View>

            {/* Guardian Block */}
            {isMinor && (
              <View style={styles.guardianBlock}>
                <Text style={styles.guardianTitle}>👤 Guardian Details (Under 18)</Text>
                <View style={styles.group}>
                  <Text style={styles.label}>Guardian Name</Text>
                  <Controller
                    control={control}
                    name="guardianName"
                    render={({ field: { onChange, value } }) => (
                      <View style={[styles.inputRow, errors.guardianName && styles.inputError]}>
                        <User size={18} color="#94A3B8" />
                        <TextInput
                          style={styles.input}
                          placeholder="Guardian Full Name"
                          placeholderTextColor="#94A3B8"
                          value={value}
                          onChangeText={onChange}
                        />
                      </View>
                    )}
                  />
                  <FieldError message={errors.guardianName?.message} />
                </View>
                <View style={styles.group}>
                  <Text style={styles.label}>Relationship</Text>
                  <View style={styles.segmented}>
                    {['Father', 'Mother', 'Legal Guardian'].map(rel => (
                      <TouchableOpacity
                        key={rel}
                        style={[styles.segment, guardianRelation === rel && styles.segmentActive]}
                        onPress={() => setValue('guardianRelation', rel)}
                      >
                        <Text style={[styles.segmentText, guardianRelation === rel && styles.segmentTextActive]}>
                          {rel}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* Gender */}
            <View style={styles.group}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.segmented}>
                {[{ label: 'Male', value: 'M' }, { label: 'Female', value: 'F' }, { label: 'Other', value: 'O' }].map(g => (
                  <TouchableOpacity
                    key={g.value}
                    style={[styles.segment, gender === g.value && styles.segmentActive]}
                    onPress={() => setValue('gender', g.value)}
                  >
                    <Text style={[styles.segmentText, gender === g.value && styles.segmentTextActive]}>{g.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <FieldError message={errors.gender?.message} />
            </View>

            {/* Phone */}
            <View style={styles.group}>
              <Text style={styles.label}>Phone Number <Text style={styles.optional}>(Optional)</Text></Text>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                  <View style={[styles.inputRow, errors.phone && styles.inputError]}>
                    <Phone size={18} color="#94A3B8" />
                    <Text style={styles.prefix}>+91</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="10-digit mobile number"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      maxLength={10}
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                )}
              />
              <FieldError message={errors.phone?.message} />
            </View>

            {/* ID Type */}
            <View style={styles.group}>
              <Text style={styles.label}>ID Type</Text>
              <TouchableOpacity
                style={[styles.inputRow, errors.idType && styles.inputError]}
                onPress={() => setPickerVisible('idType')}
              >
                <CreditCard size={18} color="#94A3B8" />
                <Text style={[styles.input, { paddingVertical: 0, color: '#0F172A', fontWeight: '600' }]}>{idType}</Text>
                <ChevronDown size={18} color="#94A3B8" />
              </TouchableOpacity>
              <FieldError message={errors.idType?.message} />
            </View>

            {/* ID Number */}
            <View style={styles.group}>
              <Text style={styles.label}>ID Number</Text>
              <Controller
                control={control}
                name="idNumber"
                render={({ field: { onChange, value } }) => (
                  <View style={[styles.inputRow, errors.idNumber && styles.inputError]}>
                    <CreditCard size={18} color="#94A3B8" />
                    <TextInput
                      style={styles.input}
                      placeholder={getIdPlaceholder()}
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      maxLength={idType === 'NSRS' ? 20 : 12}
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                )}
              />
              <FieldError message={errors.idNumber?.message} />
            </View>

            {/* School */}
            <View style={styles.group}>
              <Text style={styles.label}>School / Institution</Text>
              <Controller
                control={control}
                name="school"
                render={({ field: { onChange, value } }) => (
                  <View style={[styles.inputRow, errors.school && styles.inputError]}>
                    <Building2 size={18} color="#94A3B8" />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your school name"
                      placeholderTextColor="#94A3B8"
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                )}
              />
              <FieldError message={errors.school?.message} />
            </View>

            {/* Consent */}
            <View style={styles.group}>
              <View style={styles.consentRow}>
                <TouchableOpacity onPress={() => setValue('consent', !consent)}>
                  {consent
                    ? <CheckSquare size={24} color="#4F46E5" />
                    : <Square size={24} color="#CBD5E1" />}
                </TouchableOpacity>
                <Text style={styles.consentText}>
                  I agree to the{' '}
                  <Text
                    style={styles.consentLink}
                    onPress={() => navigation.navigate('TermsAndConditions')}
                  >
                    Terms & Conditions
                  </Text>
                </Text>
              </View>
              <FieldError message={errors.consent?.message} />
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>Register & Get OTP</Text>}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AthleteLogin')}>
                <Text style={styles.footerLink}> Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Pickers */}
      <Controller
        control={control}
        name="dobDay"
        render={({ field: { onChange, value } }) => (
          <PickerModal
            visible={pickerVisible === 'day'}
            title="Select Day"
            items={DAYS.map(d => ({ label: d, value: d }))}
            selected={value}
            onSelect={onChange}
            onClose={() => setPickerVisible(null)}
          />
        )}
      />
      <Controller
        control={control}
        name="dobMonth"
        render={({ field: { onChange, value } }) => (
          <PickerModal
            visible={pickerVisible === 'month'}
            title="Select Month"
            items={MONTHS}
            selected={value}
            onSelect={onChange}
            onClose={() => setPickerVisible(null)}
          />
        )}
      />
      <Controller
        control={control}
        name="dobYear"
        render={({ field: { onChange, value } }) => (
          <PickerModal
            visible={pickerVisible === 'year'}
            title="Select Year"
            items={YEARS.map(y => ({ label: y, value: y }))}
            selected={value}
            onSelect={onChange}
            onClose={() => setPickerVisible(null)}
          />
        )}
      />
      <PickerModal
        visible={pickerVisible === 'idType'}
        title="Select ID Type"
        items={[
          { label: 'NSRS', value: 'NSRS' },
          { label: 'APAAR', value: 'APAAR' },
          { label: 'AADHAR (Aadhar)', value: 'AADHAR' },
        ]}
        selected={idType}
        onSelect={val => { setValue('idType', val as any); setValue('idNumber', ''); }}
        onClose={() => setPickerVisible(null)}
      />
    </SafeAreaView>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24, paddingBottom: 40 },
  header: { marginBottom: 28 },
  title: { fontSize: 28, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#64748B', lineHeight: 22 },
  form: { gap: 18 },
  group: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: '#334155', letterSpacing: 0.3 },
  optional: { fontWeight: '400', color: '#94A3B8' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 14, paddingHorizontal: 14, height: 52,
  },
  inputError: { borderColor: '#FCA5A5', backgroundColor: '#FFF5F5' },
  input: { flex: 1, fontSize: 15, color: '#0F172A', paddingVertical: 0 },
  prefix: { fontSize: 15, color: '#0F172A', fontWeight: '600' },
  dobRow: { flexDirection: 'row', gap: 8 },
  dobPicker: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4,
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 14, paddingHorizontal: 10, height: 52,
  },
  dobText: { fontSize: 15, color: '#0F172A', fontWeight: '500', flex: 1, textAlign: 'center' },
  placeholder: { color: '#94A3B8' },
  agePill: {
    alignSelf: 'flex-start', backgroundColor: '#EEF2FF', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4, marginTop: 2,
  },
  ageText: { fontSize: 12, fontWeight: '700', color: '#4F46E5' },
  guardianBlock: {
    backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FDBA74',
    borderRadius: 14, padding: 16, gap: 14,
  },
  guardianTitle: { fontSize: 13, fontWeight: '700', color: '#9A3412' },
  segmented: {
    flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12,
    padding: 4, gap: 4,
  },
  segment: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  segmentActive: { backgroundColor: '#4F46E5' },
  segmentText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  segmentTextActive: { color: '#FFFFFF' },
  consentRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  consentText: { flex: 1, fontSize: 14, color: '#64748B', lineHeight: 20 },
  consentLink: { color: '#4F46E5', fontWeight: '700', textDecorationLine: 'underline' },
  button: {
    backgroundColor: '#4F46E5', borderRadius: 14, height: 56,
    justifyContent: 'center', alignItems: 'center', marginTop: 8,
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 16, paddingBottom: 8 },
  footerText: { fontSize: 14, color: '#64748B' },
  footerLink: { fontSize: 14, color: '#4F46E5', fontWeight: '700' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  errorText: { fontSize: 12, color: '#EF4444', fontWeight: '500' },
  // Picker modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '60%', paddingBottom: 32 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 18, borderBottomWidth: 1, borderColor: '#E2E8F0',
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  modalClose: { fontSize: 15, color: '#4F46E5', fontWeight: '700' },
  modalItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: '#F1F5F9',
  },
  modalItemText: { fontSize: 15, color: '#334155' },
  modalItemSelected: { color: '#4F46E5', fontWeight: '700' },
});

export default AthleteRegisterScreen;
