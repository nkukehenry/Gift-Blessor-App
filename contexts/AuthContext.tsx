import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, usersAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  loginLoading: boolean;
  signupLoading: boolean;
  otpLoading: boolean;
  login: (phoneNumber: string) => Promise<any>;
  verifyOTP: (phoneNumber: string, otp: string) => Promise<any>;
  signup: (data: { phoneNumber: string; firstName: string; lastName: string }) => Promise<any>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'userToken';
const USER_KEY = 'userData';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/(tabs)');
      } else if (segments[0] !== '(auth)') {
        router.replace('/(auth)/login');
      }
    }
  }, [user, loading, segments]);

  const checkAuth = async () => {
    try {
      const [token, userData] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY)
      ]);
      
      console.log('Checking auth token:', token);
      console.log('Checking cached user:', userData);
      
      if (token && userData) {
        authAPI.setToken(token);
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (phoneNumber: string) => {
    try {
      setLoginLoading(true);
      const response = await authAPI.login(phoneNumber);
      return response;
    } finally {
      setLoginLoading(false);
    }
  };

  const verifyOTP = async (data: { phoneNumber: string; otp: string }) => {
    setOtpLoading(true);
    try {
      const payload = {
        phoneNumber: data.phoneNumber,
        otp: data.otp
      };

      const response = await authAPI.verifyOTP(payload);
      console.log('OTP verification response:', response);

      if (response.success && response.token) {
        await Promise.all([
          AsyncStorage.setItem(TOKEN_KEY, response.token),
          AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user))
        ]);
        
        authAPI.setToken(response.token);
        setUser(response.user);
        return { success: true };
      }
      
      throw new Error(response.message || 'Verification failed');
    } catch (error: any) {
      console.error('OTP verification error:', error);
      if (error.response?.status === 401) {
        await Promise.all([
          AsyncStorage.removeItem(TOKEN_KEY),
          AsyncStorage.removeItem(USER_KEY)
        ]);
      }
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Verification failed'
      };
    } finally {
      setOtpLoading(false);
    }
  };

  const signup = async (data: { phoneNumber: string; firstName: string; lastName: string }) => {
    try {
      setSignupLoading(true);
      const response = await authAPI.signup(data);
      return response;
    } finally {
      setSignupLoading(false);
    }
  };

  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY)
      ]);
      authAPI.clearToken();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginLoading,
        signupLoading,
        otpLoading,
        login,
        verifyOTP,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}