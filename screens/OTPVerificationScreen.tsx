import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  useColorScheme
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { Colors } from '../constants/Colors';
import { authAPI } from '@/services/api';

export default function OTPVerificationScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { verifyOTP, otpLoading } = useAuth();
  const { showModal } = useModal();
  const params = useLocalSearchParams();

  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
    } else {
      const timerId = setTimeout(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    }
  }, [timer]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (index: number) => {
    if (!otp[index] && index > 0) {
      // If current input is empty and backspace is pressed, focus previous input
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    } else {
      // Clear current input
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 4) {
      showModal({
        title: "Validation Error",
        message: "Please enter the complete verification code",
        type: "error",
        primaryButton: {
          text: "OK",
          onPress: () => {}
        }
      });
      return;
    }

    try {
      const response = await verifyOTP({
        phoneNumber: params.phoneNumber as string,
        otp: otpString
      });

      if (response.success) {
        authAPI.setToken(response.data.token);
        router.replace('/(tabs)');
      } else {
        showModal({
          title: "Verification Failed",
          message: response.message || "Invalid verification code",
          type: "error",
          primaryButton: {
            text: "OK",
            onPress: () => {}
          }
        });
      }
    } catch (error: any) {
      showModal({
        title: "Verification Error",
        message: error.message || "Failed to verify code",
        type: "error",
        primaryButton: {
          text: "OK",
          onPress: () => {}
        }
      });
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      const response = await authAPI.resendOTP(params.phoneNumber as string);
      if (response.success) {
        setTimer(30);
        setCanResend(false);
        showModal({
          title: "Success",
          message: "Verification code sent successfully",
          type: "success",
          primaryButton: {
            text: "OK",
            onPress: () => {}
          }
        });
      } else {
        showModal({
          title: "Failed to Resend",
          message: response.message || "Failed to send verification code",
          type: "error",
          primaryButton: {
            text: "OK",
            onPress: () => {}
          }
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to send verification code. Please try again.";
      
      showModal({
        title: "Failed to Resend",
        message: errorMessage,
        type: "error",
        primaryButton: {
          text: "OK",
          onPress: () => {}
        }
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: theme.background }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={[styles.welcomeText, { color: theme.primary }]}>Verify</Text>
              <Text style={[styles.accountText, { color: theme.text.primary }]}>Login Session!</Text>
              <Text style={[styles.subtitle, { color: theme.text.gray }]}>
                Enter the 4-digit code sent to {params.phoneNumber}
              </Text>
            </View>


            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => inputRefs.current[index] = ref}
                  style={[
                    styles.otpInput,
                    { borderWidth: 1,
                      borderColor: theme.gray.dark,
                      color: theme.text.primary,
                      backgroundColor: theme.gray.dark
                    }

                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(index, value)}
                  keyboardType="number-pad"
                  maxLength={1}


                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === 'Backspace') {
                      handleBackspace(index);
                    }
                  }}
                />
              ))}
            </View>

            <TouchableOpacity 
              style={[
                styles.button,
                { backgroundColor: theme.primary },
                otpLoading && styles.buttonDisabled
              ]}
              onPress={handleVerify}
              disabled={otpLoading || otp.some(digit => !digit)}
            >
              {otpLoading ? (
                <ActivityIndicator color={theme.primary} />
              ) : (
                <Text style={[styles.buttonText, { color: theme.background.primary }]}>
                  Verify
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                Didn't receive code?{' '}
              </Text>
              {canResend ? (
                <TouchableOpacity onPress={handleResend}>
                  <Text style={[styles.footerLink, { color: theme.tint }]}>
                    Resend
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={[styles.timerText, { color: theme.textSecondary }]}>
                  {timer}s
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginBottom: 24,
  },
  header: {
    marginBottom: 48,
  },
  welcomeText: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: -10,
  },
  accountText: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '500',
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '500',
  },
  timerText: {
    fontSize: 14,
    fontWeight: '500',
  },
});