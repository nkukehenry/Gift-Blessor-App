import React, { useState } from "react"
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
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  useColorScheme
} from "react-native"
import { api } from "../services/api"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/types"
import { Ionicons } from "@expo/vector-icons"
import { Colors, palette } from "../constants/Colors"
import { useRouter } from 'expo-router'

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>

interface SignupForm {
  phoneNumber: string
  firstName: string
  lastName: string
}

export default function SignupScreen({ navigation }: Props) {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme ?? 'light']
  const router = useRouter()
  
  const [form, setForm] = useState<SignupForm>({
    phoneNumber: "",
    firstName: "",
    lastName: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const { phoneNumber, firstName, lastName } = form
    const cleaned = phoneNumber.replace(/\D/g, '')

    if (!cleaned) {
      Alert.alert("Error", "Please enter your phone number")
      return false
    }
    if (cleaned.length < 10) {
      Alert.alert("Error", "Please enter a valid phone number")
      return false
    }
    if (!firstName.trim()) {
      Alert.alert("Error", "Please enter your first name")
      return false
    }
    if (!lastName.trim()) {
      Alert.alert("Error", "Please enter your last name")
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
    setForm(prev => ({ ...prev, phoneNumber: formatted }))
  }

  const handleSignup = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const cleanedNumber = form.phoneNumber.replace(/\D/g, '')
      const response = await api.sendOTP(cleanedNumber)
      if (response.success) {
        router.push({
          pathname: "/(auth)/otp-verification",
          params: { 
            phoneNumber: cleanedNumber,
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim()
          }
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

  const handleLogin = () => {
    router.push("/(auth)/login");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: theme.background.primary }]}
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
              <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={[styles.welcomeText, { color: theme.primary }]}>Create</Text>
              <Text style={[styles.accountText, { color: theme.text.primary }]}>account!</Text>
              <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
                Join us to start tracking your packages and get real-time shipping updates
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
                  value={form.phoneNumber}
                  onChangeText={handlePhoneNumberChange}
                  keyboardType="phone-pad"
                  maxLength={12}
                  editable={!isLoading}
                  placeholderTextColor={theme.text.secondary}
                />
              </View>

              <View style={[styles.inputContainer, { 
                backgroundColor: theme.background.primary,
                borderColor: theme.border.light 
              }]}>
                <Ionicons name="person-outline" size={20} color={theme.text.secondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text.primary }]}
                  placeholder="First Name"
                  value={form.firstName}
                  onChangeText={(text) => setForm(prev => ({ ...prev, firstName: text }))}
                  autoCapitalize="words"
                  editable={!isLoading}
                  placeholderTextColor={theme.text.secondary}
                />
              </View>

              <View style={[styles.inputContainer, { 
                backgroundColor: theme.background.primary,
                borderColor: theme.border.light 
              }]}>
                <Ionicons name="person-outline" size={20} color={theme.text.secondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text.primary }]}
                  placeholder="Last Name"
                  value={form.lastName}
                  onChangeText={(text) => setForm(prev => ({ ...prev, lastName: text }))}
                  autoCapitalize="words"
                  editable={!isLoading}
                  placeholderTextColor={theme.text.secondary}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.button, 
                  { backgroundColor: theme.primary },
                  isLoading && [styles.buttonDisabled, { opacity: 0.7 }]
                ]}
                onPress={handleSignup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={palette.white} />
                ) : (
                  <Text style={[styles.buttonText, { color: palette.white }]}>Continue</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginLink}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={[styles.loginText, { color: theme.text.secondary }]}>
                  Already have an account? <Text style={[styles.loginTextBold, { color: theme.primary }]}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
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
  loginLink: {
    marginTop: 24,
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
  },
  loginTextBold: {
    fontWeight: "600",
  },
}) 