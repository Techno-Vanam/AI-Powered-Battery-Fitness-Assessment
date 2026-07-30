import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Modal
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  User, Phone, CreditCard, Building2, CheckSquare, Square,
  ChevronDown, AlertCircle, Check, Briefcase
} from 'lucide-react-native';
import { registerUser } from '../../services/authService';

const idTypeSchema = (idType: string | undefined) => {
  if (idType === 'APAAR') return yup.string().matches(/^\d{12}$/, 'Enter a valid 12-digit APAAR ID').required();
  if (idType === 'AADHAR') return yup.string().matches(/^\d{12}$/, 'Enter a valid 12-digit Aadhar number').required();
  return yup.string().matches(/^\d{4,20}$/, 'Enter a valid NSRS number (digits only)').required();
};

const schema = yup.object({
  coachName: yup
    .string()
    .required('Please enter a valid name')
    .matches(/^[A-Za-z]+(\s[A-Za-z]+)*$/, 'Please enter a valid name')
    .min(2, 'Please enter a valid name')
    .max(50, 'Please enter a valid name'),
  organizationName: yup.string().min(2, 'Please enter your organization name').required('Please enter your organization name'),
  designation: yup
    .string()
    .oneOf(['coach', 'pe_teacher', 'tidc', 'tizc'], 'Please select a designation')
    .required('Please select a designation'),
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
  consent: yup.boolean().oneOf([true], 'Please accept the Terms & Conditions to continue').required(),
});

type FormData = yup.InferType<typeof schema>;

const DESIGNATIONS = [
  { label: 'Coach', value: 'coach' },
  { label: 'PE Teacher', value: 'pe_teacher' },
  { label: 'TIDC', value: 'tidc' },
  { label: 'TIZC', value: 'tizc' },
];

