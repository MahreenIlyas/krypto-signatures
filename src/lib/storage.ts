import { User, Plan, Subscription, Deposit, Withdrawal, Transaction } from '@/types';

// Storage keys
const STORAGE_KEYS = {
  USERS: 'krypto_users',
  PLANS: 'krypto_plans',
  SUBSCRIPTIONS: 'krypto_subscriptions',
  DEPOSITS: 'krypto_deposits',
  WITHDRAWALS: 'krypto_withdrawals',
  TRANSACTIONS: 'krypto_transactions',
  CURRENT_USER: 'krypto_current_user',
  INITIALIZED: 'krypto_initialized',
} as const;

// Generic storage functions
export function getFromStorage<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveToStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// User functions
export function getUsers(): User[] {
  return getFromStorage<User>(STORAGE_KEYS.USERS);
}

export function saveUsers(users: User[]): void {
  saveToStorage(STORAGE_KEYS.USERS, users);
}

export function getCurrentUser(): User | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

// Plan functions
export function getPlans(): Plan[] {
  return getFromStorage<Plan>(STORAGE_KEYS.PLANS);
}

export function savePlans(plans: Plan[]): void {
  saveToStorage(STORAGE_KEYS.PLANS, plans);
}

// Subscription functions
export function getSubscriptions(): Subscription[] {
  return getFromStorage<Subscription>(STORAGE_KEYS.SUBSCRIPTIONS);
}

export function saveSubscriptions(subscriptions: Subscription[]): void {
  saveToStorage(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions);
}

// Deposit functions
export function getDeposits(): Deposit[] {
  return getFromStorage<Deposit>(STORAGE_KEYS.DEPOSITS);
}

export function saveDeposits(deposits: Deposit[]): void {
  saveToStorage(STORAGE_KEYS.DEPOSITS, deposits);
}

// Withdrawal functions
export function getWithdrawals(): Withdrawal[] {
  return getFromStorage<Withdrawal>(STORAGE_KEYS.WITHDRAWALS);
}

export function saveWithdrawals(withdrawals: Withdrawal[]): void {
  saveToStorage(STORAGE_KEYS.WITHDRAWALS, withdrawals);
}

// Transaction functions
export function getTransactions(): Transaction[] {
  return getFromStorage<Transaction>(STORAGE_KEYS.TRANSACTIONS);
}

export function saveTransactions(transactions: Transaction[]): void {
  saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
}

// Initialization check
export function isInitialized(): boolean {
  return localStorage.getItem(STORAGE_KEYS.INITIALIZED) === 'true';
}

export function markAsInitialized(): void {
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
}

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}