import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  useColorScheme,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Dimensions,
  Share,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { createThemedStyles, spacing } from '../constants/Styles';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Product, Category, FeaturedProduct, PopularProduct } from '../models/product';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CARD_HEIGHT = CARD_WIDTH * 0.7;

export default function GiftShopScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const styles = createThemedStyles(theme);
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          categoriesData,
          productsData,
          featuredData,
          popularData
        ] = await Promise.all([
          api.getCategories(),
          api.getProducts(),
          api.getFeaturedProducts(),
          api.getPopularProducts()
        ]);

        setCategories(categoriesData);
        setProducts(productsData);
        setFeaturedProducts(featuredData);
        setPopularProducts(popularData);
      } catch (error) {
        Alert.alert(
          "Error",
          error instanceof Error ? error.message : "Failed to load products"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddToCart = (product: Product) => {
    // TODO: Implement cart functionality
    Alert.alert('Added to Cart', `${product.name} has been added to your cart.`);
  };

  const handleToggleFavorite = async (productId: string) => {
    if (!user?.id) return;
    
    try {
      const updatedProduct = await api.toggleFavorite(productId, user.id);
      setProducts(prev => 
        prev.map(p => p.id === productId ? updatedProduct : p)
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to update favorite status"
      );
    }
  };

  const handleShare = async (product: Product) => {
    try {
      await Share.share({
        message: `Check out ${product.name} for $${product.price} on Blessor!`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      const productsData = await api.getProducts();
      setProducts(productsData);
      return;
    }

    try {
      const results = await api.searchProducts(searchQuery);
      setProducts(results);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to search products"
      );
    }
  };

  const handleCategorySelect = async (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    try {
      const productsData = categoryId 
        ? await api.getProductsByCategory(categoryId)
        : await api.getProducts();
      setProducts(productsData);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to load products"
      );
    }
  };

  const renderFeaturedItem = ({ item }: { item: FeaturedProduct }) => (
    <TouchableOpacity
      style={[localStyles.featuredCard, { backgroundColor: item.color }]}
      onPress={() => router.push({
        pathname: "/(product)/[id]",
        params: { id: item.id }
      })}
    >
      <Image 
        source={{ uri: item.image }} 
        style={localStyles.featuredImage}
        resizeMode="cover"
      />
      <View style={localStyles.featuredContent}>
        <Text style={[localStyles.featuredTitle, { color: '#FFFFFF' }]}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[localStyles.productCard, { backgroundColor: '#FFFFFF' }]}
      onPress={() => router.push({
        pathname: "/(product)/[id]",
        params: { id: item.id }
      })}
    >
      <Image 
        source={{ uri: item.image }} 
        style={localStyles.productImage}
        resizeMode="cover"
      />
      <View style={localStyles.productContent}>
        <Text style={[localStyles.productName, { color: theme.text.primary }]}>
          {item.name}
        </Text>
        <Text 
          style={[localStyles.productDescription, { color: theme.text.secondary }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
        <View style={localStyles.productFooter}>
          <Text style={[localStyles.productPrice, { color: theme.primary }]}>
            ${item.price}
          </Text>
          <View style={localStyles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={localStyles.rating}>{item.rating}</Text>
            <Text style={localStyles.reviews}>({item.reviews})</Text>
          </View>
        </View>
        <View style={localStyles.actionButtons}>
          <TouchableOpacity 
            style={[localStyles.actionButton, { backgroundColor: theme.primary }]}
            onPress={() => handleAddToCart(item)}
          >
            <Ionicons name="cart-outline" size={16} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[localStyles.actionButton, { backgroundColor: theme.background.primary }]}
            onPress={() => handleToggleFavorite(item.id)}
          >
            <Ionicons 
              name={item.isFavorite ? "heart" : "heart-outline"} 
              size={16} 
              color={item.isFavorite ? theme.primary : theme.text.secondary} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[localStyles.actionButton, { backgroundColor: theme.background.primary }]}
            onPress={() => handleShare(item)}
          >
            <Ionicons name="share-outline" size={16} color={theme.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.screen, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background.secondary }]}>
      {/* Search Bar */}
      <View style={localStyles.searchContainer}>
        <View style={localStyles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color={theme.text.secondary} />
          <TextInput
            style={localStyles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            placeholderTextColor={theme.text.secondary}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Categories */}
        <View style={localStyles.categoriesContainer}>
          <TouchableOpacity
            style={[
              localStyles.categoryChip,
              !selectedCategory && localStyles.selectedCategoryChip
            ]}
            onPress={() => handleCategorySelect(null)}
          >
            <Text style={[
              localStyles.categoryText,
              !selectedCategory && localStyles.selectedCategoryText
            ]}>
              All
            </Text>
          </TouchableOpacity>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                localStyles.categoryChip,
                selectedCategory === category.id && localStyles.selectedCategoryChip
              ]}
              onPress={() => handleCategorySelect(category.id)}
            >
              <Ionicons 
                name={category.icon as any} 
                size={16} 
                color={selectedCategory === category.id ? '#FFFFFF' : theme.text.secondary}
                style={{ marginRight: 4 }}
              />
              <Text style={[
                localStyles.categoryText,
                selectedCategory === category.id && localStyles.selectedCategoryText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Featured Products */}
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Featured</Text>
          <FlatList
            data={featuredProducts}
            renderItem={renderFeaturedItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={localStyles.featuredList}
          />
        </View>

        {/* Products Grid */}
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Products</Text>
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={item => item.id}
            numColumns={2}
            columnWrapperStyle={localStyles.productsGrid}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
    fontSize: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedCategoryChip: {
    backgroundColor: '#FF424D',
  },
  categoryText: {
    fontSize: 14,
    color: '#666666',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  featuredList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  featuredCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  productsGrid: {
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  productCard: {
    width: (width - 48) / 2,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    aspectRatio: 1,
  },
  productContent: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  reviews: {
    fontSize: 14,
    color: '#999999',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
}); 