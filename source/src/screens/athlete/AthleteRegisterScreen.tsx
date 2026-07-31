import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  Alert, ActivityIndicator
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  User, Phone, CreditCard, Building2, CheckSquare, Square,
  AlertCircle, Shield
} from 'lucide-react-native';
import { registerUser } from '../../services/authService';
import { createRegisterStyles } from '../../styles/screenStyles';
import Screen from '../../components/ui/Screen';
import Dropdown from '../../components/ui/Dropdown';

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
const DAYS = Array.from({ length: 31 }, (_, i) => {
  const value = String(i + 1).padStart(2, '0');
  return { label: value, value };
});
const MONTHS = [
  { label: 'Jan', value: '01' }, { label: 'Feb', value: '02' }, { label: 'Mar', value: '03' },
  { label: 'Apr', value: '04' }, { label: 'May', value: '05' }, { label: 'Jun', value: '06' },
  { label: 'Jul', value: '07' }, { label: 'Aug', value: '08' }, { label: 'Sep', value: '09' },
  { label: 'Oct', value: '10' }, { label: 'Nov', value: '11' }, { label: 'Dec', value: '12' },
];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => {
  const value = String(currentYear - i);
  return { label: value, value };
});

const ID_TYPES = [
  { label: 'NSRS', value: 'NSRS' },
  { label: 'APAAR (12-digit)', value: 'APAAR' },
  { label: 'Aadhar (12-digit)', value: 'AADHAR' },
];

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
      <Screen scroll keyboard>
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

            {/* Date of Birth */}
            <View style={styles.group}>
              <Text style={styles.label}>Date of Birth</Text>
              <View style={styles.dobRow}>
                <Controller
                  control={control}
                  name="dobDay"
                  render={({ field: { onChange, value } }) => (
                    <Dropdown
                      compact
                      items={DAYS}
                      value={value}
                      title="Select Day"
                      placeholder="DD"
                      role="athlete"
                      hasError={!!errors.dobDay}
                      onChange={onChange}
                      style={{ flex: 1 }}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="dobMonth"
                  render={({ field: { onChange, value } }) => (
                    <Dropdown
                      compact
                      items={MONTHS}
                      value={value}
                      title="Select Month"
                      placeholder="MM"
                      role="athlete"
                      hasError={!!errors.dobMonth}
                      onChange={onChange}
                      style={{ flex: 1 }}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="dobYear"
                  render={({ field: { onChange, value } }) => (
                    <Dropdown
                      compact
                      items={YEARS}
                      value={value}
                      title="Select Year"
                      placeholder="YYYY"
                      role="athlete"
                      hasError={!!errors.dobYear}
                      onChange={onChange}
                      style={{ flex: 1.3 }}
                    />
                  )}
                />
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
              <Controller
                control={control}
                name="idType"
                render={({ field: { onChange, value } }) => (
                  <Dropdown
                    items={ID_TYPES}
                    value={value}
                    title="Select ID Type"
                    placeholder="Select ID type"
                    role="athlete"
                    hasError={!!errors.idType}
                    icon={<CreditCard size={18} color="#94A3B8" />}
                    onChange={itemValue => {
                      onChange(itemValue);
                      setValue('idNumber', '');
                      void trigger('idType');
                    }}
                  />
                )}
              />
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
                      onAccept: () => setValue('consent', true, { shouldValidate: true }),
                    })}
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
      </Screen>
  );
};

const styles = createRegisterStyles('athlete');

export default AthleteRegisterScreen;
