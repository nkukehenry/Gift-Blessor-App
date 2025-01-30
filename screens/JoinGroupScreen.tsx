import React, { useState, useEffect } from "react"
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert, 
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from "react-native"
import { useAuth } from "../contexts/AuthContext"
import { useGroup } from "../contexts/GroupContext"
import { api } from "../services/api"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/types"
import { Ionicons } from "@expo/vector-icons"
import { Profile } from "../models/profile"
import { CreateProfileData } from "../models/profile"
import { JoinGroupData } from "../models/group"

type Props = NativeStackScreenProps<RootStackParamList, 'JoinGroup'>

export default function JoinGroupScreen({ route, navigation }: Props) {
  const { groupId, phoneNumber } = route.params
  const { user } = useAuth()
  const { joinGroup } = useGroup()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [newProfileName, setNewProfileName] = useState("")
  const [newProfileNickname, setNewProfileNickname] = useState("")
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const userProfiles = await api.getUserProfiles(phoneNumber)
        setProfiles(userProfiles)
      } catch (error) {
        Alert.alert(
          "Error",
          "Failed to fetch user profiles. Please try again."
        )
      } finally {
        setIsFetching(false)
      }
    }

    fetchProfiles()
  }, [phoneNumber])

  const validateProfile = () => {
    if (newProfileName.trim().length < 2) {
      Alert.alert("Invalid Name", "Name must be at least 2 characters long")
      return false
    }
    if (newProfileNickname.trim().length < 2) {
      Alert.alert("Invalid Nickname", "Nickname must be at least 2 characters long")
      return false
    }
    return true
  }

  const handleCreateProfile = async () => {
    if (!validateProfile() || !user) return

    setIsLoading(true)
    try {
      const profileData: CreateProfileData = {
        firstName: newProfileName.trim(),
        lastName: newProfileNickname.trim(),
        email: user.email,
        phoneNumber,
        role: 'user',
        status: 'active',
        isEmailVerified: false
      }

      const newProfile = await api.createUserProfile(user.id, profileData)
      setProfiles([...profiles, newProfile])
      setNewProfileName("")
      setNewProfileNickname("")
      setSelectedProfile(newProfile)
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to create new profile. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinGroup = async () => {
    if (!selectedProfile && !validateProfile()) {
      return
    }

    if (!user) {
      Alert.alert("Error", "You must be logged in to join a group")
      return
    }

    setIsLoading(true)
    try {
      const joinData: JoinGroupData = {
        groupId,
        userId: selectedProfile?.id || user.id
      }
      const updatedGroup = await api.joinGroup(groupId, selectedProfile || user)
      joinGroup(joinData, selectedProfile || user)
      navigation.replace("GroupDetails", { groupId: updatedGroup.id })
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to join the group. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  const renderProfileItem = ({ item }: { item: Profile }) => (
    <TouchableOpacity
      style={[
        styles.profileItem,
        selectedProfile?.id === item.id && styles.selectedProfileItem
      ]}
      onPress={() => setSelectedProfile(item)}
    >
      <View style={styles.profileIcon}>
        <Ionicons 
          name="person-circle-outline" 
          size={32} 
          color={selectedProfile?.id === item.id ? "#007AFF" : "#666"} 
        />
      </View>
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.profileNickname}>{item.email}</Text>
      </View>
      {selectedProfile?.id === item.id && (
        <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
      )}
    </TouchableOpacity>
  )

  if (isFetching) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Join Group</Text>
      
      {profiles.length > 0 && (
        <>
          <Text style={styles.subtitle}>Select an existing profile:</Text>
          <FlatList
            data={profiles}
            keyExtractor={(item) => item.id}
            renderItem={renderProfileItem}
            style={styles.profileList}
            contentContainerStyle={styles.profileListContent}
          />
        </>
      )}

      <View style={styles.createProfileSection}>
        <Text style={styles.subtitle}>
          {profiles.length > 0 ? "Or create a new profile:" : "Create a profile:"}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={newProfileName}
          onChangeText={setNewProfileName}
          editable={!isLoading}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={newProfileNickname}
          onChangeText={setNewProfileNickname}
          editable={!isLoading}
        />
        
        <TouchableOpacity
          style={[styles.button, styles.createButton]}
          onPress={handleCreateProfile}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create New Profile</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.button,
            styles.joinButton,
            (!selectedProfile && !newProfileName) && styles.buttonDisabled
          ]}
          onPress={handleJoinGroup}
          disabled={isLoading || (!selectedProfile && !newProfileName)}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Join Group</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 60,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  profileList: {
    maxHeight: 200,
  },
  profileListContent: {
    paddingHorizontal: 20,
  },
  profileItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedProfileItem: {
    backgroundColor: "#e8f1ff",
  },
  profileIcon: {
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  profileNickname: {
    fontSize: 14,
    color: "#666",
  },
  createProfileSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  input: {
    height: 50,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  createButton: {
    backgroundColor: "#007AFF",
  },
  joinButton: {
    backgroundColor: "#34C759",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})

