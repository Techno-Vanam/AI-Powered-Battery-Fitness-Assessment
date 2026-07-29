import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { ShieldAlert, RefreshCw } from 'lucide-react-native';

interface AthleteOtpVerifyScreenProps {
  navigation: any;
  route: any;
}

const AthleteOtpVerifyScreen: React.FC<AthleteOtpVerifyScreenProps> = ({ navigation, route }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [mockOtp, setMockOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const generateMockOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setMockOtp(code);
    setTimer(30);
  };

  useEffect(() => {
    generateMockOtp();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp === mockOtp) {
      navigation.navigate('SetPassword');
    } else {
      Alert.alert('Incorrect OTP', 'Please check the code shown above and try again.');
    }
  };

  const formatTime = () => {
    const mins = Math.floor(timer / 60);
    const secs = timer % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Verify Your Identity</Text>
            <Text style={styles.subtitle}>Enter the 6-digit OTP to continue.</Text>
          </View>

          {/* Dev/Demo Aid - Mock OTP Banner */}
          <View style={styles.mockBanner}>
            <View style={styles.mockBannerHeader}>
              <ShieldAlert size={16} color="#B45309" />
              <Text style={styles.mockBannerTitle}>DEMO ENVIRONMENT</Text>
            </View>
            <Text style={styles.mockBannerText}>Your mock OTP is: <Text style={styles.mockOtpCode}>{mockOtp.split('').join(' ')}</Text></Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={el => inputRefs.current[index] = el}
                style={[styles.otpInput, digit.length > 0 && styles.otpInputFilled]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.button, otp.join('').length < 6 && styles.buttonDisabled]} 
            onPress={handleVerify}
            disabled={otp.join('').length < 6}
          >
            <Text style={styles.buttonText}>Verify OTP</Text>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.timerText}>{formatTime()}</Text>
            <TouchableOpacity 
              style={[styles.resendButton, timer > 0 && styles.resendButtonDisabled]}
              onPress={generateMockOtp}
              disabled={timer > 0}
            >
              <RefreshCw size={16} color={timer > 0 ? '#94A3B8' : '#4F46E5'} style={styles.resendIcon} />
              <Text style={[styles.resendText, timer > 0 && styles.resendTextDisabled]}>Resend OTP</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748B', lineHeight: 24 },
  mockBanner: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  mockBannerHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  mockBannerTitle: { fontSize: 12, fontWeight: 'bold', color: '#B45309', letterSpacing: 1 },
  mockBannerText: { fontSize: 16, color: '#92400E' },
  mockOtpCode: { fontWeight: 'bold', fontSize: 20, letterSpacing: 4 },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32, gap: 8 },
  otpInput: {
    flex: 1,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0F172A',
  },
  otpInputFilled: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  button: { backgroundColor: '#4F46E5', borderRadius: 12, height: 56, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  buttonDisabled: { backgroundColor: '#A5B4FC' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  resendContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timerText: { fontSize: 16, color: '#64748B', fontWeight: '500' },
  resendButton: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  resendButtonDisabled: { opacity: 0.6 },
  resendIcon: { marginRight: 6 },
  resendText: { fontSize: 16, color: '#4F46E5', fontWeight: '600' },
  resendTextDisabled: { color: '#94A3B8' },
});

export default AthleteOtpVerifyScreen;
