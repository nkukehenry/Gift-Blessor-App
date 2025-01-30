import React, { useState, useEffect, useRef } from "react"
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  useColorScheme,
  Pressable
} from "react-native"
import { api } from "../services/api"
import { Ionicons } from "@expo/vector-icons"
import { Colors, palette } from "../constants/Colors"
import { useRouter, useLocalSearchParams } from 'expo-router'

const OTP_LENGTH = 4

export default function OTPVerificationScreen() {
  const params = useLocalSearchParams();
  const { phoneNumber, firstName, lastName } = params;
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme ?? 'light']
  const router = useRouter()
  
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    if (timeLeft === 0) return
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const handleResendOTP = async () => {
    if (timeLeft > 0) return
    setIsLoading(true)
    try {
      const response = await api.sendOTP(phoneNumber as string)
      if (response.success) {
        setTimeLeft(30)
        Alert.alert("Success", "Verification code sent successfully")
      } else {
        Alert.alert("Error", response.message || "Failed to send verification code")
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to send verification code. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== OTP_LENGTH) {
      Alert.alert("Error", "Please enter a valid 4-digit code")
      return
    }

    setIsLoading(true)
    try {
      const response = await api.verifyOTP(phoneNumber as string, otp)
      if (response.success) {
        if (firstName && lastName) {
          // This is a signup flow
          await api.createUser({
            phoneNumber: phoneNumber as string,
            firstName: firstName as string,
            lastName: lastName as string,
          })
        }
        // Navigate to tabs after successful verification
        router.replace("/(tabs)")
      } else {
        Alert.alert("Error", response.message || "Invalid verification code")
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to verify code. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPChange = (text: string) => {
    // Only allow numbers and limit to OTP_LENGTH digits
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH)
    setOtp(cleaned)
  }

  const handlePressOTPBox = () => {
    inputRef.current?.focus()
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: theme.background.primary }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.primary }]}>Enter</Text>
            <Text style={[styles.subtitle, { color: theme.text.primary }]}>verification code</Text>
            <Text style={[styles.description, { color: theme.text.secondary }]}>
              We've sent a 4-digit code to your phone number
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.otpContainer}>
              <TextInput
                ref={inputRef}
                value={otp}
                onChangeText={handleOTPChange}
                keyboardType="numeric"
                maxLength={OTP_LENGTH}
                style={styles.hiddenInput}
                autoFocus
              />
              {Array(OTP_LENGTH).fill(0).map((_, index) => (
                <Pressable 
                  key={index}
                  onPress={handlePressOTPBox}
                  style={[
                    styles.otpBox,
                    { 
                      borderColor: theme.border.light,
                      backgroundColor: theme.background.primary,
                    },
                    otp.length === index && { borderColor: theme.primary },
                  ]}
                >
                  <Text style={[styles.otpText, { color: theme.text.primary }]}>
                    {otp[index] || ''}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.button, 
                { backgroundColor: theme.primary },
                isLoading && [styles.buttonDisabled, { opacity: 0.7 }]
              ]}
              onPress={handleVerifyOTP}
              disabled={isLoading || otp.length !== OTP_LENGTH}
            >
              {isLoading ? (
                <ActivityIndicator color={palette.white} />
              ) : (
                <Text style={[styles.buttonText, { color: palette.white }]}>Verify</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.resendButton,
                timeLeft > 0 && { opacity: 0.5 }
              ]}
              onPress={handleResendOTP}
              disabled={timeLeft > 0 || isLoading}
            >
              <Text style={[styles.resendText, { color: theme.text.secondary }]}>
                {timeLeft > 0 ? (
                  `Resend code in ${timeLeft}s`
                ) : (
                  'Resend code'
                )}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  title: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: -10,
  },
  subtitle: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  form: {
    width: "100%",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
  },
  otpBox: {
    width: 70,
    height: 70,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  otpText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  button: {
    borderRadius: 30,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  resendButton: {
    marginTop: 24,
    alignItems: "center",
  },
  resendText: {
    fontSize: 14,
  },
})

