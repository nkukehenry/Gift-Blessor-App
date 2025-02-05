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
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/types"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from '../constants/Colors'
import { useRouter } from 'expo-router'
import { useAuth } from '../contexts/AuthContext'
import { useModal } from '../contexts/ModalContext'

import { CountryPicker } from "react-native-country-codes-picker"

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>

export default function SignupScreen({ navigation }: Props) {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme ?? 'light']
  const router = useRouter()
  const { signup, signupLoading } = useAuth()
  const { showModal } = useModal()
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+256');
  const [show, setShow] = useState(false);

  const handleSignup = async () => {
    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      showModal({
        title: "Validation Error",
        message: "Please enter your full name",
        type: "error",
        primaryButton: {
          text: "OK",
          onPress: () => {}
        }
      });
      return;
    }

    if (!phoneNumber || phoneNumber.length < 9) {
      showModal({
        title: "Validation Error",
        message: "Please enter a valid phone number",
        type: "error",
        primaryButton: {
          text: "OK",
          onPress: () => {}
        }
      });
      return;
    }

    try {
      const cleanNumber = phoneNumber.replace(/^0+/, '');
      const formattedPhone = `${countryCode}${cleanNumber}`;
      console.log('Attempting signup with:', { firstName, lastName, phoneNumber: formattedPhone });

      const response = await signup({
        firstName,
        lastName,
        phoneNumber: formattedPhone
      });

      if (response.success) {
        router.push({
          pathname: '/otp-verification',
          params: { 
            phoneNumber: formattedPhone,
            firstName,
            lastName
          }
        });
      } else {
        showModal({
          title: "Signup Failed",
          message: response.message || "Failed to create account",
          type: "error",
          primaryButton: {
            text: "OK",
            onPress: () => {}
          }
        });
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to create account. Please try again.";
      
      showModal({
        title: "Signup Failed",
        message: errorMessage,
        type: "error",
        primaryButton: {
          text: "OK",
          onPress: () => {}
        }
      });
    }
  };

  const handleLogin = () => {
    router.push("/(auth)/login");
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
              <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={[styles.welcomeText, { color: theme.text.primary }]}>Create</Text>
              <Text style={[styles.accountText, { color: theme.primary}]}>account!</Text>
              <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
                Join us to start tracking your packages and get real-time shipping updates
              </Text>
            </View>

            <View style={styles.form}>
              <View style={[styles.inputContainer, { borderColor: theme.border.dark }]}>
                <Ionicons name="person-outline" size={20} color={theme.text.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text.primary}]}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First name"
                  placeholderTextColor={theme.border.dark}
                  autoCapitalize="words"
                />
              </View>

              <View style={[styles.inputContainer, { borderColor: theme.border.dark }]}>
                <Ionicons name="person-outline" size={20} color={theme.text.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text.primary}]}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last name"
                  placeholderTextColor={theme.border.dark}
                  autoCapitalize="words"
                />
              </View>

              <View style={[styles.inputContainer, { borderColor: theme.border.dark }]}>
                <TouchableOpacity 
                  style={[styles.countryCode, { borderRightColor: theme.border.dark }]}
                  onPress={() => setShow(true)}

                >
                  <Text style={[styles.countryCodeText, { color: theme.text.primary }]}>{countryCode}</Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.input, { color: theme.text.primary,paddingLeft:8}]}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="7XXXXXXXX"
                  placeholderTextColor={theme.border.dark}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  maxLength={9}
                />
              </View>

              <CountryPicker
                show={show}
                pickerButtonOnPress={(item) => {
                  setCountryCode(item.dial_code);
                  setShow(false);
                }}
                onBackdropPress={() => setShow(false)}
                style={{
                  modal: {
                    height: 500,
                  },
                  countryButtonStyles: {
                    height: 50,
                  },
                  searchMessageText: {
                    color: theme.text
                  },
                  countryMessageText: {
                    color: theme.text
                  },
                }}
                searchPlaceholder="Search country"
                lang="en"
              />

              <TouchableOpacity 
                style={[
                  styles.button, 
                  { backgroundColor: theme.primary,},
                  signupLoading && styles.buttonDisabled
                ]}

                onPress={handleSignup}
                disabled={signupLoading}
              >
                {signupLoading ? (
                  <ActivityIndicator color={theme.background} />
                ) : (
                  <Text style={[styles.buttonText, { color: theme.background.primary }]}>Sign up</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.text.secondary }]}>
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity onPress={handleLogin}>
                  <Text style={[styles.footerLink, { color: theme.primary }]}>
                    Sign in
                  </Text>
                </TouchableOpacity>
              </View>
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
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 25,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginLeft: 15,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    paddingRight: 15,
  },
  countryCode: {
    paddingHorizontal: 15,
    height: '100%',
    justifyContent: 'center',
    borderRightWidth: 1,
  },
  countryCodeText: {
    fontSize: 16,
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
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '500',
  },
}) 