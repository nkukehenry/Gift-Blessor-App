import React, { useState } from "react"
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
} from "react-native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/types"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../constants/Colors"
import { createThemedStyles, spacing } from "../constants/Styles"
import { useAuth } from "../contexts/AuthContext"
import { api } from "../services/api"
import { useGroup } from "../contexts/GroupContext"
import { CreateGroupData } from "../models/group"

type Props = NativeStackScreenProps<RootStackParamList, 'CreateGroup'>

export default function CreateGroupScreen({ navigation }: Props) {
  const { user } = useAuth()
  const { refreshGroups } = useGroup()
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme ?? 'light']
  const styles = createThemedStyles(theme)
  
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CreateGroupData>({
    name: "",
    description: "",
    settings: {
      isPrivate: false,
      allowInvites: true,
      showWishlists: true,
      enableMatching: true,
      notifyNewMembers: true,
      joinRequiresApproval: false,
    }
  })

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter a group name")
      return false
    }
    if (!formData.description.trim()) {
      Alert.alert("Error", "Please enter a group description")
      return false
    }
    return true
  }

  const handleCreateGroup = async () => {
    if (!validateForm() || !user?.id) return

    setIsLoading(true)
    try {
      const newGroup = await api.createGroup(formData)
      await refreshGroups()
      navigation.navigate("GroupDetails", { groupId: newGroup.id })
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to create group"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView 
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Group</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Group Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons 
                name="people-outline" 
                size={20} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Enter group name"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                autoCapitalize="words"
                editable={!isLoading}
                placeholderTextColor={theme.text.secondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <View style={[styles.inputContainer, { height: 100, alignItems: 'flex-start', paddingVertical: spacing.md }]}>
              <Ionicons 
                name="document-text-outline" 
                size={20} 
                style={[styles.inputIcon, { marginTop: 4 }]} 
              />
              <TextInput
                style={[styles.input, { height: '100%', textAlignVertical: 'top' }]}
                placeholder="Enter group description"
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={4}
                editable={!isLoading}
                placeholderTextColor={theme.text.secondary}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              isLoading && styles.buttonDisabled
            ]}
            onPress={handleCreateGroup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.background.primary} />
            ) : (
              <Text style={styles.buttonText}>Create Group</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

