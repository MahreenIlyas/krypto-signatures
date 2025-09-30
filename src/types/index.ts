export type UserRole = 'ADMIN' | 'USER';
export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISABLED';
export type PlanStatus = 'ACTIVE' | 'ARCHIVED';
export type SubscriptionStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type DepositStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'PLAN_BUY' | 'LOCK_RELEASE' | 'ROI_CREDIT';
export type TransactionDirection = 'CREDIT' | 'DEBIT';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  profile: {
    fullName: string;
    phone?: string;
    avatarUrl?: string;
  };
  balances: {
    available: number;
    locked: number;
    currency: 'USDT';
  };
  emailVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  price: number;
  roiPercent: number;
  durationDays: number;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  plan?: Plan;
  principal: number;
  roiPercent: number;
  durationDays: number;
  status: SubscriptionStatus;
  startedAt: string;
  maturesAt: string;
  completedAt?: string;
  createdAt: string;
}

export interface Deposit {
  id: string;
  userId: string;
  user?: User;
  amount: number;
  status: DepositStatus;
  note?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  evidenceUrl?: string;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  user?: User;
  amount: number;
  status: WithdrawalStatus;
  destinationNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  paidAt?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  direction: TransactionDirection;
  balanceAfter: number;
  meta?: {
    subscriptionId?: string;
    planId?: string;
    depositId?: string;
    withdrawalId?: string;
  };
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AnalyticsData {
  totals: {
    users: number;
    activeUsers: number;
    plansSold: number;
    totalDeposited: number;
    totalWithdrawn: number;
    lockedTotal: number;
    availableTotal: number;
  };
  perPlan: Array<{
    planId: string;
    planTitle: string;
    count: number;
    volume: number;
  }>;
  charts: {
    depositsByDay: Array<{ date: string; amount: number }>;
    withdrawalsByDay: Array<{ date: string; amount: number }>;
    subscriptionsByMaturity: Array<{ month: string; count: number }>;
  };
}