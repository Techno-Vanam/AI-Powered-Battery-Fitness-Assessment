import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CreditCard, Search, AlertCircle, Info } from 'lucide-react-native';
import { getUserByIdentifier } from '../../db/userRepository';
import Screen from '../../components/ui/Screen';
import AppText from '../../components/ui/AppText';
import Button from '../../components/ui/Button';
import Dropdown from '../../components/ui/Dropdown';
import { FormField, InputRow } from '../../components/ui/FormField';
import { createRegisterStyles } from '../../styles/screenStyles';
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
  idNumber: yup.string().when('idType', ([idType]) => idNumberSchema(idType)),
});

type FormData = yup.InferType<typeof schema>;

const styles = createRegisterStyles('athlete');

const ForgotPasswordScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: { idType: 'NSRS', idNumber: '' },
  });

  const idType = watch('idType');

  const getIdPlaceholder = () => {
    if (idType === 'APAAR') return '12-digit APAAR ID';
    if (idType === 'AADHAR') return '12-digit Aadhar Number';
    return 'NSRS Number (digits only)';
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setNotFound(false);
    try {
      const user = await getUserByIdentifier(data.idType ?? 'NSRS', data.idNumber ?? '');
      if (user) {
        navigation.navigate('ResetPassword', { local_id: user.local_id });
        return;
      }
      setNotFound(true);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll keyboard centered fill>
      <View style={styles.headerCentered}>
        <View style={styles.iconCircle}>
          <Search size={layout.iconMd + 4} color={colors.athlete.primary} />
        </View>
        <AppText variant="h2" style={{ textAlign: 'center' }}>
          Forgot Password?
        </AppText>
        <AppText variant="bodySm" color={colors.textSecondary} style={{ textAlign: 'center' }}>
          Enter the ID you used during registration. If we find your account, you can reset your password immediately — no OTP needed.
        </AppText>
      </View>

      <View style={styles.infoBox}>
        <Info size={layout.iconSm - 2} color="#3B82F6" />
        <AppText variant="caption" color="#1D4ED8" style={styles.infoText}>
          No SMS is sent. If your ID is found in the database, you'll be taken directly to a password reset screen.
        </AppText>
      </View>

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
                icon={<CreditCard size={layout.iconSm} color={colors.textMuted} />}
                onChange={itemValue => {
                  onChange(itemValue);
                  setValue('idNumber', '');
                  setNotFound(false);
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
              <InputRow hasError={!!errors.idNumber || notFound}>
                <CreditCard size={layout.iconSm} color={colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder={getIdPlaceholder()}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={idType === 'NSRS' ? 20 : 12}
                  value={value}
                  onChangeText={v => { onChange(v); setNotFound(false); }}
                />
              </InputRow>
            )}
          />
          {notFound && (
            <View style={styles.errorRow}>
              <AlertCircle size={12} color={colors.error} />
              <AppText variant="caption" color={colors.error}>
                No account found with this ID.
              </AppText>
            </View>
          )}
        </FormField>

        <Button
          title="Check & Reset Password"
          role="athlete"
          loading={loading}
          onPress={handleSubmit(onSubmit)}
        />

        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()}>
          <AppText variant="bodySm" color={colors.textSecondary}>
            Back to Login
          </AppText>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

export default ForgotPasswordScreen;
