import { User } from "../models/user"
import { Group, CreateGroupData, UpdateGroupData } from "../models/group"
import { Profile, CreateProfileData, WishlistItem, GroupMembership } from "../models/profile"
import { Product, Category, FeaturedProduct, PopularProduct } from "../models/product"
import { mockUsers, mockGroups, mockProfiles, mockCategories, mockProducts, mockFeaturedProducts, mockPopularProducts } from "./mocks/data"
import AsyncStorage from "@react-native-async-storage/async-storage"

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api'
const USE_MOCK_DATA = process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true'

const getToken = async () => {
  return AsyncStorage.getItem('userToken')
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
  password: string;
}

interface OTPResponse {
  success: boolean;
  message?: string;
}

interface VerifyOTPResponse {
  success: boolean;
  message?: string;
  token?: string;
}

interface GroupParticipant extends User {
  isMatch: boolean;
}

interface CreateUserData {
  phoneNumber: string;
  firstName: string;
  lastName: string;
}

class ProductService {
  async getCategories(): Promise<Category[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return mockCategories
    }

    const response = await fetch(`${API_URL}/categories`)
    if (!response.ok) {
      throw new Error('Failed to fetch categories')
    }
    return response.json()
  }

  async getProducts(): Promise<Product[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return mockProducts
    }

    const response = await fetch(`${API_URL}/products`)
    if (!response.ok) {
      throw new Error('Failed to fetch products')
    }
    return response.json()
  }

  async getFeaturedProducts(): Promise<FeaturedProduct[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return mockFeaturedProducts
    }

    const response = await fetch(`${API_URL}/products/featured`)
    if (!response.ok) {
      throw new Error('Failed to fetch featured products')
    }
    return response.json()
  }

  async getPopularProducts(): Promise<PopularProduct[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return mockPopularProducts
    }

    const response = await fetch(`${API_URL}/products/popular`)
    if (!response.ok) {
      throw new Error('Failed to fetch popular products')
    }
    return response.json()
  }

  async getProductById(id: string): Promise<Product> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const product = mockProducts.find((p: Product) => p.id === id)
      if (!product) {
        throw new Error("Product not found")
      }
      return product
    }

    const response = await fetch(`${API_URL}/products/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch product')
    }
    return response.json()
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return mockProducts.filter((p: Product) => p.category === categoryId)
    }

    const response = await fetch(`${API_URL}/categories/${categoryId}/products`)
    if (!response.ok) {
      throw new Error('Failed to fetch products by category')
    }
    return response.json()
  }

  async toggleFavorite(productId: string, userId: string): Promise<Product> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const productIndex = mockProducts.findIndex((p: Product) => p.id === productId)
      if (productIndex === -1) {
        throw new Error("Product not found")
      }
      mockProducts[productIndex].isFavorite = !mockProducts[productIndex].isFavorite
      return mockProducts[productIndex]
    }

    const response = await fetch(`${API_URL}/products/${productId}/favorite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getToken()}`
      },
      body: JSON.stringify({ userId })
    })
    if (!response.ok) {
      throw new Error('Failed to toggle favorite')
    }
    return response.json()
  }

  async getFavorites(userId: string): Promise<Product[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return mockProducts.filter((p: Product) => p.isFavorite)
    }

    const response = await fetch(`${API_URL}/users/${userId}/favorites`)
    if (!response.ok) {
      throw new Error('Failed to fetch favorites')
    }
    return response.json()
  }

  async searchProducts(query: string): Promise<Product[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const lowercaseQuery = query.toLowerCase()
      return mockProducts.filter((p: Product) => 
        p.name.toLowerCase().includes(lowercaseQuery) ||
        p.description.toLowerCase().includes(lowercaseQuery)
      )
    }

    const response = await fetch(`${API_URL}/products/search?q=${encodeURIComponent(query)}`)
    if (!response.ok) {
      throw new Error('Failed to search products')
    }
    return response.json()
  }
}

class AuthService {
  async login({ email, password }: LoginCredentials): Promise<Omit<User, 'password'>> {
    if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
      const user = mockUsers.find((u: User & { password: string }) => u.email === email && u.password === password)
    if (user) {
        const { password: _, ...userWithoutPassword } = user
        return userWithoutPassword
      }
      throw new Error("Invalid credentials")
    }

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!response.ok) {
      throw new Error('Invalid credentials')
    }
    return response.json()
  }

  async signup(userData: SignupData): Promise<Omit<User, 'password'>> {
    if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
      const newUser = {
        ...userData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isEmailVerified: false,
        role: 'user' as const,
        status: 'active' as const
      }
      mockUsers.push({ ...newUser, password: userData.password })
      const { password: _, ...userWithoutPassword } = newUser
      return userWithoutPassword
    }

    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    if (!response.ok) {
      throw new Error('Failed to create account')
    }
    return response.json()
  }

  async createUser(userData: CreateUserData): Promise<Omit<User, 'password'>> {
    if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
      const newUser = {
        id: crypto.randomUUID(),
        email: `${userData.phoneNumber}@temp.com`, // Temporary email until user sets it
        phoneNumber: userData.phoneNumber,
        firstName: userData.firstName,
        lastName: userData.lastName,
        createdAt: new Date(),
        updatedAt: new Date(),
        isEmailVerified: false,
        role: 'user' as const,
        status: 'active' as const
      }
      mockUsers.push({ ...newUser, password: crypto.randomUUID() }) // Random password until user sets it
      return newUser
    }

    const response = await fetch(`${API_URL}/auth/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    if (!response.ok) {
      throw new Error('Failed to create user')
    }
    return response.json()
  }

  async sendOTP(phoneNumber: string): Promise<OTPResponse> {
    if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
      // In mock mode, always succeed for testing
      return {
        success: true,
        message: "OTP sent successfully"
      }
    }

    const response = await fetch(`${API_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber })
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to send OTP' }))
      throw new Error(error.message)
    }
    return response.json()
  }

  async verifyOTP(phoneNumber: string, code: string): Promise<VerifyOTPResponse> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      // In mock mode, any code "1234" is considered valid
      if (code === "1234") {
        return {
          success: true,
          token: "mock_token_" + crypto.randomUUID()
        };
      }
      return {
        success: false,
        message: "Invalid verification code"
      };
    }

    const response = await fetch(`${API_URL}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ phoneNumber, code })
    });

    if (!response.ok) {
      throw new Error("Failed to verify OTP");
    }

    return response.json();
  }
}

