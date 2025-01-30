import React, { useEffect, useState } from "react"
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  useColorScheme,
  RefreshControl,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../constants/Colors"
import { createThemedStyles, spacing } from "../constants/Styles"
import { useAuth } from "../contexts/AuthContext"
import { api } from "../services/api"
import { Group } from "../models/group"
import { GroupMembership } from "../models/profile"

type TabType = 'groups' | 'matches' | 'invites';

export default function HomeScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme ?? 'light']
  const styles = createThemedStyles(theme)
  
  const [activeTab, setActiveTab] = useState<TabType>('groups')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])
  const [matches, setMatches] = useState<GroupMembership[]>([])
  const [invites, setInvites] = useState<Group[]>([])

  const fetchData = async () => {
    if (!user?.id) {
      setIsLoading(false)
      setIsRefreshing(false)
      return
    }

    try {
      const [userGroups, memberships, groupInvites] = await Promise.all([
        api.getUserGroups(user.id),
        api.getUserGroupMemberships(user.id),
        api.getGroups() // TODO: Replace with getGroupInvites when implemented
      ])

      setGroups(userGroups)
      setMatches(memberships.filter(m => m.match))
      setInvites(groupInvites.slice(0, 2)) // Temporary: just showing some groups as invites
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to fetch data"
      )
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (mounted) {
        await fetchData();
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [user?.id])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchData()
  }

  const handleAcceptInvite = async (groupId: string) => {
    if (!user) return;

    try {
      await api.joinGroup(groupId, user);
      setInvites(prev => prev.filter(invite => invite.id !== groupId));
      Alert.alert("Success", "You've joined the group!");
      fetchData(); // Refresh all data
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to join group"
      );
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.screen, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    )
  }

  return (
    <View style={[styles.screen, { backgroundColor: '#FFFFFF' }]}>
      <View style={[styles.header, { paddingTop: 30, paddingBottom: 0, paddingHorizontal: 16 }]}>
        <Text style={[styles.headerTitle, { color: '#FF424D' }]}>Blessor</Text>
      </View>

      {/* Tab Navigation */}
      <View style={[localStyles.tabContainer, {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: theme.border.light,
        height: 44
      }]}>
        <TouchableOpacity
          style={[
            localStyles.tab,
            activeTab === 'groups' && [localStyles.activeTab, { borderBottomColor: theme.primary }]
          ]}
          onPress={() => setActiveTab('groups')}
        >
          <Text style={[
            localStyles.tabText,
            { color: theme.text.secondary },
            activeTab === 'groups' && { color: theme.primary, fontWeight: '500' }
          ]}>Groups</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            localStyles.tab,
            activeTab === 'matches' && [localStyles.activeTab, { borderBottomColor: theme.primary }]
          ]}
          onPress={() => setActiveTab('matches')}
        >
          <Text style={[
            localStyles.tabText,
            { color: theme.text.secondary },
            activeTab === 'matches' && { color: theme.primary, fontWeight: '500' }
          ]}>Matches</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            localStyles.tab,
            activeTab === 'invites' && [localStyles.activeTab, { borderBottomColor: theme.primary }]
          ]}
          onPress={() => setActiveTab('invites')}
        >
          <Text style={[
            localStyles.tabText,
            { color: theme.text.secondary },
            activeTab === 'invites' && { color: theme.primary, fontWeight: '500' }
          ]}>Invites</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'groups' && groups.length === 0 ? (
        <View style={[styles.card, localStyles.emptyState, { 
          margin: 0,
          padding: 0,
          backgroundColor: theme.background.secondary,
          flex: 1
        }]}>
          <View style={{ alignItems: 'center', paddingVertical: spacing.xl * 2 }}>
            <Ionicons 
              name="people-outline" 
              size={48} 
              color={theme.text.secondary}
              style={{ marginBottom: spacing.md }}
            />
            <Text style={[styles.cardTitle, { textAlign: 'center', marginBottom: spacing.xs }]}>
              No Exchanges Yet
            </Text>
            <Text style={[styles.cardDescription, { 
              textAlign: 'center', 
              marginBottom: spacing.lg,
              paddingHorizontal: spacing.xl 
            }]}>
              Create or join an exchange to start gifting with friends and family
            </Text>
            <TouchableOpacity
              style={[styles.button, localStyles.createGroupButton]}
              onPress={() => router.push("/(tabs)/create-group")}
            >
              <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" style={{ marginRight: spacing.xs }} />
              <Text style={styles.buttonText}>Create a Exchange</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView
          style={[styles.scrollView, { 
            backgroundColor: theme.background.secondary,
            flex: 1
          }]}
          contentContainerStyle={[
            styles.scrollContent,
            { flexGrow: 1, padding: 0 }
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
            />
          }
        >
          {/* Groups Tab */}
          {activeTab === 'groups' && (
            groups.map(group => (
              <TouchableOpacity
                key={group.id}
                style={styles.card}
                onPress={() => router.push({
                  pathname: "/(tabs)/group",
                  params: { id: group.id }
                })}
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

          {/* Matches Tab */}
          {activeTab === 'matches' && (
            <>
              {matches.length === 0 ? (
                <View style={[styles.card, localStyles.emptyState]}>
                  <Text style={styles.cardDescription}>
                    No matches yet. Join an exchange to get matched!
                  </Text>
                </View>
              ) : (
                matches.map(membership => (
                  <TouchableOpacity
                    key={`${membership.group.id}-${membership.match?.matchedUserId}`}
                    style={styles.card}
                    onPress={() => router.push({
                      pathname: "/(tabs)/profile",
                      params: { id: membership.match?.matchedUserId }
                    })}
                  >
                    <Text style={styles.cardTitle}>{membership.group.name}</Text>
                    <View style={localStyles.matchInfo}>
                      <View style={localStyles.roleContainer}>
                        <Ionicons 
                          name={membership.match?.isGiver ? "gift-outline" : "gift"}
                          size={20}
                          color={theme.primary}
                          style={localStyles.roleIcon}
                        />
                        <Text style={[styles.cardDescription, { color: theme.primary }]}>
                          {membership.match?.isGiver ? "You're giving to:" : "You're receiving from:"}
                        </Text>
                      </View>
                      <Text style={[styles.cardTitle, { fontSize: 16 }]}>
                        {membership.match?.matchedUserId}
                      </Text>
                      <Text style={styles.cardDescription}>
                        Matched on {membership.match?.matchedAt.toLocaleDateString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </>
          )}

          {/* Invites Tab */}
          {activeTab === 'invites' && (
            <>
              {invites.length === 0 ? (
                <View style={[styles.card, localStyles.emptyState]}>
                  <Text style={styles.cardDescription}>
                    No pending invites
                  </Text>
                </View>
              ) : (
                invites.map(invite => (
                  <View key={invite.id} style={styles.card}>
                    <Text style={styles.cardTitle}>{invite.name}</Text>
                    <Text style={styles.cardDescription} numberOfLines={2}>
                      {invite.description}
                    </Text>
                    <View style={localStyles.inviteInfo}>
                      <View style={localStyles.memberInfo}>
                        <Ionicons name="people-outline" size={16} color={theme.text.secondary} />
                        <Text style={[styles.cardDescription, localStyles.memberCount]}>
                          {invite.members.length} members
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.button, localStyles.acceptButton]}
                        onPress={() => handleAcceptInvite(invite.id)}
                      >
                        <Text style={styles.buttonText}>Join Exchange</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </>
          )}
        </ScrollView>
      )}
    </View>
  )
}

const localStyles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {},
  tabText: {
    fontSize: 16,
  },
  activeTabText: {},
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xl * 2,
  },
  groupMeta: {
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
  matchInfo: {
    marginTop: spacing.sm,
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  roleIcon: {
    marginRight: spacing.xs,
  },
  inviteInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberCount: {
    marginLeft: spacing.xs,
  },
  acceptButton: {
    paddingHorizontal: spacing.lg,
  },
  createGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    height: 48,
  },
});

