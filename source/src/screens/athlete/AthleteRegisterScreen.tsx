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
  ChevronDown, AlertCircle, Check, Shield, ArrowLeft, ArrowRight
} from 'lucide-react-native';
import { registerUser } from '../../services/authService';
import DobPickerBox, { calcAge } from '../../components/DobPickerBox';

const idTypeSchema = (idType: string | undefined) => {
  if (idType === 'APAAR') return yup.string().matches(/^\d{12}$/, 'Enter a valid 12-digit APAAR ID').required();
  if (idType === 'AADHAR') return yup.string().matches(/^\d{12}$/, 'Enter a valid 12-digit Aadhar number').required();
  return yup.string().matches(/^\d{4,20}$/, 'Enter a valid NSRS number (digits only)').required();
};

const schema = yup.object({
  fullName: yup
    .string()
    .transform(value => (typeof value === 'string' ? value.trim() : value))
    .required('Please enter a valid name')
    .matches(/^[A-Za-z.\s'-]+$/, 'Please enter a valid name')
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
    isMinor
      ? schema
          .transform(value => (typeof value === 'string' ? value.trim() : value))
          .required('Guardian name is required')
          .matches(/^[A-Za-z.\s'-]+$/, 'Please enter a valid name')
          .min(2, 'Please enter a valid name')
          .max(50, 'Please enter a valid name')
      : schema.optional()
  ),
  guardianRelation: yup.string().when('$isMinor', ([isMinor], schema) =>
    isMinor ? schema.required('Relationship is required') : schema.optional()
  ),
});

type FormData = yup.InferType<typeof schema>;

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

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? (
    <View style={styles.errorRow}>
      <AlertCircle size={12} color="#EF4444" />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  ) : null;

const AthleteRegisterScreen = ({ navigation }: any) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [pickerVisible, setPickerVisible] = useState<string | null>(null);

  const { control, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<FormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
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

  const validateField = (field: keyof FormData, value: string) => {
    const normalized = value.trim();

    if (field === 'fullName' || field === 'guardianName' || field === 'school') {
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

  const handleNextStep = async () => {
    const fieldsToValidate: Array<keyof FormData> = ['fullName', 'dobDay', 'dobMonth', 'dobYear', 'gender', 'phone'];
    if (isMinor) {
      fieldsToValidate.push('guardianName', 'guardianRelation');
    }

    const isValidStep1 = await trigger(fieldsToValidate);
    if (isValidStep1) {
      setStep(2);
    } else {
      Alert.alert('Incomplete Form', 'Please fix errors in Step 1 before proceeding.');
    }
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
        id_number: String(data.idNumber ?? ''),
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

            {/* Step Progress Bar */}
            <View style={styles.stepIndicatorContainer}>
              <TouchableOpacity
                style={[styles.stepBadge, step === 1 && styles.stepBadgeActive]}
                onPress={() => setStep(1)}
              >
                <Text style={[styles.stepBadgeText, step === 1 && styles.stepBadgeTextActive]}>
                  1. Personal Info
                </Text>
              </TouchableOpacity>
              <View style={styles.stepLine} />
              <TouchableOpacity
                style={[styles.stepBadge, step === 2 && styles.stepBadgeActive]}
                onPress={handleNextStep}
              >
                <Text style={[styles.stepBadgeText, step === 2 && styles.stepBadgeTextActive]}>
                  2. Verification
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.form}>
            {/* PAGE 1: Personal Details (Until Phone) */}
            {step === 1 && (
              <>
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
                          onChangeText={text => {
                            onChange(text);
                            validateField('fullName', text);
                          }}
                          autoCapitalize="words"
                        />
                      </View>
                    )}
                  />
                  <FieldError message={errors.fullName?.message} />
                </View>

                {/* Date of Birth Box Module */}
                <DobPickerBox
                  dobDay={dobDay}
                  dobMonth={dobMonth}
                  dobYear={dobYear}
                  onSelectDate={(d, m, y) => {
                    setValue('dobDay', d, { shouldValidate: true, shouldDirty: true });
                    setValue('dobMonth', m, { shouldValidate: true, shouldDirty: true });
                    setValue('dobYear', y, { shouldValidate: true, shouldDirty: true });
                    void trigger(['dobDay', 'dobMonth', 'dobYear']);
                  }}
                  error={errors.dobDay?.message || errors.dobMonth?.message || errors.dobYear?.message}
                />

                {/* Guardian Block */}
                {isMinor && (
                  <View style={styles.guardianBlock}>
                    <View style={styles.guardianTitleRow}>
                      <Shield size={16} color="#9A2C2C" />
                      <Text style={styles.guardianTitle}>Guardian Details (Under 18)</Text>
                    </View>
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
                              onChangeText={text => {
                                onChange(text);
                                validateField('guardianName', text);
                              }}
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

                {/* Phone (Last Field of Page 1) */}
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

                {/* Page 1 Action: NEXT Button */}
                <TouchableOpacity style={styles.button} onPress={handleNextStep}>
                  <View style={styles.btnRow}>
                    <Text style={styles.buttonText}>Next Step</Text>
                    <ArrowRight size={18} color="#FFF" />
                  </View>
                </TouchableOpacity>
              </>
            )}

            {/* PAGE 2: Institutional & Identity Details */}
            {step === 2 && (
              <>
                {/* Back Button to Page 1 */}
                <TouchableOpacity style={styles.backStepBtn} onPress={() => setStep(1)}>
                  <ArrowLeft size={16} color="#4F46E5" />
                  <Text style={styles.backStepText}>← Back to Personal Details</Text>
                </TouchableOpacity>

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
                          onChangeText={text => {
                            onChange(text);
                            validateField('school', text);
                          }}
                        />
                      </View>
                    )}
                  />
                  <FieldError message={errors.school?.message} />
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
                          onAccept: () => {
                            setValue('consent', true, { shouldValidate: true, shouldDirty: true });
                            void trigger('consent');
                          },
                        })}
                      >
                        Terms & Conditions
                      </Text>
                    </Text>
                  </View>
                  <FieldError message={errors.consent?.message} />
                </View>

                {/* Page 2 Action: Submit Button */}
                <TouchableOpacity
                  style={[styles.button, (loading || !consent) && styles.buttonDisabled]}
                  onPress={handleSubmit(onSubmit)}
                  disabled={loading || !consent}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.buttonText}>Register & Get OTP</Text>}
                </TouchableOpacity>
              </>
            )}

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AthleteLogin')}>
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
        onSelect={val => {
          setValue('idType', val as any, { shouldValidate: true, shouldDirty: true });
          setValue('idNumber', '');
          void trigger('idType');
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
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#64748B', lineHeight: 22, marginBottom: 14 },
  
  // Step indicator progress bar
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 6,
  },
  stepBadge: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  stepBadgeActive: {
    backgroundColor: '#4F46E5',
  },
  stepBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  stepBadgeTextActive: {
    color: '#FFFFFF',
  },
  stepLine: {
    width: 8,
  },

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
  guardianBlock: {
    backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FDBA74',
    borderRadius: 14, padding: 16, gap: 14,
  },
  guardianTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
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
  buttonDisabled: { opacity: 0.5, backgroundColor: '#94A3B8', shadowOpacity: 0, elevation: 0 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backStepBtn: { paddingVertical: 6, marginBottom: 4 },
  backStepText: { color: '#4F46E5', fontSize: 14, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 16, paddingBottom: 8 },
  footerText: { fontSize: 14, color: '#64748B' },
  footerLink: { fontSize: 14, color: '#4F46E5', fontWeight: '700' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  errorText: { fontSize: 12, color: '#EF4444', fontWeight: '500' },
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
