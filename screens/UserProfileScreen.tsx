import React, { useState, useEffect } from "react"
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
  ScrollView,
  useColorScheme,
  Image,
  RefreshControl
} from "react-native"
import { useAuth } from "../contexts/AuthContext"
import { api } from "../services/api"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/types"
import { Ionicons } from "@expo/vector-icons"
import { Colors, palette } from "../constants/Colors"
import { createThemedStyles, spacing } from "../constants/Styles"
import { Group } from "../models/group"
import { WishlistItem } from "../models/profile"

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>

export default function UserProfileScreen({ navigation }: Props) {
  const { user } = useAuth()
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme ?? 'light']
  const styles = createThemedStyles(theme)
  
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])

  const fetchUserData = async () => {
    if (!user?.id) return

    try {
      const [userGroups, userWishlist] = await Promise.all([
        api.getUserGroups(user.id),
        api.getWishlist(user.id)
      ])
      setGroups(userGroups)
      setWishlist(userWishlist)
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to fetch user data"
      )
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [user?.id])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchUserData()
  }

  const getAvatarUrl = () => {
    // Using Unsplash for a random profile photo
    return `https://source.unsplash.com/800x800/?portrait,person`
  }

  if (isLoading) {
    return (
      <View style={[styles.screen, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {/* Profile Header */}
        <View style={localStyles.header}>
          <View style={localStyles.profileInfo}>
            <View style={localStyles.avatarContainer}>
              <Image 
                source={{ uri: getAvatarUrl() }}
                style={[localStyles.avatar, {
                  borderColor: '#FFFFFF',
                  borderWidth: 3,
                }]}
              />
              <TouchableOpacity 
                style={[localStyles.editAvatarButton, {
                  backgroundColor: theme.primary,
                  borderColor: '#FFFFFF',
                  borderWidth: 2,
                }]}
                onPress={() => navigation.navigate("EditProfile")}
              >
                <Ionicons name="camera" size={16} color={palette.white} />
              </TouchableOpacity>
            </View>
            <View style={localStyles.nameContainer}>
              <Text style={[styles.cardTitle, { fontSize: 24, marginBottom: spacing.xs }]}>
                {user?.firstName} {user?.lastName}
              </Text>
              <View style={localStyles.phoneContainer}>
                <Ionicons name="call-outline" size={16} color={theme.text.secondary} style={{ marginRight: spacing.xs }} />
                <Text style={[styles.cardDescription, { color: theme.text.secondary }]}>
                  {user?.phoneNumber}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={[
              localStyles.editButton,
              {
                backgroundColor: theme.primary,
                shadowColor: theme.primary,
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
                elevation: 8,
              }
            ]}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <View style={localStyles.buttonContent}>
              <Ionicons name="pencil" size={20} color={palette.white} style={{ marginRight: spacing.xs }} />
              <Text style={[styles.buttonText, { fontSize: 16 }]}>Edit Profile</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Groups Section */}
        <View style={localStyles.section}>
          <View style={localStyles.sectionHeader}>
            <Text style={styles.cardTitle}>My Groups</Text>
            <TouchableOpacity
              style={localStyles.addButton}
              onPress={() => navigation.navigate("CreateGroup")}
            >
              <Ionicons name="add" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>
          {groups.length === 0 ? (
            <View style={[styles.card, localStyles.emptyState]}>
              <Text style={styles.cardDescription}>You haven't joined any groups yet</Text>
              <TouchableOpacity
                style={[styles.button, { marginTop: spacing.md }]}
                onPress={() => navigation.navigate("CreateGroup")}
              >
                <Text style={styles.buttonText}>Create a Group</Text>
              </TouchableOpacity>
            </View>
          ) : (
            groups.map(group => (
              <TouchableOpacity
                key={group.id}
                style={styles.card}
                onPress={() => navigation.navigate("GroupDetails", { groupId: group.id })}
              >
                <Text style={styles.cardTitle}>{group.name}</Text>
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {group.description}
                </Text>
                <View style={localStyles.groupMeta}>
                  <View style={localStyles.metaItem}>
                    <Ionicons name="people-outline" size={16} color={theme.text.secondary} />
                    <Text style={[styles.cardDescription, localStyles.metaText]}>
                      {group.members.length} members
                    </Text>
                  </View>
                  {group.admins.some(admin => admin.id === user?.id) && (
                    <View style={localStyles.metaItem}>
                      <Ionicons name="star-outline" size={16} color={theme.text.secondary} />
                      <Text style={[styles.cardDescription, localStyles.metaText]}>Admin</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Wishlist Section */}
        <View style={localStyles.section}>
          <View style={localStyles.sectionHeader}>
            <Text style={styles.cardTitle}>My Wishlist</Text>
            <TouchableOpacity
              style={localStyles.addButton}
              onPress={() => navigation.navigate("CreateWishlist")}
            >
              <Ionicons name="add" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>
          {wishlist.length === 0 ? (
            <View style={[styles.card, localStyles.emptyState]}>
              <Text style={styles.cardDescription}>Your wishlist is empty</Text>
              <TouchableOpacity
                style={[styles.button, { marginTop: spacing.md }]}
                onPress={() => navigation.navigate("CreateWishlist")}
              >
                <Text style={styles.buttonText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          ) : (
            wishlist.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => navigation.navigate("EditWishlist", { itemId: item.id })}
              >
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={localStyles.wishlistMeta}>
                  {item.price && (
                    <View style={localStyles.metaItem}>
                      <Ionicons name="pricetag-outline" size={16} color={theme.text.secondary} />
                      <Text style={[styles.cardDescription, localStyles.metaText]}>
                        ${item.price}
                      </Text>
                    </View>
                  )}
                  {item.url && (
                    <View style={localStyles.metaItem}>
                      <Ionicons name="link-outline" size={16} color={theme.text.secondary} />
                      <Text style={[styles.cardDescription, localStyles.metaText]}>Link</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const localStyles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameContainer: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignSelf: 'stretch',
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  addButton: {
    padding: spacing.xs,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  groupMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  wishlistMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.lg,
  },
  metaText: {
    marginLeft: spacing.xs,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
})

