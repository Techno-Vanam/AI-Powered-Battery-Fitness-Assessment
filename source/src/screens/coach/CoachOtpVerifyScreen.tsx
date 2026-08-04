import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';

const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 300;

interface CoachOtpVerifyScreenProps {
  route?: any;
  navigation?: any;
  onVerifySuccess?: () => void;
  onBack?: () => void;
}

export const CoachOtpVerifyScreen: React.FC<CoachOtpVerifyScreenProps> = ({
  route,
  navigation,
  onVerifySuccess,
  onBack,
}) => {
  const local_id = route?.params?.local_id ?? 'coach-1';
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS);
  const [isExpired, setIsExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }
    const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleChangeText = (text: string, index: number) => {
    setError('');
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < OTP_LENGTH) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (onVerifySuccess) {
        onVerifySuccess();
      } else if (navigation?.replace) {
        navigation.replace('CoachHome');
      }
    }, 800);
  };

  const handleResend = () => {
    setTimeLeft(OTP_EXPIRY_SECONDS);
    setIsExpired(false);
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    Alert.alert('OTP Resent', 'A new 6-digit verification code has been sent to your mobile number.');
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => (onBack ? onBack() : navigation?.goBack?.())}
          >
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerBox}>
            <View style={styles.iconCircle}>
              <ShieldCheck size={36} color={colors.primary} />
            </View>
            <Text style={styles.title}>Verify OTP Code</Text>
            <Text style={styles.subtitle}>
              Enter 6-digit verification code sent to your registered mobile number
            </Text>
          </View>

          {/* 6-Digit OTP Input Row */}
          <View style={styles.otpRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={ref => (inputRefs.current[i] = ref)}
                style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                keyboardType="numeric"
                maxLength={1}
                value={digit}
                onChangeText={text => handleChangeText(text, i)}
                onKeyPress={e => handleKeyPress(e, i)}
              />
            ))}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Timer & Resend */}
          <View style={styles.timerRow}>
            <Text style={styles.timerText}>
              {isExpired ? 'Code expired' : `Code expires in ${timeFormatted}`}
            </Text>

            <TouchableOpacity
              disabled={!isExpired}
              onPress={handleResend}
              style={[styles.resendBtn, !isExpired && styles.resendDisabled]}
            >
              <RefreshCw size={14} color={isExpired ? colors.primary : colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[styles.resendText, isExpired && styles.resendTextActive]}>Resend OTP</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.verifyBtn, loading && styles.btnDisabled]}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.verifyBtnText}>Verify & Proceed</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  backBtn: {
    paddingVertical: 8,
    marginBottom: 16,
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
    lineHeight: 20,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpBox: {
    width: 46,
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: layout.buttonRadius, // 12px
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  otpBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  timerText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendDisabled: {
    opacity: 0.5,
  },
  resendText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  resendTextActive: {
    color: colors.primary,
  },
  verifyBtn: {
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: layout.buttonRadius, // 12px
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.7,
  },
  verifyBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default CoachOtpVerifyScreen;
