import React, { useState, useEffect } from "react"
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  useColorScheme,
  Switch,
} from "react-native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/types"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../constants/Colors"
import { createThemedStyles, spacing, typography } from "../constants/Styles"
import { useAuth } from "../contexts/AuthContext"
import { api } from "../services/api"
import { Group } from "../models/group"

type Props = NativeStackScreenProps<RootStackParamList, 'GroupSettings'>

export default function GroupSettingsScreen({ navigation, route }: Props) {
  const { user } = useAuth()
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme ?? 'light']
  const styles = createThemedStyles(theme)
  
  const [isLoading, setIsLoading] = useState(true)
  const [group, setGroup] = useState<Group | null>(null)
  const [settings, setSettings] = useState({
    isPrivate: false,
    allowInvites: true,
    showWishlists: true,
    enableMatching: true,
    notifyNewMembers: true,
  })

  const fetchGroupSettings = async () => {
    if (!route.params?.groupId) return

    try {
      const groupData = await api.getGroupDetails(route.params.groupId)
      setGroup(groupData)
      setSettings({
        isPrivate: groupData.settings?.isPrivate ?? false,
        allowInvites: groupData.settings?.allowInvites ?? true,
        showWishlists: groupData.settings?.showWishlists ?? true,
        enableMatching: groupData.settings?.enableMatching ?? true,
        notifyNewMembers: groupData.settings?.notifyNewMembers ?? true,
      })
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to fetch group settings"
      )
      navigation.goBack()
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGroupSettings()
  }, [route.params?.groupId])

  const handleUpdateSettings = async (key: keyof typeof settings, value: boolean) => {
    if (!group?.id) return

    setSettings(prev => ({ ...prev, [key]: value }))
    
    try {
      await api.updateGroupSettings(group.id, {
        ...settings,
        [key]: value,
      })
    } catch (error) {
      // Revert the setting if the update fails
      setSettings(prev => ({ ...prev, [key]: !value }))
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to update setting"
      )
    }
  }

  const handleDeleteGroup = async () => {
    if (!group?.id) return

    Alert.alert(
      "Delete Group",
      "Are you sure you want to delete this group? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.deleteGroup(group.id)
              navigation.navigate("Home")
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error ? error.message : "Failed to delete group"
              )
            }
          }
        }
      ]
    )
  }

  const handleLeaveGroup = async () => {
    if (!group?.id || !user?.id) return

    Alert.alert(
      "Leave Group",
      "Are you sure you want to leave this group?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              await api.leaveGroup(group.id, user.id)
              navigation.navigate("Home")
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error ? error.message : "Failed to leave group"
              )
            }
          }
        }
      ]
    )
  }

  const handleNavigateToEditGroup = () => {
    if (group?.id) {
      navigation.navigate("EditGroup", { groupId: group.id })
    }
  }

  if (isLoading) {
    return (
      <View style={[styles.screen, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    )
  }

  const isAdmin = group?.admins.some(admin => admin.id === user?.id)

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Group Info Section */}
        <View style={localStyles.section}>
          <Text style={[localStyles.sectionTitle, { color: theme.text.secondary }]}>
            Group Information
          </Text>
          <TouchableOpacity 
            style={[localStyles.settingItem, { backgroundColor: theme.background.secondary }]}
            onPress={handleNavigateToEditGroup}
          >
            <View style={localStyles.settingContent}>
              <Text style={[localStyles.settingTitle, { color: theme.text.primary }]}>
                Edit Group Details
              </Text>
              <Text style={[localStyles.settingDescription, { color: theme.text.secondary }]}>
                Change group name, description, and cover image
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Privacy Settings Section */}
        {isAdmin && (
          <View style={localStyles.section}>
            <Text style={localStyles.sectionTitle}>Privacy Settings</Text>
            <View style={localStyles.settingItem}>
              <View style={localStyles.settingContent}>
                <Text style={localStyles.settingTitle}>Private Group</Text>
                <Text style={localStyles.settingDescription}>
                  Only invited members can join
                </Text>
              </View>
              <Switch
                value={settings.isPrivate}
                onValueChange={(value) => handleUpdateSettings('isPrivate', value)}
                trackColor={{ false: theme.border.light, true: theme.primary }}
              />
            </View>
            <View style={localStyles.settingItem}>
              <View style={localStyles.settingContent}>
                <Text style={localStyles.settingTitle}>Allow Member Invites</Text>
                <Text style={localStyles.settingDescription}>
                  Members can invite others to join
                </Text>
              </View>
              <Switch
                value={settings.allowInvites}
                onValueChange={(value) => handleUpdateSettings('allowInvites', value)}
                trackColor={{ false: theme.border.light, true: theme.primary }}
              />
            </View>
          </View>
        )}

        {/* Feature Settings Section */}
        {isAdmin && (
          <View style={localStyles.section}>
            <Text style={localStyles.sectionTitle}>Features</Text>
            <View style={localStyles.settingItem}>
              <View style={localStyles.settingContent}>
                <Text style={localStyles.settingTitle}>Show Wishlists</Text>
                <Text style={localStyles.settingDescription}>
                  Allow members to view each other's wishlists
                </Text>
              </View>
              <Switch
                value={settings.showWishlists}
                onValueChange={(value) => handleUpdateSettings('showWishlists', value)}
                trackColor={{ false: theme.border.light, true: theme.primary }}
              />
            </View>
            <View style={localStyles.settingItem}>
              <View style={localStyles.settingContent}>
                <Text style={localStyles.settingTitle}>Enable Matching</Text>
                <Text style={localStyles.settingDescription}>
                  Automatically match members for gift exchanges
                </Text>
              </View>
              <Switch
                value={settings.enableMatching}
                onValueChange={(value) => handleUpdateSettings('enableMatching', value)}
                trackColor={{ false: theme.border.light, true: theme.primary }}
              />
            </View>
          </View>
        )}

        {/* Notification Settings Section */}
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Notifications</Text>
          <View style={localStyles.settingItem}>
            <View style={localStyles.settingContent}>
              <Text style={localStyles.settingTitle}>New Member Alerts</Text>
              <Text style={localStyles.settingDescription}>
                Get notified when new members join
              </Text>
            </View>
            <Switch
              value={settings.notifyNewMembers}
              onValueChange={(value) => handleUpdateSettings('notifyNewMembers', value)}
              trackColor={{ false: theme.border.light, true: theme.primary }}
            />
          </View>
        </View>

        {/* Danger Zone Section */}
        <View style={[localStyles.section, localStyles.dangerZone]}>
          <Text style={[localStyles.sectionTitle, { color: theme.state.error }]}>
            Danger Zone
          </Text>
          {isAdmin ? (
            <TouchableOpacity
              style={[localStyles.settingItem, localStyles.dangerButton]}
              onPress={handleDeleteGroup}
            >
              <View style={localStyles.settingContent}>
                <Text style={[localStyles.settingTitle, { color: theme.state.error }]}>
                  Delete Group
                </Text>
                <Text style={localStyles.settingDescription}>
                  Permanently delete this group and all its data
                </Text>
              </View>
              <Ionicons name="trash-outline" size={24} color={theme.state.error} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[localStyles.settingItem, localStyles.dangerButton]}
              onPress={handleLeaveGroup}
            >
              <View style={localStyles.settingContent}>
                <Text style={[localStyles.settingTitle, { color: theme.state.error }]}>
                  Leave Group
                </Text>
                <Text style={localStyles.settingDescription}>
                  Remove yourself from this group
                </Text>
              </View>
              <Ionicons name="exit-outline" size={24} color={theme.state.error} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const localStyles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  settingContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: typography.size.sm,
  },
  dangerZone: {
    marginTop: spacing.xl,
  },
  dangerButton: {
    borderWidth: 1,
  },
}); 