class GroupService {
  async getGroups(userId: string): Promise<Group[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return mockGroups.filter(g => g.members.some(m => m.id === userId))
    }

    const response = await fetch(`${API_URL}/users/${userId}/groups`, {
      headers: {
        'Authorization': `Bearer ${await getToken()}`
      }
    })
    if (!response.ok) {
      throw new Error('Failed to fetch user groups')
    }
    return response.json()
  }

  async createGroup(data: CreateGroupData & { creatorId: string }): Promise<Group> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const creator = mockUsers.find(u => u.id === data.creatorId)
      if (!creator) {
        throw new Error('Creator not found')
      }
      const newGroup: Group = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [creator],
        admins: [creator],
        status: 'active',
        settings: {
          isPrivate: true,
          allowInvites: true,
          showWishlists: true,
          enableMatching: true,
          notifyNewMembers: true,
          joinRequiresApproval: false,
          maxMembers: 50
        }
      }
      mockGroups.push(newGroup)
      return newGroup
    }

    const response = await fetch(`${API_URL}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getToken()}`
      },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      throw new Error('Failed to create group')
    }
    return response.json()
  }

  async updateGroupSettings(groupId: string, settings: Partial<Group['settings']>): Promise<Group> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const groupIndex = mockGroups.findIndex(g => g.id === groupId)
      if (groupIndex === -1) {
        throw new Error('Group not found')
      }
      mockGroups[groupIndex].settings = {
        ...mockGroups[groupIndex].settings,
        ...settings
      }
      mockGroups[groupIndex].updatedAt = new Date()
      return mockGroups[groupIndex]
    }

    const response = await fetch(`${API_URL}/groups/${groupId}/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getToken()}`
      },
      body: JSON.stringify({ settings })
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update group settings' }))
      throw new Error(error.message)
    }
    return response.json()
  }

  async deleteGroup(groupId: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const groupIndex = mockGroups.findIndex(g => g.id === groupId)
      if (groupIndex === -1) {
        throw new Error('Group not found')
      }
      mockGroups.splice(groupIndex, 1)
      return
    }

    const response = await fetch(`${API_URL}/groups/${groupId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${await getToken()}`
      }
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete group' }))
      throw new Error(error.message)
    }
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const groupIndex = mockGroups.findIndex(g => g.id === groupId)
      if (groupIndex === -1) {
        throw new Error('Group not found')
      }
      mockGroups[groupIndex].members = mockGroups[groupIndex].members.filter(m => m.id !== userId)
      mockGroups[groupIndex].admins = mockGroups[groupIndex].admins.filter(a => a.id !== userId)
      mockGroups[groupIndex].updatedAt = new Date()
      return
    }

    const response = await fetch(`${API_URL}/groups/${groupId}/members/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${await getToken()}`
      }
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to leave group' }))
      throw new Error(error.message)
    }
  }

  async joinGroup(groupId: string, userId: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const groupIndex = mockGroups.findIndex(g => g.id === groupId)
      if (groupIndex === -1) {
        throw new Error('Group not found')
      }
      const user = mockUsers.find(u => u.id === userId)
      if (!user) {
        throw new Error('User not found')
      }
      if (mockGroups[groupIndex].members.some(m => m.id === userId)) {
        throw new Error('User is already a member of this group')
      }
      mockGroups[groupIndex].members.push(user)
      mockGroups[groupIndex].updatedAt = new Date()
      return
    }

    const response = await fetch(`${API_URL}/groups/${groupId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getToken()}`
      },
      body: JSON.stringify({ userId })
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to join group' }))
      throw new Error(error.message)
    }
  }
}

export const api = {
  products: new ProductService(),
  auth: new AuthService(),
  groups: new GroupService(),
};