const PickerModal = ({ visible, title, items, selected, onSelect, onClose }: any) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalSheet}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>Done</Text></TouchableOpacity>
        </View>
        <ScrollView>
          {items.map((item: any) => (
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

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? (
    <View style={styles.errorRow}>
      <AlertCircle size={12} color="#EF4444" />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  ) : null;

const CoachRegisterScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [pickerVisible, setPickerVisible] = useState<string | null>(null);

  const { control, handleSubmit, watch, setValue, trigger, formState: { errors, isValid } } = useForm<FormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema) as any,
    defaultValues: {
      coachName: '', organizationName: '', designation: undefined as any, gender: '',
      phone: '', idType: 'NSRS', idNumber: '', consent: false,
    },
  });

  const idType = watch('idType');
  const consent = watch('consent');
  const gender = watch('gender');
  const designation = watch('designation');
  const selectedDesignationLabel = DESIGNATIONS.find(item => item.value === designation)?.label || 'Select designation';

  const getIdPlaceholder = () => {
    if (idType === 'APAAR') return '12-digit APAAR ID';
    if (idType === 'AADHAR') return '12-digit Aadhar Number';
    return 'NSRS Number (digits only)';
  };

  const validateField = (field: keyof FormData, value: string) => {
    const normalized = value.trim();

    if (field === 'coachName' || field === 'organizationName') {
      if (normalized.length === 0 || normalized.length >= 2) {
        void trigger(field as any);
      }
      return;
    }

    if (field === 'phone') {
      if (normalized.length === 0 || normalized.length >= 10) {
        void trigger(field as any);
      }
      return;
    }

    if (field === 'idNumber') {
      if (normalized.length === 0 || normalized.length >= 4) {
        void trigger(field as any);
      }
      return;
    }

    void trigger(field as any);
  };

  const onSubmit = useCallback(async (data: FormData) => {
    setLoading(true);
    try {
      const { local_id, otp } = await registerUser({
        role: 'coach',
        full_name: data.coachName,
        gender: data.gender,
        phone: data.phone || undefined,
        id_type: data.idType,
        id_number: String(data.idNumber ?? ''),
        school_or_org: data.organizationName,
        designation: data.designation ?? 'coach',
        consent_given: data.consent ? 1 : 0,
      });
      navigation.navigate('CoachOtpVerify', { local_id, otp });
    } catch (e: any) {
      Alert.alert('Registration Failed', e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Coach Registration</Text>
            <Text style={styles.subtitle}>Register as a coach or physical educator.</Text>
          </View>

          <View style={styles.form}>
            {/* Coach Name */}
            <View style={styles.group}>
              <Text style={styles.label}>Full Name</Text>
              <Controller
                control={control}
                name="coachName"
                render={({ field: { onChange, value } }) => (
                  <View style={[styles.inputRow, errors.coachName && styles.inputError]}>
                    <User size={18} color="#94A3B8" />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Rajesh Kumar"
                      placeholderTextColor="#94A3B8"
                      value={value}
                      onChangeText={text => {
                        onChange(text);
                        validateField('coachName', text);
                      }}
                      autoCapitalize="words"
                    />
                  </View>
                )}
              />
              <FieldError message={errors.coachName?.message} />
            </View>

            {/* Organization */}
            <View style={styles.group}>
              <Text style={styles.label}>Organization Name</Text>
              <Controller
                control={control}
                name="organizationName"
                render={({ field: { onChange, value } }) => (
                  <View style={[styles.inputRow, errors.organizationName && styles.inputError]}>
                    <Building2 size={18} color="#94A3B8" />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Sports Authority of India"
                      placeholderTextColor="#94A3B8"
                      value={value}
                      onChangeText={text => {
                        onChange(text);
                        validateField('organizationName', text);
                      }}
                    />
                  </View>
                )}
              />
              <FieldError message={errors.organizationName?.message} />
            </View>

            {/* Designation */}
            <View style={styles.group}>
              <Text style={styles.label}>Designation</Text>
              <TouchableOpacity
                style={[styles.inputRow, errors.designation && styles.inputError]}
                onPress={() => setPickerVisible('designation')}
              >
                <Briefcase size={18} color="#94A3B8" />
                <Text style={[styles.input, { paddingVertical: 0, color: '#0F172A', fontWeight: '600' }]}>
                  {selectedDesignationLabel}
                </Text>
                <ChevronDown size={18} color="#94A3B8" />
              </TouchableOpacity>
              <FieldError message={errors.designation?.message} />
            </View>

            {/* Gender */}
            <View style={styles.group}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.segmented}>
                {[{ label: 'Male', value: 'M' }, { label: 'Female', value: 'F' }, { label: 'Other', value: 'O' }].map(g => (
                  <TouchableOpacity
                    key={g.value}
                    style={[styles.segment, gender === g.value && styles.segmentActive]}
                    onPress={() => {
                      setValue('gender', g.value, { shouldValidate: true, shouldDirty: true });
                      void trigger('gender');
                    }}
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
                      onChangeText={text => {
                        onChange(text);
                        validateField('phone', text);
                      }}
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
                      onChangeText={text => {
                        onChange(text);
                        validateField('idNumber', text);
                      }}
                    />
                  </View>
                )}
              />
              <FieldError message={errors.idNumber?.message} />
            </View>

            {/* Consent */}
            <View style={styles.group}>
              <View style={styles.consentRow}>
                <TouchableOpacity onPress={() => {
                  setValue('consent', !consent, { shouldValidate: true, shouldDirty: true });
                  void trigger('consent');
                }}>
                  {consent
                    ? <CheckSquare size={24} color="#4F46E5" />
                    : <Square size={24} color="#CBD5E1" />}
                </TouchableOpacity>
                <Text style={styles.consentText}>
                  I agree to the{' '}
                  <Text
                    style={styles.consentLink}
                    onPress={() => navigation.navigate('TermsAndConditions', {
                      onAccept: () => setValue('consent', true, { shouldValidate: true }),
                    })}
                  >
                    Terms & Conditions
                  </Text>
                </Text>
              </View>
              <FieldError message={errors.consent?.message} />
            </View>

            <TouchableOpacity
              style={[styles.button, (loading || !isValid) && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit as any)}
              disabled={loading || !isValid}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>Register & Get OTP</Text>}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('CoachLogin')}>
                <Text style={styles.footerLink}> Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <PickerModal
        visible={pickerVisible === 'idType'}
        title="Select ID Type"
        items={[
          { label: 'NSRS', value: 'NSRS' },
          { label: 'APAAR', value: 'APAAR' },
          { label: 'AADHAR (Aadhar)', value: 'AADHAR' },
        ]}
        selected={idType}
        onSelect={(val: string) => {
          setValue('idType', val as any, { shouldValidate: true, shouldDirty: true });
          setValue('idNumber', '');
          void trigger('idType');
        }}
        onClose={() => setPickerVisible(null)}
      />

      <PickerModal
        visible={pickerVisible === 'designation'}
        title="Select Designation"
        items={DESIGNATIONS}
        selected={designation}
        onSelect={(val: string) => {
          setValue('designation', val as any, { shouldValidate: true, shouldDirty: true });
          void trigger('designation');
        }}
        onClose={() => setPickerVisible(null)}
      />
    </SafeAreaView>
  );
};

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
  designationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  designationBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF',
  },
  designationBtnActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  designationText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  designationTextActive: { color: '#FFFFFF' },
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
    backgroundColor: '#7C3AED', borderRadius: 14, height: 56,
    justifyContent: 'center', alignItems: 'center', marginTop: 8,
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 16, paddingBottom: 8 },
  footerText: { fontSize: 14, color: '#64748B' },
  footerLink: { fontSize: 14, color: '#7C3AED', fontWeight: '700' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  errorText: { fontSize: 12, color: '#EF4444', fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '50%', paddingBottom: 32 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 18, borderBottomWidth: 1, borderColor: '#E2E8F0',
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  modalClose: { fontSize: 15, color: '#7C3AED', fontWeight: '700' },
  modalItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: '#F1F5F9',
  },
  modalItemText: { fontSize: 15, color: '#334155' },
  modalItemSelected: { color: '#7C3AED', fontWeight: '700' },
});

export default CoachRegisterScreen;
