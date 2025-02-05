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
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/types"
import { Ionicons } from "@expo/vector-icons"
import { Colors, palette } from "../constants/Colors"
import { useRouter } from 'expo-router'
import { decryptAes, encryptAes, hash512 } from '../services/cryptojs-custom/crypto-util';
import { useAuth } from '../contexts/AuthContext'
import { useModal } from '../contexts/ModalContext'
import { CountryPicker } from "react-native-country-codes-picker";

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>

export default function LoginScreen({ navigation }: Props) {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme ?? 'light']
  const router = useRouter()
  const { login, loginLoading } = useAuth()
  const { showModal } = useModal()

  useEffect(()=>{

    const sessionKey = hash512("1234")

    const encrypted = encryptAes("henry",sessionKey);
    console.log('Encrypted',encrypted);
    const decrypted = decryptAes(encrypted,sessionKey)
    console.log('Decrypted',decrypted);
 
   },[])
  
  const [phoneNumber, setPhoneNumber] = useState("")
  const [countryCode, setCountryCode] = useState('+254')
  const [show, setShow] = useState(false)

  const handleLogin = async () => {
    // Basic validation
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
      // Format phone number: remove leading zeros and add country code
      const cleanNumber = phoneNumber.replace(/^0+/, '');
      const formattedPhone = `${countryCode}${cleanNumber}`;
      console.log('Attempting login with:', formattedPhone);

      const response = await login(formattedPhone);
      console.log('Login response:', response);

      if (response.success) {
        router.push({
          pathname: '/otp-verification',
          params: { phoneNumber: formattedPhone }
        });
      } else {
        showModal({
          title: "Login Failed",
          message: response.message || "Failed to send verification code",
          type: "error",
          primaryButton: {
            text: "OK",
            onPress: () => {}
          }
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to send verification code. Please try again.";
      
      showModal({
        title: "Login Failed",
        message: errorMessage,
        type: "error",
        primaryButton: {
          text: "OK",
          onPress: () => {}
        }
      });
    }
  };

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
              <TouchableOpacity
                style={styles.countryCode}
                onPress={() => setShow(true)}
              >
                <Text style={styles.countryCodeText}>{countryCode}</Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.input, { color: theme.text.primary }]}
                placeholder="7XXXXXXXX"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={9}
                editable={!loginLoading}
                autoFocus
                placeholderTextColor={theme.text.secondary}
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
                  color: '#000'
                },
                countryMessageText: {
                  color: '#000'
                },
              }}
              searchPlaceholder="Search country"
              lang="en"
            />

            <TouchableOpacity
              style={[
                styles.button, 
                { backgroundColor: theme.primary },
                loginLoading && [styles.buttonDisabled, { opacity: 0.7 }]
              ]}
              onPress={handleLogin}
              disabled={loginLoading}
            >
              {loginLoading ? (
                <ActivityIndicator color={palette.white} />
              ) : (
                <Text style={[styles.buttonText, { color: palette.white }]}>Continue</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signupLink}
              onPress={handleSignup}
              disabled={loginLoading}
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
  countryCode: {
    height: 50,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 0,
    justifyContent: 'center',
    paddingLeft: 2,
  },
  countryCodeText: {
    fontSize: 16,
    color: '#000',
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

