import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { AuthProvider } from '../contexts/AuthContext';
import { GroupProvider } from '../contexts/GroupContext';
import { StatusBar } from 'expo-status-bar';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.background.primary,
        },
        animation: 'slide_from_right',
      }}
    >
      {/* Initial Route */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* Auth Group */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      
      {/* Main Screens */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(modals)/create-group" options={{ presentation: 'modal' }} />
      <Stack.Screen name="(modals)/group/[id]" />
      <Stack.Screen name="(modals)/group-settings/[id]" options={{ presentation: 'modal' }} />

      {/* Profile Screens */}
      <Stack.Screen name="(modals)/profile/[id]" />
      <Stack.Screen name="(modals)/edit-profile" options={{ presentation: 'modal' }} />

      {/* Wishlist Screens */}
      <Stack.Screen name="(modals)/create-wishlist" options={{ presentation: 'modal' }} />
      <Stack.Screen name="(modals)/wishlist/[id]" />
      <Stack.Screen name="(modals)/wishlist/edit/[id]" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <GroupProvider>
        <RootLayoutNav />
        <StatusBar style="dark" />
      </GroupProvider>
    </AuthProvider>
  );
}
