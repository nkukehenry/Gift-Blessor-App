import React, { useEffect, useState, useCallback } from "react"
import { View, Text, FlatList, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, RefreshControl } from "react-native"
import { useAuth } from "../contexts/AuthContext"
import { useGroup } from "../contexts/GroupContext"
import { api } from "../services/api"
import { Group } from "../models/group"
import { GroupParticipant } from "../models/profile"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/types"
import { Ionicons } from "@expo/vector-icons"

type Props = NativeStackScreenProps<RootStackParamList, 'GroupDetails'>

export default function GroupDetailsScreen({ navigation, route }: Props) {
  const { groupId } = route.params
  const { user } = useAuth()
  const { refreshGroups } = useGroup()
  const [group, setGroup] = useState<Group | null>(null)
  const [participants, setParticipants] = useState<GroupParticipant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchGroupDetails = useCallback(async () => {
    try {
      const [groupData, participantsData] = await Promise.all([
        api.getGroupDetails(groupId),
        api.getGroupParticipants(groupId)
      ])
      setGroup(groupData)
      setParticipants(participantsData)
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to load group details"
      )
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [groupId])

  useEffect(() => {
    fetchGroupDetails()
  }, [fetchGroupDetails])

  useEffect(() => {
    if (group) {
      navigation.setOptions({
        title: group.name,
        headerRight: () => isAdmin && (
          <TouchableOpacity 
            onPress={() => navigation.navigate("GroupSettings", { groupId })}
            style={styles.headerButton}
          >
            <Ionicons name="settings-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        )
      })
    }
  }, [navigation, group, groupId])

  const isAdmin = group?.admins.some(admin => admin.id === user?.id)
  const isMember = group?.members.some(member => member.id === user?.id)

  const handleJoinGroup = async () => {
    try {
      if (!user) {
        Alert.alert("Error", "You must be logged in to join a group")
        return
      }

      await api.joinGroup(groupId, user)
      await Promise.all([fetchGroupDetails(), refreshGroups()])
      Alert.alert("Success", "You have joined the group!")
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to join group"
      )
    }
  }

  const renderParticipantItem = ({ item }: { item: GroupParticipant }) => (
    <TouchableOpacity 
      style={styles.participantItem}
      onPress={() => navigation.navigate("Profile", { userId: item.id })}
    >
      <View style={styles.participantInfo}>
        <Text style={styles.participantName}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={styles.participantEmail}>{item.email}</Text>
      </View>
      <View style={styles.participantStatus}>
        {item.isMatch && <Text style={styles.matchTag}>Match</Text>}
        {group?.admins.some(admin => admin.id === item.id) && (
          <Text style={styles.adminTag}>Admin</Text>
        )}
      </View>
    </TouchableOpacity>
  )

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!group) {
    return (
      <View style={styles.centerContainer}>
        <Text>Group not found</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.groupDescription}>{group.description}</Text>
            {!isMember && (
              <TouchableOpacity
                style={styles.joinButton}
                onPress={handleJoinGroup}
              >
                <Text style={styles.joinButtonText}>Join Group</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.sectionTitle}>
              Participants ({participants.length}/{group.settings?.maxMembers || '∞'})
            </Text>
          </View>
        }
        data={participants}
        renderItem={renderParticipantItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No participants yet.</Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true)
              fetchGroupDetails()
            }}
          />
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
  },
  groupDescription: {
    fontSize: 16,
    marginBottom: 20,
    color: "#666",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  participantItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: "500",
  },
  participantEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  participantStatus: {
    flexDirection: "row",
    gap: 8,
  },
  matchTag: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    overflow: "hidden",
  },
  adminTag: {
    backgroundColor: "#2196F3",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    overflow: "hidden",
  },
  joinButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  joinButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  headerButton: {
    marginRight: 15,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
  }
})

