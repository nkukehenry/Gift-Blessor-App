import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  useColorScheme,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, palette } from '../../constants/Colors';
import { createThemedStyles, spacing } from '../../constants/Styles';
import { useAuth } from '../../contexts/AuthContext';

type AuthContextType = {
  user: User | null;
  signOut: () => Promise<void>;
}

type User = {
  email?: string;
  photoURL?: string;
  displayName?: string;
  id: string;
}

const MENU_ITEMS = [
  { 
    id: '1', 
    title: 'My Wishlist', 
    icon: 'gift-outline', 
    href: '../wishlist',
    badge: '2'
  },
  { 
    id: '2', 
    title: 'My Exchanges', 
    icon: 'people-outline', 
    href: '../groups',
    badge: '3'
  },
  { 
    id: '3', 
    title: 'Order History', 
    icon: 'receipt-outline', 
    href: '../orders'
  },
  { 
    id: '4', 
    title: 'Settings', 
    icon: 'settings-outline', 
    href: '../settings'
  },
  { 
    id: '5', 
    title: 'Help & Support', 
    icon: 'help-circle-outline', 
    href: '../support'
  },
];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const styles = createThemedStyles(theme);
  const router = useRouter();

  const getAvatarUrl = () => {
    if (user?.photoURL) return user.photoURL;
    // Using a specific Unsplash profile photo
    return 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&q=80&fit=crop'
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('../(auth)');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: '#FFFFFF' }]}>
      <View style={[styles.header, { paddingTop: 30, paddingBottom: 0, paddingHorizontal: 16 }]}>
        <Text style={[styles.headerTitle, { color: '#FF424D' }]}>Profile</Text>
        <TouchableOpacity
          style={[localStyles.iconButton, { backgroundColor: theme.background.secondary }]}
          onPress={() => router.push('../notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color={theme.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={[styles.scrollView, { backgroundColor: '#FFFFFF' }]}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <View style={[localStyles.profileHeader, { backgroundColor: '#FFFFFF' }]}>
          <View style={localStyles.avatarContainer}>
            <Image
              source={{ uri: getAvatarUrl() }}
              style={[localStyles.avatar, {
                borderColor: theme.background.secondary,
                borderWidth: 4,
              }]}
            />
            <TouchableOpacity 
              style={[localStyles.editAvatarButton, {
                backgroundColor: theme.primary,
                borderColor: '#FFFFFF',
                borderWidth: 3,
                ...Platform.select({
                  ios: {
                    shadowColor: theme.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4.65,
                  },
                  android: {
                    elevation: 8,
                  },
                }),
              }]}
              onPress={() => router.push('/edit-profile')}
            >
              <Ionicons name="camera" size={16} color={palette.white} />
            </TouchableOpacity>
          </View>
          <Text style={[localStyles.userName, { color: theme.text.primary }]}>
            {user?.displayName || 'User'}
          </Text>
          <Text style={[localStyles.userEmail, { color: theme.text.secondary }]}>
            {user?.email}
          </Text>
          <TouchableOpacity
            style={[localStyles.editProfileButton, {
              backgroundColor: theme.primary,
              ...Platform.select({
                ios: {
                  shadowColor: theme.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4.65,
                },
                android: {
                  elevation: 8,
                },
              }),
            }]}
            onPress={() => router.push('/edit-profile')}
          >
            <View style={localStyles.buttonContent}>
              <Ionicons name="pencil" size={20} color={palette.white} style={{ marginRight: spacing.xs }} />
              <Text style={[styles.buttonText, { fontSize: 16 }]}>Edit Profile</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={[localStyles.menuSection, { backgroundColor: '#FFFFFF' }]}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                localStyles.menuItem,
                { 
                  borderBottomColor: theme.border.light,
                  borderBottomWidth: index === MENU_ITEMS.length - 1 ? 0 : StyleSheet.hairlineWidth,
                }
              ]}
              onPress={() => router.push(item.href)}
            >
              <View style={localStyles.menuItemLeft}>
                <View style={[localStyles.menuIcon, { backgroundColor: theme.background.secondary }]}>
                  <Ionicons name={item.icon as any} size={20} color={theme.primary} />
                </View>
                <Text style={[localStyles.menuItemTitle, { color: theme.text.primary }]}>
                  {item.title}
                </Text>
              </View>
              <View style={localStyles.menuItemRight}>
                {item.badge && (
                  <View style={[localStyles.badge, { backgroundColor: theme.primary }]}>
                    <Text style={localStyles.badgeText}>{item.badge}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={20} color={theme.text.secondary} style={{ marginLeft: spacing.sm }} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[localStyles.signOutButton, { backgroundColor: '#FFFFFF' }]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={24} color={theme.primary} />
          <Text style={[localStyles.signOutText, { color: theme.primary }]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 1.5,
    paddingHorizontal: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: spacing.lg,
  },
  editProfileButton: {
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    width: '100%',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuSection: {
    marginTop: spacing.lg,
    borderRadius: 16,
    marginHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemTitle: {
    fontSize: 16,
    marginLeft: spacing.md,
    fontWeight: '500',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl * 2,
    marginBottom: spacing.xl,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: 16,
  },
  signOutText: {
    fontSize: 16,
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 