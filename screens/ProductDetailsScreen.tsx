import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { createThemedStyles, spacing } from '../constants/Styles';
import { api } from '../services/api';
import { Product } from '../models/product';

interface ColorOption {
  id: string;
  name: string;
  value: string;
}

const COLOR_OPTIONS: ColorOption[] = [
  { id: '1', name: 'Mint', value: '#A8E6CF' },
  { id: '2', name: 'Lavender', value: '#DCD6F7' },
  { id: '3', name: 'Coral', value: '#FFB5B5' },
];

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const styles = createThemedStyles(theme);
  const { width } = useWindowDimensions();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string>(COLOR_OPTIONS[0].id);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await api.getProductById(id as string);
        setProduct(data);
      } catch (error) {
        Alert.alert(
          "Error",
          error instanceof Error ? error.message : "Failed to load product"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const handleQuantityChange = (increment: number) => {
    const newQuantity = quantity + increment;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    router.push('/cart');
  };

  const handleToggleFavorite = async () => {
    if (!product) return;
    try {
      const updatedProduct = await api.toggleFavorite(product.id, "1"); // TODO: Get actual user ID
      setProduct(updatedProduct);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to update favorite status"
      );
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.screen, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.screen, styles.centerContent]}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: '#FFFFFF' }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      {/* Custom Header */}
      <View style={localStyles.header}>
        <TouchableOpacity onPress={handleBack} style={localStyles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Image */}
        <View style={[localStyles.imageContainer, { width: width }]}>
          <Image
            source={{ uri: product.image }}
            style={localStyles.image}
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={localStyles.favoriteButton}
            onPress={handleToggleFavorite}
          >
            <Ionicons 
              name={product.isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={theme.primary} 
            />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={localStyles.infoContainer}>
          <View style={localStyles.titleRow}>
            <Text style={localStyles.title}>{product.name}</Text>
          </View>

          <View style={localStyles.priceRow}>
            <Text style={localStyles.price}>${product.price}</Text>
            {product.originalPrice && (
              <Text style={localStyles.originalPrice}>${product.originalPrice}</Text>
            )}
          </View>

          <Text style={localStyles.description}>{product.description}</Text>

          {/* Rating */}
          <View style={localStyles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={localStyles.rating}>{product.rating}</Text>
            <Text style={localStyles.reviews}>({product.reviews} reviews)</Text>
          </View>

          {/* Color Options */}
          <View style={localStyles.section}>
            <Text style={localStyles.sectionTitle}>Color</Text>
            <View style={localStyles.colorOptions}>
              {COLOR_OPTIONS.map((color) => (
                <TouchableOpacity
                  key={color.id}
                  style={[
                    localStyles.colorOption,
                    { backgroundColor: color.value },
                    selectedColor === color.id && localStyles.selectedColorOption,
                  ]}
                  onPress={() => setSelectedColor(color.id)}
                />
              ))}
            </View>
          </View>

          {/* Quantity Selector */}
          <View style={localStyles.quantityContainer}>
            <TouchableOpacity
              style={localStyles.quantityButton}
              onPress={() => handleQuantityChange(-1)}
            >
              <Text style={localStyles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={localStyles.quantity}>{quantity}</Text>
            <TouchableOpacity
              style={localStyles.quantityButton}
              onPress={() => handleQuantityChange(1)}
            >
              <Text style={localStyles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={localStyles.footer}>
        <TouchableOpacity
          style={[localStyles.addToCartButton, { backgroundColor: theme.primary }]}
          onPress={handleAddToCart}
        >
          <Text style={localStyles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  timer: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF424D',
    backgroundColor: '#FFE8E8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  imageContainer: {
    aspectRatio: 1,
    backgroundColor: '#F8F8F8',
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContainer: {
    padding: 24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF424D',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 16,
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  colorOptions: {
    flexDirection: 'row',
    gap: 16,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: '#FF424D',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666666',
  },
  quantity: {
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  addToCartButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF424D',
    marginLeft: 8,
  },
  reviews: {
    fontSize: 16,
    color: '#999999',
  },
}); 