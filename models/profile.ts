import { User } from "./user";
import { Group } from "./group";

export interface WishlistItem {
  id: string;
  name: string;
  description: string;
  price?: number;
  url?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface GroupMembership {
  group: Group;
  joinedAt: Date;
  role: 'member' | 'admin';
  match?: {
    matchedUserId: string;
    matchedAt: Date;
    isGiver: boolean;
  };
}

export interface GroupParticipant extends User {
  isMatch: boolean;
}

export interface Profile extends Omit<User, 'password'> {
  groups: GroupMembership[];
  wishlist: WishlistItem[];
  bio?: string;
  interests?: string[];
  location?: {
    city?: string;
    country?: string;
  };
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface CreateProfileData extends Omit<Profile, 'id' | 'createdAt' | 'updatedAt' | 'groups' | 'wishlist'> {} 