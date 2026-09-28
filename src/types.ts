export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'member' | 'manager' | 'viewer';
  status: 'active' | 'suspended' | 'pending';
  phoneNumber?: string;
  bio?: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export type AuthMode = 'login' | 'register' | 'forgot-password' | 'verify-email';
