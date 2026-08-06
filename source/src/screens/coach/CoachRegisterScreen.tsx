import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  Alert, ActivityIndicator
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  User, Phone, CreditCard, CheckSquare, Square,
  AlertCircle, Briefcase, ArrowRight, Building2
} from 'lucide-react-native';
import { registerUser } from '../../services/authService';
import { createRegisterStyles } from '../../styles/screenStyles';
import Screen from '../../components/ui/Screen';
import Dropdown from '../../components/ui/Dropdown';
import DobPickerBox from '../../components/DobPickerBox';

const ID_TYPES = [
  { label: 'NSRS', value: 'NSRS' },
  { label: 'APAAR (12-digit)', value: 'APAAR' },
  { label: 'Aadhar (12-digit)', value: 'AADHAR' },
];

const idTypeSchema = (idType: string | undefined) => {
  if (idType === 'APAAR') return yup.string().matches(/^\d{12}$/, 'Enter a valid 12-digit APAAR ID').required();
  if (idType === 'AADHAR') return yup.string().matches(/^\d{12}$/, 'Enter a valid 12-digit Aadhar number').required();
  return yup.string().matches(/^\d{4,20}$/, 'Enter a valid NSRS number (digits only)').required();
};

const schema = yup.object({
  coachName: yup
    .string()
    .transform(value => (typeof value === 'string' ? value.trim() : value))
    .required('Please enter a valid name')
    .matches(/^[A-Za-z.\s'-]+$/, 'Please enter a valid name')
    .min(2, 'Please enter a valid name')
    .max(50, 'Please enter a valid name'),
  organizationName: yup.string().min(2, 'Please enter your organization name').required('Please enter your organization name'),
  designation: yup
    .string()
    .oneOf(['coach', 'pe_teacher', 'tidc', 'tizc'], 'Please select a designation')
    .required('Please select a designation'),
  dobDay: yup.string().optional(),
  dobMonth: yup.string().optional(),
  dobYear: yup.string().optional(),
  gender: yup.string().required('Please select a gender'),
  phone: yup
    .string()
    .optional()
    .test('phone-format', 'Enter a valid 10-digit phone number', val => {
      if (!val || val === '') return true;
      return /^[6-9]\d{9}$/.test(val);
    }),
  idType: yup.string().oneOf(['NSRS', 'APAAR', 'AADHAR'], 'Please select an ID type').required('Please select an ID type'),
  idNumber: yup.string().when('idType', ([idType]) => idTypeSchema(idType)),
  consent: yup.boolean().oneOf([true], 'Please accept the Terms & Conditions to continue').required(),
});

type FormData = yup.InferType<typeof schema>;

const DESIGNATIONS = [
  { label: 'Coach', value: 'coach' },
  { label: 'PE Teacher', value: 'pe_teacher' },
  { label: 'TIDC', value: 'tidc' },
  { label: 'TIZC', value: 'tizc' },
];

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? (
    <View style={styles.errorRow}>
      <AlertCircle size={12} color="#EF4444" />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  ) : null;

const CoachRegisterScreen = ({ navigation }: any) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<FormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema) as any,
    defaultValues: {
      coachName: '', organizationName: '', designation: undefined as any,
      dobDay: '', dobMonth: '', dobYear: '', gender: '',
      phone: '', idType: 'NSRS', idNumber: '', consent: false,
    },
  });

  const idType = watch('idType');
  const consent = watch('consent');
  const gender = watch('gender');
  const dobDay = watch('dobDay');
  const dobMonth = watch('dobMonth');
  const dobYear = watch('dobYear');

  const getIdPlaceholder = (type: string) => {
    if (type === 'APAAR') return '12-digit APAAR ID';
    if (type === 'AADHAR') return '12-digit Aadhar Number';
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

  const onInvalid = (errs: any) => {
    const firstKey = Object.keys(errs)[0];
    const firstError = errs[firstKey]?.message || 'Please fill in all required fields.';
    Alert.alert('Validation Error', firstError);
  };

  const handleNextStep = async () => {
    const fieldsToValidate: Array<keyof FormData> = ['coachName', 'organizationName', 'gender', 'phone'];
    if (dobDay || dobMonth || dobYear) {
      fieldsToValidate.push('dobDay', 'dobMonth', 'dobYear');
    }

    const isValidStep1 = await trigger(fieldsToValidate);
    if (isValidStep1) {
      setStep(2);
    } else {
      Alert.alert('Incomplete Form', 'Please fix errors in Step 1 before proceeding.');
    }
  };

  const onSubmit = useCallback(async (data: FormData) => {
    setLoading(true);
    try {
      const dob = data.dobDay && data.dobMonth && data.dobYear ? `${data.dobYear}-${data.dobMonth}-${data.dobDay}` : undefined;
      const { local_id, otp } = await registerUser({
        role: 'coach',
        full_name: data.coachName,
        dob,
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
      <Screen scroll keyboard fill>
          <View style={styles.header}>
            <Text style={styles.title}>Coach Registration</Text>
            <Text style={styles.subtitle}>Register as a coach or physical educator.</Text>
          </View>

            {/* Step Indicator */}
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

          <View style={styles.form}>
            {/* PAGE 1: Personal Info (Until Mobile Number) */}
            {step === 1 && (
              <>
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

                {/* Organization / School Name */}
                <View style={styles.group}>
                  <Text style={styles.label}>Organization / School</Text>
                  <Controller
                    control={control}
                    name="organizationName"
                    render={({ field: { onChange, value } }) => (
                      <View style={[styles.inputRow, errors.organizationName && styles.inputError]}>
                        <Building2 size={18} color="#94A3B8" />
                        <TextInput
                          style={styles.input}
                          placeholder="e.g. Sports Academy / School Name"
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

                {/* Date of Birth Box Module */}
                <DobPickerBox
                  dobDay={dobDay || ''}
                  dobMonth={dobMonth || ''}
                  dobYear={dobYear || ''}
                  onSelectDate={(d, m, y) => {
                    setValue('dobDay', d, { shouldValidate: true, shouldDirty: true });
                    setValue('dobMonth', m, { shouldValidate: true, shouldDirty: true });
                    setValue('dobYear', y, { shouldValidate: true, shouldDirty: true });
                    void trigger(['dobDay', 'dobMonth', 'dobYear']);
                  }}
                  error={errors.dobDay?.message || errors.dobMonth?.message || errors.dobYear?.message}
                />

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

                {/* Phone Number (Last Field of Page 1) */}
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

            {/* PAGE 2: Verification (Designation, ID, Consent) */}
            {step === 2 && (
              <>
                {/* Designation */}
                <View style={styles.group}>
                  <Text style={styles.label}>Designation</Text>
                  <Controller
                    control={control}
                    name="designation"
                    render={({ field: { onChange, value } }) => (
                      <Dropdown
                        items={DESIGNATIONS}
                        value={value}
                        title="Select Designation"
                        placeholder="Select designation"
                        role="coach"
                        hasError={!!errors.designation}
                        icon={<Briefcase size={18} color="#94A3B8" />}
                        onChange={itemValue => {
                          onChange(itemValue);
                          void trigger('designation');
                        }}
                      />
                    )}
                  />
                  <FieldError message={errors.designation?.message} />
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
                        role="coach"
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
                          placeholder={getIdPlaceholder(idType)}
                          placeholderTextColor="#94A3B8"
                          keyboardType={idType === 'NSRS' ? 'default' : 'number-pad'}
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
                        ? <CheckSquare size={24} color="#7C3AED" />
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

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.button, (loading || !consent) && styles.buttonDisabled]}
                  onPress={handleSubmit(onSubmit as any, onInvalid)}
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
              <TouchableOpacity onPress={() => navigation.navigate('CoachLogin')}>
                <Text style={styles.footerLink}> Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
      </Screen>
  );
};

const styles = createRegisterStyles('coach');

export default CoachRegisterScreen;
