import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ShieldCheck, UserCheck, Eye, EyeOff } from 'lucide-react-native';
import NetInfo from '@react-native-community/netinfo';
import { loginUser } from '../../services/authService';
import Dropdown from '../../components/ui/Dropdown';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';

const ID_TYPES = [
  { label: 'NSRS', value: 'NSRS' },
  { label: 'APAAR (12-digit)', value: 'APAAR' },
  { label: 'Aadhar (12-digit)', value: 'AADHAR' },
];

const idNumberSchema = (idType: string | undefined) => {
  if (idType === 'APAAR')
    return yup
      .string()
      .matches(/^\d{12}$/, 'Enter a valid 12-digit APAAR ID')
      .required('ID Number is required');
  if (idType === 'AADHAR')
    return yup
      .string()
      .matches(/^\d{12}$/, 'Enter a valid 12-digit Aadhar number')
      .required('ID Number is required');
  return yup
    .string()
    .matches(/^\d{4,20}$/, 'Enter a valid NSRS number (digits only)')
    .required('ID Number is required');
};

const schema = yup.object({
  idType: yup.string().oneOf(['NSRS', 'APAAR', 'AADHAR']).required('Please select an ID type'),
  idNumber: yup.string().when('idType', ([idType], s) => idNumberSchema(idType)),
  password: yup.string().required('Password is required').min(1),
});

type FormData = yup.InferType<typeof schema>;

const AthleteLoginScreen = ({ navigation }: any) => {
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected || !state.isInternetReachable);
    });
    return () => unsubscribe();
  }, []);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: { idType: 'NSRS', idNumber: '', password: '' },
  });

  const idType = watch('idType');

  const getIdPlaceholder = () => {
    if (idType === 'APAAR') return 'e.g. 12-digit APAAR ID';
    if (idType === 'AADHAR') return 'e.g. 12-digit Aadhar Number';
    return 'e.g. NSRS-2026-1001';
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await loginUser(data.idType ?? 'NSRS', data.idNumber ?? '', data.password, 'athlete');
      navigation.reset({ index: 0, routes: [{ name: 'AthleteHome' }] });
    } catch (e: any) {
      Alert.alert('Login Failed', e.message || 'Invalid ID or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <View style={styles.headerBox}>
          <View style={styles.iconCircle}>
            <UserCheck size={36} color={colors.primary} />
          </View>
          <Text style={styles.title}>Athlete Portal Login</Text>
          <Text style={styles.subtitle}>Enter your NSRS / APAAR / Aadhaar credentials</Text>
        </View>

        <View style={styles.formGroup}>
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
                onChange={itemValue => {
                  onChange(itemValue);
                  setValue('idNumber', '');
                }}
              />
            )}
          />
          {errors.idType && <Text style={styles.errorText}>{errors.idType.message}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>NSRS / APAAR / Aadhaar ID</Text>
          <Controller
            control={control}
            name="idNumber"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.idNumber && styles.inputError]}
                value={value}
                onChangeText={onChange}
                placeholder={getIdPlaceholder()}
                placeholderTextColor={colors.textTertiary}
                keyboardType="number-pad"
                maxLength={idType === 'NSRS' ? 20 : 12}
                autoCapitalize="characters"
              />
            )}
          />
          {errors.idNumber && <Text style={styles.errorText}>{errors.idNumber.message}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter password"
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry={!showPwd}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPwd(v => !v)}
                  activeOpacity={0.7}
                >
                  {showPwd ? (
                    <EyeOff size={20} color={colors.textTertiary} />
                  ) : (
                    <Eye size={20} color={colors.textTertiary} />
                  )}
                </TouchableOpacity>
              </View>
            )}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.forgotBtn}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginBtnText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>New user? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('AthleteRegister')}>
            <Text style={styles.registerLink}>Register as Athlete</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.securityFooter}>
          <ShieldCheck size={16} color={colors.success} style={{ marginRight: 6 }} />
          <Text style={styles.securityText}>Official MYAS / SAI Assessment Protocol</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.buttonRadius,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.error,
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  loginBtn: {
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: layout.buttonRadius,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  registerText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  securityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

export default AthleteLoginScreen;
