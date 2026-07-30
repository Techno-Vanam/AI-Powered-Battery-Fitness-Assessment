import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput,
  Animated, Alert, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform
} from 'react-native';
import { ShieldCheck, RefreshCw } from 'lucide-react-native';
import { verifyOTP, generateMockOTP, getLatestOTP } from '../../db/otpService';
import { markUserVerified } from '../../db/userRepository';

const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 300; // 5 minutes

const AthleteOtpVerifyScreen = ({ navigation, route }: any) => {
  const { local_id } = route.params ?? {};
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS);
  const [isExpired, setIsExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const storedOtp = getLatestOTP(local_id);
    const initialValue = storedOtp ?? generateMockOTP(local_id);

    console.log(`[AthleteOtp] mount -> local_id=${local_id} storedOtp=${JSON.stringify(storedOtp)} generatedOtp=${JSON.stringify(initialValue)} ts=${new Date().toISOString()}`);
    setGeneratedOtp(initialValue || '');
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    setTimeLeft(OTP_EXPIRY_SECONDS);
    setIsExpired(false);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleChange = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return;
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setError('');
    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    try {
      const newOtp = generateMockOTP(local_id);
      console.log(`[AthleteOtp] resend -> local_id=${local_id} previous=${JSON.stringify(generatedOtp)} next=${JSON.stringify(newOtp)} ts=${new Date().toISOString()}`);
      setGeneratedOtp(String(newOtp).trim());
      setTimeLeft(OTP_EXPIRY_SECONDS);
      setIsExpired(false);
      setOtp(Array(OTP_LENGTH).fill(''));
      setError('');
      inputRefs.current[0]?.focus();
    } catch {
      Alert.alert('Error', 'Could not regenerate OTP.');
    }
  };

  const handleVerify = async () => {
    const entered = String(otp.join('')).trim();
    const expected = String(getLatestOTP(local_id) ?? generatedOtp).trim();

    console.log(`[AthleteOtp] compare -> entered=${JSON.stringify(entered)} expected=${JSON.stringify(expected)} joined=${JSON.stringify(otp.join(''))}`);
    if (isExpired) {
      setError('OTP expired, please resend.');
      triggerShake();
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      return;
    }

    if (entered.length < OTP_LENGTH) return;
    if (entered !== expected) {
      setError('Incorrect OTP, please check the code shown above.');
      triggerShake();
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      return;
    }

    setLoading(true);
    setError('');
    try {
      const isValid = await verifyOTP(local_id, entered);
      if (isValid) {
        await markUserVerified(local_id);
        navigation.navigate('SetPassword', { local_id, role: 'athlete' });
      } else {
        setError('Incorrect OTP, please check the code shown above.');
        triggerShake();
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const enteredFull = otp.every(d => d !== '');

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <ShieldCheck size={32} color="#4F46E5" />
              </View>
              <Text style={styles.title}>Verify Your ID</Text>
              <Text style={styles.subtitle}>
                A one-time code has been generated for your NSRS/APAAR/Aadhar verification.
              </Text>
            </View>

            <View style={styles.otpBanner}>
              <Text style={styles.bannerLabel}>🔐 Demo OTP (Read & Re-enter Below)</Text>
              <View style={styles.otpDisplay}>
                {String(generatedOtp).split('').map((digit, i) => (
                  <View key={i} style={styles.otpDisplayBox}>
                    <Text style={styles.otpDisplayDigit}>{digit}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.bannerNote}>This OTP is displayed on-screen for offline/demo use only.</Text>
            </View>

            <Animated.View style={[styles.inputRow, { transform: [{ translateX: shakeAnim }] }]}>
              {otp.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={ref => { inputRefs.current[i] = ref; }}
                  style={[styles.otpBox, digit && styles.otpBoxFilled, error && styles.otpBoxError]}
                  value={digit}
                  onChangeText={text => handleChange(text.slice(-1), i)}
                  onKeyPress={e => handleKeyPress(e, i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  autoFocus={i === 0}
                  selectTextOnFocus
                />
              ))}
            </Animated.View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.timerRow}>
              {!isExpired ? (
                <Text style={styles.timerText}>Code expires in <Text style={styles.timerBold}>{formatTime(timeLeft)}</Text></Text>
              ) : (
                <TouchableOpacity style={styles.resendBtn} onPress={handleResend}>
                  <RefreshCw size={14} color="#4F46E5" />
                  <Text style={styles.resendText}>Resend OTP</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[styles.button, (!enteredFull || loading || isExpired) && styles.buttonDisabled]}
              onPress={handleVerify}
              disabled={!enteredFull || loading || isExpired}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>Verify & Continue</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 40 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  header: { alignItems: 'center', gap: 12, marginBottom: 4 },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#0F172A', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, paddingHorizontal: 16 },
  otpBanner: {
    width: '100%', backgroundColor: '#F0FDF4', borderWidth: 1.5,
    borderColor: '#86EFAC', borderRadius: 16, padding: 18,
    alignItems: 'center', gap: 10, borderStyle: 'dashed',
  },
  bannerLabel: { fontSize: 12, fontWeight: '700', color: '#15803D', letterSpacing: 0.5 },
  otpDisplay: { flexDirection: 'row', gap: 6 },
  otpDisplayBox: {
    width: 36, height: 44, borderRadius: 10, backgroundColor: '#DCFCE7',
    borderWidth: 1, borderColor: '#86EFAC', alignItems: 'center', justifyContent: 'center',
  },
  otpDisplayDigit: { fontSize: 22, fontWeight: '800', color: '#15803D' },
  bannerNote: { fontSize: 11, color: '#4ADE80', textAlign: 'center' },
  inputRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  otpBox: {
    width: 48, height: 58, borderRadius: 14, borderWidth: 2, borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF', fontSize: 24, fontWeight: '700', color: '#0F172A',
    textAlign: 'center',
  },
  otpBoxFilled: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  otpBoxError: { borderColor: '#EF4444', backgroundColor: '#FFF5F5' },
  errorText: { fontSize: 13, color: '#EF4444', fontWeight: '600', textAlign: 'center' },
  timerRow: { alignItems: 'center' },
  timerText: { fontSize: 13, color: '#94A3B8' },
  timerBold: { fontWeight: '700', color: '#64748B' },
  resendBtn: { flexDirection: 'row', gap: 6, alignItems: 'center', padding: 8 },
  resendText: { fontSize: 14, color: '#4F46E5', fontWeight: '700' },
  button: {
    width: '100%', height: 56, borderRadius: 14, backgroundColor: '#4F46E5',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

export default AthleteOtpVerifyScreen;
