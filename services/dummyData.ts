import { User } from "../models/user"
import { Group } from "../models/group"
import { Profile, WishlistItem, GroupMembership } from "../models/profile"
import { Product, Category, FeaturedProduct, PopularProduct } from "../models/product"

const now = new Date()

export const dummyUsers: (User & { password: string })[] = [
  {
    id: "1",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    password: "password",
    createdAt: now,
    updatedAt: now,
    isEmailVerified: true,
    role: "user",
    status: "active",
    preferences: {
      notifications: true,
      theme: "light"
    }
  },
  {
    id: "2",
    email: "jane@example.com",
    firstName: "Jane",
    lastName: "Smith",
    password: "password",
    createdAt: now,
    updatedAt: now,
    isEmailVerified: true,
    role: "user",
    status: "active",
    preferences: {
      notifications: true,
      theme: "dark"
    }
  }
]

export const dummyCategories: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    icon: 'laptop-outline',
    color: '#FF6B6B',
  },
  {
    id: '2',
    name: 'Fashion',
    icon: 'shirt-outline',
    color: '#4ECDC4',
  },
  {
    id: '3',
    name: 'Home',
    icon: 'home-outline',
    color: '#45B7D1',
  },
  {
    id: '4',
    name: 'Sports',
    icon: 'football-outline',
    color: '#96CEB4',
  },
  {
    id: '5',
    name: 'Books',
    icon: 'book-outline',
    color: '#D4A5A5',
  },
  {
    id: '6',
    name: 'Toys',
    icon: 'game-controller-outline',
    color: '#FFD93D',
  },
];

export const dummyProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Earbuds',
    description: 'High-quality wireless earbuds with noise cancellation',
    price: 129.99,
    originalPrice: 159.99,
    image: 'https://images.unsplash.com/photo-1631176093617-63490a3d785a',
    category: 'Electronics',
    rating: 4.5,
    reviews: 128,
    isFavorite: false,
    createdAt: now,
    updatedAt: now
  },
  {
    id: '2',
    name: 'Smart Watch',
    description: 'Fitness tracker with heart rate monitoring',
    price: 199.99,
    originalPrice: 249.99,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12',
    category: 'Electronics',
    rating: 4.7,
    reviews: 256,
    isFavorite: false,
    createdAt: now,
    updatedAt: now
  },
  {
    id: '3',
    name: 'Leather Backpack',
    description: 'Stylish and durable leather backpack',
    price: 79.99,
    originalPrice: 99.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62',
    category: 'Fashion',
    rating: 4.8,
    reviews: 89,
    isFavorite: false,
    createdAt: now,
    updatedAt: now
  },
  {
    id: '4',
    name: 'Yoga Mat',
    description: 'Non-slip exercise yoga mat',
    price: 29.99,
    originalPrice: 39.99,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f',
    category: 'Sports',
    rating: 4.6,
    reviews: 145,
    isFavorite: false,
    createdAt: now,
    updatedAt: now
  },
];

export const dummyFeaturedProducts: FeaturedProduct[] = [
  {
    id: '1',
    title: 'New Arrivals',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
    color: '#FFD93D',
  },
  {
    id: '2',
    title: 'Best Sellers',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    color: '#FF6B6B',
  },
  {
    id: '3',
    title: 'Special Offers',
    image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad',
    color: '#4ECDC4',
  },
];

export const dummyPopularProducts: PopularProduct[] = [
  {
    id: '1',
    name: 'Leather Bag',
    price: '$129.99',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa',
    description: 'Premium leather backpack',
    rating: 4.5,
  },
  {
    id: '2',
    name: 'Mouse Logitech',
    price: '$49.99',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46',
    description: 'Wireless gaming mouse',
    rating: 4.8,
  },
  {
    id: '3',
    name: 'T-Shirt Black',
    price: '$24.99',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a',
    description: 'Classic black t-shirt',
    rating: 4.2,
  },
  {
    id: '4',
    name: 'Headphones',
    price: '$199.99',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    description: 'Wireless noise cancelling',
    rating: 4.7,
  },
];

export const dummyGroups: Group[] = [
  {
    id: "1",
    name: "Family Christmas",
    description: "Annual family gift exchange",
    coverImage: "https://example.com/logo.png",
    createdAt: now,
    updatedAt: now,
    creatorId: dummyUsers[0].id,
    settings: {
      isPrivate: true,
      allowInvites: true,
      showWishlists: true,
      enableMatching: true,
      notifyNewMembers: true,
      joinRequiresApproval: true,
      maxMembers: 10
    },
    members: [dummyUsers[0], dummyUsers[1]],
    admins: [dummyUsers[0]],
    status: "active"
  }
]

// Create some dummy wishlist items
const dummyWishlistItems: Record<string, WishlistItem[]> = {
  "1": [
    {
      id: "w1",
      name: "Mechanical Keyboard",
      description: "A nice mechanical keyboard with brown switches",
      url: "https://example.com/keyboard",
      price: 150,
      createdAt: now,
      updatedAt: now,
      userId: "1"
    },
    {
      id: "w2",
      name: "Programming Book",
      description: "Latest book on TypeScript development",
      url: "https://example.com/book",
      price: 45,
      createdAt: now,
      updatedAt: now,
      userId: "1"
    }
  ],
  "2": [
    {
      id: "w3",
      name: "Drawing Tablet",
      description: "Digital drawing tablet for design work",
      url: "https://example.com/tablet",
      price: 200,
      createdAt: now,
      updatedAt: now,
      userId: "2"
    },
    {
      id: "w4",
      name: "Design Course",
      description: "Advanced UI/UX design course",
      url: "https://example.com/course",
      price: 99,
      createdAt: now,
      updatedAt: now,
      userId: "2"
    }
  ]
}

// Create profiles after groups since profiles need group information
export const dummyProfiles: Profile[] = [
  {
    ...dummyUsers[0],
    groups: [{
      group: dummyGroups[0],
      joinedAt: now,
      role: 'admin',
      match: {
        matchedUserId: "2",
        matchedAt: now,
        isGiver: true
      }
    }],
    wishlist: dummyWishlistItems["1"],
    bio: "Software developer passionate about TypeScript",
    interests: ["coding", "reading", "hiking"],
    location: {
      city: "San Francisco",
      country: "USA"
    },
    socialLinks: {
      twitter: "johndoe",
      github: "johndoe"
    }
  },
  {
    ...dummyUsers[1],
    groups: [{
      group: dummyGroups[0],
      joinedAt: now,
      role: 'member',
      match: {
        matchedUserId: "1",
        matchedAt: now,
        isGiver: false
      }
    }],
    wishlist: dummyWishlistItems["2"],
    bio: "UX Designer with a love for clean interfaces",
    interests: ["design", "art", "photography"],
    location: {
      city: "New York",
      country: "USA"
    },
    socialLinks: {
      instagram: "janesmith",
      linkedin: "janesmith"
    }
  }
]

export interface Match {
  id: string;
  groupId: string;
  giverId: string;
  receiverId: string;
  createdAt: Date;
}

export const dummyMatches: Match[] = [
  {
    id: "1",
    groupId: "1",
    giverId: "1",
    receiverId: "2",
    createdAt: now
  },
  {
    id: "2",
    groupId: "1",
    giverId: "2",
    receiverId: "1",
    createdAt: now
  }
]
  
  