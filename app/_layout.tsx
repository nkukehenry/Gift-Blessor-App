import { useEffect } from 'react';
import { Stack, Slot } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { GroupProvider } from '../contexts/GroupContext';
import { StatusBar } from 'expo-status-bar';
import { ModalProvider } from '../contexts/ModalContext';
import { View, ActivityIndicator } from 'react-native';

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

function RootLayoutNav() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <GroupProvider>
        <ModalProvider>
          <RootLayoutNav />
          <StatusBar style="dark" />
        </ModalProvider>
      </GroupProvider>
    </AuthProvider>
  );
}
