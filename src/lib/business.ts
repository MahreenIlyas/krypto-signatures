import { User, Plan, Subscription, Deposit, Withdrawal, Transaction } from '@/types';
import { 
  getUsers, saveUsers, getPlans, getSubscriptions, saveSubscriptions,
  getDeposits, saveDeposits, getWithdrawals, saveWithdrawals,
  getTransactions, saveTransactions, generateId, saveCurrentUser
} from '@/lib/storage';

// Business logic for plan purchases
export function purchasePlan(userId: string, planId: string): { success: boolean; message: string; subscription?: Subscription } {
  const users = getUsers();
  const plans = getPlans();
  const subscriptions = getSubscriptions();
  const transactions = getTransactions();

  const user = users.find(u => u.id === userId);
  const plan = plans.find(p => p.id === planId);

  if (!user) {
    return { success: false, message: 'User not found' };
  }

  if (!plan || plan.status !== 'ACTIVE') {
    return { success: false, message: 'Plan not available' };
  }

  if (user.balances.available < plan.price) {
    return { success: false, message: 'Insufficient available balance' };
  }

  // Create subscription
  const now = new Date();
  const maturesAt = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
  
  const subscription: Subscription = {
    id: generateId(),
    userId,
    planId,
    principal: plan.price,
    roiPercent: plan.roiPercent,
    durationDays: plan.durationDays,
    status: 'ACTIVE',
    startedAt: now.toISOString(),
    maturesAt: maturesAt.toISOString(),
    createdAt: now.toISOString(),
  };

  // Update user balances
  user.balances.available -= plan.price;
  user.balances.locked += plan.price;
  user.updatedAt = now.toISOString();

  // Create transaction
  const transaction: Transaction = {
    id: generateId(),
    userId,
    type: 'PLAN_BUY',
    amount: plan.price,
    direction: 'DEBIT',
    balanceAfter: user.balances.available,
    meta: { subscriptionId: subscription.id, planId },
    createdAt: now.toISOString(),
  };

  // Save all changes
  subscriptions.push(subscription);
  saveSubscriptions(subscriptions);
  
  transactions.push(transaction);
  saveTransactions(transactions);
  
  const updatedUsers = users.map(u => u.id === userId ? user : u);
  saveUsers(updatedUsers);
  saveCurrentUser(user);

  return { 
    success: true, 
    message: `Successfully purchased ${plan.title}`, 
    subscription 
  };
}

// Admin: Approve deposit
export function approveDeposit(depositId: string, adminId: string): { success: boolean; message: string } {
  const deposits = getDeposits();
  const users = getUsers();
  const transactions = getTransactions();

  const deposit = deposits.find(d => d.id === depositId);
  if (!deposit || deposit.status !== 'PENDING') {
    return { success: false, message: 'Deposit not found or already processed' };
  }

  const user = users.find(u => u.id === deposit.userId);
  if (!user) {
    return { success: false, message: 'User not found' };
  }

  const now = new Date();

  // Update deposit
  deposit.status = 'APPROVED';
  deposit.reviewedBy = adminId;
  deposit.reviewedAt = now.toISOString();

  // Update user balance
  user.balances.available += deposit.amount;
  user.updatedAt = now.toISOString();

  // Create transaction
  const transaction: Transaction = {
    id: generateId(),
    userId: deposit.userId,
    type: 'DEPOSIT',
    amount: deposit.amount,
    direction: 'CREDIT',
    balanceAfter: user.balances.available,
    meta: { depositId },
    createdAt: now.toISOString(),
  };

  // Save changes
  saveDeposits(deposits);
  transactions.push(transaction);
  saveTransactions(transactions);
  const updatedUsers = users.map(u => u.id === deposit.userId ? user : u);
  saveUsers(updatedUsers);

  return { success: true, message: 'Deposit approved successfully' };
}

// Admin: Reject deposit
export function rejectDeposit(depositId: string, adminId: string): { success: boolean; message: string } {
  const deposits = getDeposits();
  
  const deposit = deposits.find(d => d.id === depositId);
  if (!deposit || deposit.status !== 'PENDING') {
    return { success: false, message: 'Deposit not found or already processed' };
  }

  const now = new Date();
  deposit.status = 'REJECTED';
  deposit.reviewedBy = adminId;
  deposit.reviewedAt = now.toISOString();

  saveDeposits(deposits);
  return { success: true, message: 'Deposit rejected' };
}

// Admin: Approve withdrawal
export function approveWithdrawal(withdrawalId: string, adminId: string): { success: boolean; message: string } {
  const withdrawals = getWithdrawals();
  
  const withdrawal = withdrawals.find(w => w.id === withdrawalId);
  if (!withdrawal || withdrawal.status !== 'PENDING') {
    return { success: false, message: 'Withdrawal not found or already processed' };
  }

  const now = new Date();
  withdrawal.status = 'APPROVED';
  withdrawal.reviewedBy = adminId;
  withdrawal.reviewedAt = now.toISOString();

  saveWithdrawals(withdrawals);
  return { success: true, message: 'Withdrawal approved' };
}

