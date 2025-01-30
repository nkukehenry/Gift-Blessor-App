import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  useColorScheme,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { createThemedStyles, spacing } from '../constants/Styles';

// Temporary mock data
const GIFT_IDEAS = [
  {
    id: '1',
    title: 'Thoughtful Gifts',
    description: 'Curated collection of meaningful presents',
    icon: 'heart-outline',
    image: 'https://images.unsplash.com/photo-1514207994142-98522b5a2b23?q=80&w=1963&auto=format&fit=crop'
  },
  {
    id: '2',
    title: 'Handmade Gifts',
    description: 'Personal and unique presents',
    icon: 'heart-outline',
    image: 'https://placekitten.com/401/200',
  },
  {
    id: '3',
    title: 'Budget Friendly',
    description: 'Thoughtful gifts under $50',
    icon: 'wallet-outline',
    image: 'https://placekitten.com/402/200',
  },
];

const OCCASIONS = [
  { id: '1', name: 'Birthday', icon: 'gift-outline' },
  { id: '2', name: 'Wedding', icon: 'heart-outline' },
  { id: '3', name: 'Anniversary', icon: 'calendar-outline' },
  { id: '4', name: 'Graduation', icon: 'school-outline' },
  { id: '5', name: 'Christmas', icon: 'snow-outline' },
];

export default function GiftIdeasScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const styles = createThemedStyles(theme);
  const router = useRouter();

  return (
    <View style={[styles.screen, { backgroundColor: '#FFFFFF' }]}>
      <View style={[styles.header, { paddingTop: 30, paddingBottom: 0, paddingHorizontal: 16 }]}>
        <Text style={[styles.headerTitle, { color: '#FF424D' }]}>Gift Ideas</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Occasions */}
        <View style={localStyles.section}>
          <Text style={[styles.cardTitle, localStyles.sectionTitle]}>
            Browse by Occasion
          </Text>
          <View style={localStyles.occasionsGrid}>
            {OCCASIONS.map(occasion => (
              <TouchableOpacity
                key={occasion.id}
                style={localStyles.occasionCard}
                onPress={() => router.push({
                  pathname: "/occasion/[id]",
                  params: { id: occasion.id }
                })}
              >
                <View style={localStyles.occasionIcon}>
                  <Ionicons 
                    name={occasion.icon as any} 
                    size={24} 
                    color={theme.primary}
                  />
                </View>
                <Text style={localStyles.occasionName}>{occasion.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Collections */}
        <View style={localStyles.section}>
          <Text style={[styles.cardTitle, localStyles.sectionTitle]}>
            Featured Collections
          </Text>
          {GIFT_IDEAS.map(collection => (
            <TouchableOpacity
              key={collection.id}
              style={localStyles.collectionCard}
              onPress={() => router.push({
                pathname: "/collection/[id]",
                params: { id: collection.id }
              })}
            >
              <Image
                source={{ uri: collection.image }}
                style={localStyles.collectionImage}
              />
              <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
                style={localStyles.collectionOverlay}
              >
                <Ionicons 
                  name={collection.icon as any} 
                  size={24} 
                  color="#FFFFFF"
                />
                <Text style={localStyles.collectionTitle}>
                  {collection.title}
                </Text>
                <Text style={localStyles.collectionDescription}>
                  {collection.description}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  collectionCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    height: 200,
  },
  collectionImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  collectionOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  collectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  collectionDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  occasionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.sm,
  },
  occasionCard: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  occasionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  occasionName: {
    fontSize: 12,
    textAlign: 'center',
  },
}); 