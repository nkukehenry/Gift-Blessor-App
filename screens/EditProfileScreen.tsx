import React from "react"
import { View, Text } from "react-native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/types"

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>

export default function EditProfileScreen({ navigation }: Props) {
  return (
    <View>
      <Text>Edit Profile Screen</Text>
    </View>
  )
} 