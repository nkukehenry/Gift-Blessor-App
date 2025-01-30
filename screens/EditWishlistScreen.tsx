import React from "react"
import { View, Text } from "react-native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/types"

type Props = NativeStackScreenProps<RootStackParamList, 'EditWishlist'>

export default function EditWishlistScreen({ navigation, route }: Props) {
  return (
    <View>
      <Text>Edit Wishlist Screen</Text>
    </View>
  )
} 