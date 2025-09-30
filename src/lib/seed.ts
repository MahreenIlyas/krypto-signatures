import { User, Plan, Subscription, Deposit, Transaction } from '@/types';
import { 
  generateId, saveUsers, savePlans, saveSubscriptions, 
  saveDeposits, saveTransactions, markAsInitialized, isInitialized 
} from '@/lib/storage';

export function seedData(): void {
  if (isInitialized()) return;

  console.log('Seeding initial data...');

  // Create admin user
  const admin: User = {
    id: generateId(),
    email: 'admin@kryptosignatures.com',
    role: 'ADMIN',
    status: 'APPROVED',
    profile: {
      fullName: 'System Administrator',
      phone: '+1-555-0100',
    },
    balances: {
      available: 0,
      locked: 0,
      currency: 'USDT',
    },
    emailVerifiedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  // Create test users
  const alice: User = {
    id: generateId(),
    email: 'alice@example.com',
    role: 'USER',
    status: 'APPROVED',
    profile: {
      fullName: 'Alice Johnson',
      phone: '+1-555-0101',
    },
    balances: {
      available: 150,
      locked: 850,
      currency: 'USDT',
    },
    emailVerifiedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  const bob: User = {
    id: generateId(),
    email: 'bob@example.com',
    role: 'USER',
    status: 'APPROVED',
    profile: {
      fullName: 'Bob Smith',
      phone: '+1-555-0102',
    },
    balances: {
      available: 500,
      locked: 0,
      currency: 'USDT',
    },
    emailVerifiedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Create pending user
  const pending: User = {
    id: generateId(),
    email: 'pending@example.com',
    role: 'USER',
    status: 'PENDING',
    profile: {
      fullName: 'Pending User',
    },
    balances: {
      available: 0,
      locked: 0,
      currency: 'USDT',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const users = [admin, alice, bob, pending];
  saveUsers(users);

  // Create plans
  const basicPlan: Plan = {
    id: generateId(),
    title: 'Basic Plan',
    description: 'Perfect for beginners. Low risk, steady returns.',
    price: 100,
    roiPercent: 10,
    durationDays: 30,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const premiumPlan: Plan = {
    id: generateId(),
    title: 'Premium Plan',
    description: 'Balanced risk and reward for experienced investors.',
    price: 250,
    roiPercent: 20,
    durationDays: 90,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const platinumPlan: Plan = {
    id: generateId(),
    title: 'Platinum Plan',
    description: 'Maximum returns for high-value investors.',
    price: 500,
    roiPercent: 30,
    durationDays: 180,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const archivedPlan: Plan = {
    id: generateId(),
    title: 'Legacy Plan',
    description: 'Archived plan for historical reference.',
    price: 150,
    roiPercent: 15,
    durationDays: 60,
    status: 'ARCHIVED',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const plans = [basicPlan, premiumPlan, platinumPlan, archivedPlan];
  savePlans(plans);

  // Create Alice's subscriptions (she bought all plans)
  const now = new Date();
  const aliceBasicSub: Subscription = {
    id: generateId(),
    userId: alice.id,
    planId: basicPlan.id,
    principal: 100,
    roiPercent: 10,
    durationDays: 30,
    status: 'ACTIVE',
    startedAt: new Date(now.getTime() - 86400000 * 15).toISOString(), // 15 days ago
    maturesAt: new Date(now.getTime() + 86400000 * 15).toISOString(), // 15 days from now
    createdAt: new Date(now.getTime() - 86400000 * 15).toISOString(),
  };

  const alicePremiumSub: Subscription = {
    id: generateId(),
    userId: alice.id,
    planId: premiumPlan.id,
    principal: 250,
    roiPercent: 20,
    durationDays: 90,
    status: 'ACTIVE',
    startedAt: new Date(now.getTime() - 86400000 * 10).toISOString(), // 10 days ago
    maturesAt: new Date(now.getTime() + 86400000 * 80).toISOString(), // 80 days from now
    createdAt: new Date(now.getTime() - 86400000 * 10).toISOString(),
  };

  const alicePlatinumSub: Subscription = {
    id: generateId(),
    userId: alice.id,
    planId: platinumPlan.id,
    principal: 500,
    roiPercent: 30,
    durationDays: 180,
    status: 'ACTIVE',
    startedAt: new Date(now.getTime() - 86400000 * 5).toISOString(), // 5 days ago
    maturesAt: new Date(now.getTime() + 86400000 * 175).toISOString(), // 175 days from now
    createdAt: new Date(now.getTime() - 86400000 * 5).toISOString(),
  };

  // Create a completed subscription for demo
  const completedSub: Subscription = {
    id: generateId(),
    userId: alice.id,
    planId: basicPlan.id,
    principal: 100,
    roiPercent: 10,
    durationDays: 30,
    status: 'COMPLETED',
    startedAt: new Date(now.getTime() - 86400000 * 45).toISOString(), // 45 days ago
    maturesAt: new Date(now.getTime() - 86400000 * 15).toISOString(), // matured 15 days ago
    completedAt: new Date(now.getTime() - 86400000 * 15).toISOString(),
    createdAt: new Date(now.getTime() - 86400000 * 45).toISOString(),
  };

  const subscriptions = [aliceBasicSub, alicePremiumSub, alicePlatinumSub, completedSub];
  saveSubscriptions(subscriptions);

  // Create Alice's approved deposit
  const aliceDeposit: Deposit = {
    id: generateId(),
    userId: alice.id,
    amount: 1000,
    status: 'APPROVED',
    note: 'Initial deposit via bank transfer',
    reviewedBy: admin.id,
    reviewedAt: new Date(now.getTime() - 86400000 * 20).toISOString(),
    createdAt: new Date(now.getTime() - 86400000 * 21).toISOString(),
  };

  // Create Bob's pending deposit
  const bobDeposit: Deposit = {
    id: generateId(),
    userId: bob.id,
    amount: 500,
    status: 'PENDING',
    note: 'Wire transfer confirmation attached',
    createdAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
  };

  const deposits = [aliceDeposit, bobDeposit];
  saveDeposits(deposits);

  // Create transaction history for Alice
  const transactions: Transaction[] = [
    // Alice's deposit
    {
      id: generateId(),
      userId: alice.id,
      type: 'DEPOSIT',
      amount: 1000,
      direction: 'CREDIT',
      balanceAfter: 1000,
      meta: { depositId: aliceDeposit.id },
      createdAt: new Date(now.getTime() - 86400000 * 20).toISOString(),
    },
    // Alice's plan purchases
    {
      id: generateId(),
      userId: alice.id,
      type: 'PLAN_BUY',
      amount: 100,
      direction: 'DEBIT',
      balanceAfter: 900,
      meta: { subscriptionId: aliceBasicSub.id, planId: basicPlan.id },
      createdAt: new Date(now.getTime() - 86400000 * 15).toISOString(),
    },
    {
      id: generateId(),
      userId: alice.id,
      type: 'PLAN_BUY',
      amount: 250,
      direction: 'DEBIT',
      balanceAfter: 650,
      meta: { subscriptionId: alicePremiumSub.id, planId: premiumPlan.id },
      createdAt: new Date(now.getTime() - 86400000 * 10).toISOString(),
    },
    {
      id: generateId(),
      userId: alice.id,
      type: 'PLAN_BUY',
      amount: 500,
      direction: 'DEBIT',
      balanceAfter: 150,
      meta: { subscriptionId: alicePlatinumSub.id, planId: platinumPlan.id },
      createdAt: new Date(now.getTime() - 86400000 * 5).toISOString(),
    },
    // Completed subscription payout
    {
      id: generateId(),
      userId: alice.id,
      type: 'LOCK_RELEASE',
      amount: 100,
      direction: 'CREDIT',
      balanceAfter: 250,
      meta: { subscriptionId: completedSub.id },
      createdAt: new Date(now.getTime() - 86400000 * 15).toISOString(),
    },
    {
      id: generateId(),
      userId: alice.id,
      type: 'ROI_CREDIT',
      amount: 10,
      direction: 'CREDIT',
      balanceAfter: 260,
      meta: { subscriptionId: completedSub.id },
      createdAt: new Date(now.getTime() - 86400000 * 15).toISOString(),
    },
  ];

  saveTransactions(transactions);
  markAsInitialized();
  
  console.log('Seed data created successfully!');
  console.log('Admin: admin@kryptosignatures.com / Admin#1234');
  console.log('User: alice@example.com / User#1234');
  console.log('User: bob@example.com / User#1234');
}