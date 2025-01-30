import React, { useState,useEffect } from "react"
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
  useColorScheme
} from "react-native"
import { api } from "../services/api"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/types"
import { Ionicons } from "@expo/vector-icons"
import { Colors, palette } from "../constants/Colors"
import { useRouter } from 'expo-router'
import { decryptAes, encryptAes, hash512 } from '../services/cryptojs-custom/crypto-util';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>

export default function LoginScreen({ navigation }: Props) {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme ?? 'light']
  const router = useRouter()

  useEffect(()=>{

    const sessionKey = hash512("1234")

    const encrypted = encryptAes("henry",sessionKey);
    console.log('Encrypted',encrypted);
    const decrypted = decryptAes(encrypted,sessionKey)
    console.log('Decrypted',decrypted);
 
   },[])
  
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const validatePhoneNumber = () => {
    const cleaned = phoneNumber.replace(/\D/g, '')
    if (!cleaned) {
      Alert.alert("Error", "Please enter your phone number")
      return false
    }
    if (cleaned.length < 10) {
      Alert.alert("Error", "Please enter a valid phone number")
      return false
    }
    return true
  }

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '')
    let formatted = cleaned
    if (cleaned.length >= 6) {
      formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    } else if (cleaned.length >= 3) {
      formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
    }
    return formatted
  }

  const handlePhoneNumberChange = (text: string) => {
    const formatted = formatPhoneNumber(text)
    setPhoneNumber(formatted)
  }

  const handleSendOTP = async () => {
    if (!validatePhoneNumber()) return

    setIsLoading(true)
    try {
      const cleanedNumber = phoneNumber.replace(/\D/g, '')
      const response = await api.sendOTP(cleanedNumber)
      if (response.success) {
        router.push({
          pathname: "/(auth)/otp-verification",
          params: { phoneNumber: cleanedNumber }
        })
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

  const handleSignup = () => {
    router.push("/(auth)/signup")
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: theme.background.primary }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.welcomeText, { color: theme.primary }]}>Welcome</Text>
            <Text style={[styles.backText, { color: theme.text.primary }]}>back!</Text>
            <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
              Sign in to access your package history and get real-time updates on all your shipments
            </Text>
          </View>

          <View style={styles.form}>
            <View style={[styles.inputContainer, { 
              backgroundColor: theme.background.primary,
              borderColor: theme.border.light 
            }]}>
              <Ionicons name="call-outline" size={20} color={theme.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text.primary }]}
                placeholder="Phone Number"
                value={phoneNumber}
                onChangeText={handlePhoneNumberChange}
                keyboardType="phone-pad"
                maxLength={12}
                editable={!isLoading}
                autoFocus
                placeholderTextColor={theme.text.secondary}
              />
              {phoneNumber.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={() => setPhoneNumber("")}
                >
                  <Ionicons name="close-circle" size={20} color={theme.text.secondary} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.button, 
                { backgroundColor: theme.primary },
                isLoading && [styles.buttonDisabled, { opacity: 0.7 }]
              ]}
              onPress={handleSendOTP}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={palette.white} />
              ) : (
                <Text style={[styles.buttonText, { color: palette.white }]}>Continue</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signupLink}
              onPress={handleSignup}
              disabled={isLoading}
            >
              <Text style={[styles.signupText, { color: theme.text.secondary }]}>
                Don't have an account? <Text style={[styles.signupTextBold, { color: theme.primary }]}>Join Now</Text>
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
    justifyContent: "flex-start",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 120 : 80,
  },
  header: {
    marginBottom: 48,
  },
  welcomeText: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: -10,
  },
  backText: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30,
    marginBottom: 16,
    paddingHorizontal: 20,
    height: 56,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
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
  signupLink: {
    marginTop: 32,
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
  },
  signupTextBold: {
    fontWeight: "600",
  },
})