// Admin: Mark withdrawal as paid
export function markWithdrawalPaid(withdrawalId: string, adminId: string): { success: boolean; message: string } {
  const withdrawals = getWithdrawals();
  
  const withdrawal = withdrawals.find(w => w.id === withdrawalId);
  if (!withdrawal || withdrawal.status !== 'APPROVED') {
    return { success: false, message: 'Withdrawal not found or not approved' };
  }

  const now = new Date();
  withdrawal.status = 'PAID';
  withdrawal.paidAt = now.toISOString();

  saveWithdrawals(withdrawals);
  return { success: true, message: 'Withdrawal marked as paid' };
}

// Create withdrawal request
export function createWithdrawalRequest(userId: string, amount: number, destinationNote: string): { success: boolean; message: string } {
  const users = getUsers();
  const withdrawals = getWithdrawals();
  const transactions = getTransactions();

  const user = users.find(u => u.id === userId);
  if (!user) {
    return { success: false, message: 'User not found' };
  }

  if (user.balances.available < amount) {
    return { success: false, message: 'Insufficient available balance' };
  }

  const now = new Date();

  // Create withdrawal
  const withdrawal: Withdrawal = {
    id: generateId(),
    userId,
    amount,
    status: 'PENDING',
    destinationNote,
    createdAt: now.toISOString(),
  };

  // Deduct from available balance immediately
  user.balances.available -= amount;
  user.updatedAt = now.toISOString();

  // Create transaction
  const transaction: Transaction = {
    id: generateId(),
    userId,
    type: 'WITHDRAWAL',
    amount,
    direction: 'DEBIT',
    balanceAfter: user.balances.available,
    meta: { withdrawalId: withdrawal.id },
    createdAt: now.toISOString(),
  };

  // Save changes
  withdrawals.push(withdrawal);
  saveWithdrawals(withdrawals);
  
  transactions.push(transaction);
  saveTransactions(transactions);
  
  const updatedUsers = users.map(u => u.id === userId ? user : u);
  saveUsers(updatedUsers);
  saveCurrentUser(user);

  return { success: true, message: 'Withdrawal request submitted successfully' };
}

// Create deposit request
export function createDepositRequest(userId: string, amount: number, note: string): { success: boolean; message: string } {
  const deposits = getDeposits();

  const deposit: Deposit = {
    id: generateId(),
    userId,
    amount,
    status: 'PENDING',
    note,
    createdAt: new Date().toISOString(),
  };

  deposits.push(deposit);
  saveDeposits(deposits);

  return { success: true, message: 'Deposit request submitted successfully' };
}

// Process matured subscriptions (ROI worker simulation)
export function processMaturedSubscriptions(): { processed: number; message: string } {
  const subscriptions = getSubscriptions();
  const users = getUsers();
  const transactions = getTransactions();
  const now = new Date();

  const maturedSubs = subscriptions.filter(
    sub => sub.status === 'ACTIVE' && new Date(sub.maturesAt) <= now
  );

  if (maturedSubs.length === 0) {
    return { processed: 0, message: 'No matured subscriptions found' };
  }

  maturedSubs.forEach(subscription => {
    const user = users.find(u => u.id === subscription.userId);
    if (!user) return;

    // Release principal from locked to available
    user.balances.locked -= subscription.principal;
    user.balances.available += subscription.principal;

    // Calculate and credit ROI
    const roiAmount = subscription.principal * (subscription.roiPercent / 100);
    user.balances.available += roiAmount;
    user.updatedAt = now.toISOString();

    // Mark subscription as completed
    subscription.status = 'COMPLETED';
    subscription.completedAt = now.toISOString();

    // Create transactions
    const lockReleaseTransaction: Transaction = {
      id: generateId(),
      userId: subscription.userId,
      type: 'LOCK_RELEASE',
      amount: subscription.principal,
      direction: 'CREDIT',
      balanceAfter: user.balances.available - roiAmount, // Before ROI credit
      meta: { subscriptionId: subscription.id },
      createdAt: now.toISOString(),
    };

    const roiTransaction: Transaction = {
      id: generateId(),
      userId: subscription.userId,
      type: 'ROI_CREDIT',
      amount: roiAmount,
      direction: 'CREDIT',
      balanceAfter: user.balances.available,
      meta: { subscriptionId: subscription.id },
      createdAt: now.toISOString(),
    };

    transactions.push(lockReleaseTransaction, roiTransaction);
  });

  // Save all changes
  saveSubscriptions(subscriptions);
  saveUsers(users);
  saveTransactions(transactions);

  return { 
    processed: maturedSubs.length, 
    message: `Processed ${maturedSubs.length} matured subscriptions` 
  };
}