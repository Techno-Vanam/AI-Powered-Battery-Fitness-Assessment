import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Modal
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CreditCard, Lock, Eye, EyeOff, ChevronDown, AlertCircle, Check } from 'lucide-react-native';
import NetInfo from '@react-native-community/netinfo';
import OfflineBadge from '../../components/auth/OfflineBadge';
import { loginUser } from '../../services/authService';

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
  idNumber: yup.string().when('idType', ([idType], schema) => idNumberSchema(idType)),
  password: yup.string().required('Password is required').min(1),
});

type FormData = yup.InferType<typeof schema>;

const PickerModal = ({ visible, items, selected, onSelect, onClose }: any) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalSheet}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select ID Type</Text>
          <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>Done</Text></TouchableOpacity>
        </View>
        <ScrollView>
          {items.map((item: any) => (
            <TouchableOpacity key={item.value} style={styles.modalItem} onPress={() => { onSelect(item.value); onClose(); }}>
              <Text style={[styles.modalItemText, selected === item.value && styles.modalItemSelected]}>{item.label}</Text>
              {selected === item.value && <Check size={18} color="#7C3AED" />}
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

const CoachLoginScreen = ({ navigation }: any) => {
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);

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
      await loginUser(data.idType ?? 'NSRS', data.idNumber ?? '', data.password, 'coach');
      navigation.reset({ index: 0, routes: [{ name: 'CoachHome' }] });
    } catch (e: any) {
      Alert.alert('Login Failed', e.message || 'Invalid ID or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.rolePill}><Text style={styles.roleText}>Logging in as Coach</Text></View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to manage your athletes and sessions.</Text>
            <OfflineBadge visible={isOffline} />
          </View>

          <View style={styles.form}>
            <View style={styles.group}>
              <Text style={styles.label}>ID Type</Text>
              <TouchableOpacity
                style={[styles.inputRow, errors.idType && styles.inputError]}
                onPress={() => setPickerVisible(true)}
              >
                <CreditCard size={18} color="#94A3B8" />
                <Text style={[styles.input, { paddingVertical: 0, color: '#0F172A', fontWeight: '600' }]}>
                  {ID_TYPES.find(t => t.value === idType)?.label || 'Select ID Type'}
                </Text>
                <ChevronDown size={18} color="#94A3B8" />
              </TouchableOpacity>
              <FieldError message={errors.idType?.message} />
            </View>

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

            <View style={styles.group}>
              <Text style={styles.label}>Password</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <View style={[styles.inputRow, errors.password && styles.inputError]}>
                    <Lock size={18} color="#94A3B8" />
                    <TextInput
                      style={styles.input}
                      placeholder="Your password"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showPwd}
                      value={value}
                      onChangeText={onChange}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowPwd(v => !v)}>
                      {showPwd ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
                    </TouchableOpacity>
                  </View>
                )}
              />
              <FieldError message={errors.password?.message} />
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotRow}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>Login</Text>}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>New user?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('CoachRegister')}>
                <Text style={styles.footerLink}> Register here</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <PickerModal
        visible={pickerVisible}
        items={ID_TYPES}
        selected={idType}
        onSelect={(val: string) => { setValue('idType', val as any); setValue('idNumber', ''); }}
        onClose={() => setPickerVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24, paddingBottom: 40, justifyContent: 'center' },
  header: { marginBottom: 32, gap: 10 },
  rolePill: {
    alignSelf: 'flex-start', backgroundColor: '#F5F3FF', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  roleText: { fontSize: 12, fontWeight: '700', color: '#7C3AED' },
  title: { fontSize: 28, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 15, color: '#64748B', lineHeight: 22 },
  form: { gap: 18 },
  group: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: '#334155', letterSpacing: 0.3 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 14, paddingHorizontal: 14, height: 52,
  },
  inputError: { borderColor: '#FCA5A5', backgroundColor: '#FFF5F5' },
  input: { flex: 1, fontSize: 15, color: '#0F172A', paddingVertical: 0 },
  forgotRow: { alignItems: 'flex-end', marginTop: -6 },
  forgotText: { fontSize: 13, color: '#7C3AED', fontWeight: '700' },
  button: {
    height: 56, borderRadius: 14, backgroundColor: '#7C3AED',
    justifyContent: 'center', alignItems: 'center', marginTop: 4,
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
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

export default CoachLoginScreen;
