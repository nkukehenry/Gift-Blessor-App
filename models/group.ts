import { User } from './user';

export interface GroupSettings {
  isPrivate: boolean;
  allowInvites: boolean;
  showWishlists: boolean;
  enableMatching: boolean;
  notifyNewMembers: boolean;
  joinRequiresApproval: boolean;
  maxMembers?: number;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  settings: GroupSettings;
  members: User[];
  admins: User[];
  status: 'active' | 'archived' | 'deleted';
}

export interface CreateGroupData {
  name: string;
  description: string;
  coverImage?: string;
  settings?: Partial<GroupSettings>;
}

export interface UpdateGroupData {
  name?: string;
  description?: string;
  coverImage?: string;
  settings?: Partial<GroupSettings>;
}

export interface JoinGroupData {
  groupId: string;
  userId: string;
} 