import { User } from '@/types';
import { getUsers, saveUsers, getCurrentUser, saveCurrentUser, generateId } from '@/lib/storage';

// Mock password for demo - in real app this would be hashed
const DEMO_PASSWORDS: Record<string, string> = {
  'admin@kryptosignatures.com': 'Admin#1234',
  'alice@example.com': 'User#1234',
  'bob@example.com': 'User#1234',
  'pending@example.com': 'User#1234',
};

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<User> {
    const { email, password } = credentials;
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    if (DEMO_PASSWORDS[user.email] !== password) {
      throw new Error('Invalid email or password');
    }
    
    if (user.status !== 'APPROVED') {
      throw new Error('Account is not approved. Please contact administrator.');
    }
    
    // Update last login
    user.lastLoginAt = new Date().toISOString();
    const updatedUsers = users.map(u => u.id === user.id ? user : u);
    saveUsers(updatedUsers);
    
    saveCurrentUser(user);
    return user;
  }
  
  static async register(data: RegisterData): Promise<User> {
    const { email, fullName, phone } = data;
    const users = getUsers();
    
    // Check if user already exists
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('User with this email already exists');
    }
    
    const newUser: User = {
      id: generateId(),
      email: email.toLowerCase(),
      role: 'USER',
      status: 'PENDING',
      profile: {
        fullName,
        phone,
      },
      balances: {
        available: 0,
        locked: 0,
        currency: 'USDT',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Store password for demo (in real app this would be hashed)
    DEMO_PASSWORDS[email.toLowerCase()] = data.password;
    
    users.push(newUser);
    saveUsers(users);
    
    return newUser;
  }
  
  static logout(): void {
    saveCurrentUser(null);
  }
  
  static getCurrentUser(): User | null {
    return getCurrentUser();
  }
  
  static isAuthenticated(): boolean {
    const user = getCurrentUser();
    return user !== null && user.status === 'APPROVED';
  }
  
  static async refreshUser(): Promise<User | null> {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;
    
    const users = getUsers();
    const updatedUser = users.find(u => u.id === currentUser.id);
    
    if (updatedUser) {
      saveCurrentUser(updatedUser);
      return updatedUser;
    }
    
    // User not found, clear session
    saveCurrentUser(null);
    return null;
  }
}