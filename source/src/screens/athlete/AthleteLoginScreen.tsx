import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import SFSymbol from '../../components/ui/SFSymbol';
import NetInfo from '@react-native-community/netinfo';
import OfflineBadge from '../../components/auth/OfflineBadge';
import { loginUser } from '../../services/authService';
import Screen from '../../components/ui/Screen';
import AppText from '../../components/ui/AppText';
import Button from '../../components/ui/Button';
import Dropdown from '../../components/ui/Dropdown';
import { AuthHeader, AuthFooter, FormField, InputRow } from '../../components/ui/FormField';
import { createAuthStyles } from '../../styles/screenStyles';
import { colors, layout } from '../../theme';

const ID_TYPES = [
  { label: 'NSRS', value: 'NSRS' },
  { label: 'APAAR (12-digit)', value: 'APAAR' },
  { label: 'Aadhar (12-digit)', value: 'AADHAR' },
];

const idNumberSchema = (idType: string | undefined) => {
  if (idType === 'APAAR') return yup.string().matches(/^\d{12}$/, 'Enter a valid 12-digit APAAR ID').required('ID Number is required');
  if (idType === 'AADHAR') return yup.string().matches(/^\d{12}$/, 'Enter a valid 12-digit Aadhar number').required('ID Number is required');
  return yup.string().matches(/^\d{4,20}$/, 'Enter a valid NSRS number (digits only)').required('ID Number is required');
};

const schema = yup.object({
  idType: yup.string().oneOf(['NSRS', 'APAAR', 'AADHAR']).required('Please select an ID type'),
  idNumber: yup.string().when('idType', ([idType], s) => idNumberSchema(idType)),
  password: yup.string().required('Password is required').min(1),
});

type FormData = yup.InferType<typeof schema>;

const styles = createAuthStyles('athlete');

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

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: { idType: 'NSRS', idNumber: '', password: '' },
  });

  const idType = watch('idType');

  const getIdPlaceholder = () => {
    if (idType === 'APAAR') return '12-digit APAAR ID';
    if (idType === 'AADHAR') return '12-digit Aadhar Number';
    return 'NSRS Number (digits only)';
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
    <Screen scroll keyboard centered>
      <AuthHeader
        role="athlete"
        title="Welcome Back"
        subtitle="Sign in to track your performance and progress."
        badge={<OfflineBadge visible={isOffline} />}
      />

      <View style={styles.form}>
        <FormField label="ID Type" error={errors.idType?.message}>
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
                icon={<SFSymbol name="creditcard" size={layout.iconSm} color={colors.textMuted} />}
                onChange={itemValue => {
                  onChange(itemValue);
                  setValue('idNumber', '');
                }}
              />
            )}
          />
        </FormField>

        <FormField label="ID Number" error={errors.idNumber?.message}>
          <Controller
            control={control}
            name="idNumber"
            render={({ field: { onChange, value } }) => (
              <InputRow hasError={!!errors.idNumber}>
                <SFSymbol name="creditcard" size={layout.iconSm} color={colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder={getIdPlaceholder()}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={idType === 'NSRS' ? 20 : 12}
                  value={value}
                  onChangeText={onChange}
                />
              </InputRow>
            )}
          />
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <InputRow hasError={!!errors.password}>
                <SFSymbol name="lock.fill" size={layout.iconSm} color={colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Your password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPwd}
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPwd(v => !v)}>
                  {showPwd ? (
                    <SFSymbol name="eye.slash.fill" size={layout.iconSm} color={colors.textMuted} />
                  ) : (
                    <SFSymbol name="eye.fill" size={layout.iconSm} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              </InputRow>
            )}
          />
        </FormField>

        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotRow}
        >
          <AppText variant="caption" color={colors.athlete.primary} style={styles.forgotText}>
            Forgot Password?
          </AppText>
        </TouchableOpacity>

        <Button title="Login" loading={loading} role="athlete" onPress={handleSubmit(onSubmit)} />

        <AuthFooter
          text="New user?"
          linkText="Register here"
          role="athlete"
          onPress={() => navigation.navigate('AthleteRegister')}
        />
      </View>
    </Screen>
  );
};

export default AthleteLoginScreen;
