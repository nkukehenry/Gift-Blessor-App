export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  phoneNumber?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  isEmailVerified: boolean;
  preferences?: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'system';
  };
  role: 'user' | 'admin' | 'moderator';
  status: 'active' | 'inactive' | 'suspended';
} 