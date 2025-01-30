import React from "react"
import { View, Text } from "react-native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/types"

type Props = NativeStackScreenProps<RootStackParamList, 'CreateWishlist'>

export default function CreateWishlistScreen({ navigation }: Props) {
  return (
    <View>
      <Text>Create Wishlist Screen</Text>
    </View>
  )
} 