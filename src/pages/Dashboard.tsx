import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Package,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSubscriptions, getTransactions, getPlans } from '@/lib/storage';
import { Subscription, Transaction, Plan } from '@/types';

export default function Dashboard() {
  const { user } = useAuth();
  
  // Get user's data
  const allSubscriptions = getSubscriptions();
  const userSubscriptions = allSubscriptions.filter(sub => sub.userId === user?.id);
  const activeSubscriptions = userSubscriptions.filter(sub => sub.status === 'ACTIVE');
  
  const allTransactions = getTransactions();
  const userTransactions = allTransactions
    .filter(tx => tx.userId === user?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const allPlans = getPlans();
  const activePlans = allPlans.filter(plan => plan.status === 'ACTIVE').slice(0, 3);

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
      case 'LOCK_RELEASE':
      case 'ROI_CREDIT':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'WITHDRAWAL':
      case 'PLAN_BUY':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSubscriptionProgress = (subscription: Subscription) => {
    const start = new Date(subscription.startedAt).getTime();
    const end = new Date(subscription.maturesAt).getTime();
    const now = Date.now();
    const total = end - start;
    const elapsed = now - start;
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  const getDaysRemaining = (maturesAt: string) => {
    const now = new Date();
    const maturity = new Date(maturesAt);
    const diffTime = maturity.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.profile.fullName?.split(' ')[0]}</h1>
        <p className="text-muted-foreground">
          Here's an overview of your investment portfolio
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(user?.balances.available || 0)}</div>
            <p className="text-xs text-muted-foreground">Ready for investment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locked Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(user?.balances.locked || 0)}</div>
            <p className="text-xs text-muted-foreground">Currently invested</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency((user?.balances.available || 0) + (user?.balances.locked || 0))}
            </div>
            <p className="text-xs text-muted-foreground">Total portfolio value</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Subscriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Active Investments
            </CardTitle>
            <CardDescription>Your current investment subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            {activeSubscriptions.length === 0 ? (
              <div className="text-center py-6">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No active investments</p>
                <Button asChild size="sm">
                  <Link to="/plans">Browse Plans</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeSubscriptions.map((subscription) => {
                  const plan = allPlans.find(p => p.id === subscription.planId);
                  const progress = getSubscriptionProgress(subscription);
                  const daysRemaining = getDaysRemaining(subscription.maturesAt);
                  
                  return (
                    <div key={subscription.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{plan?.title}</h4>
                        <Badge variant="secondary">{subscription.roiPercent}% ROI</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                        <div>
                          <span>Principal: </span>
                          <span className="font-medium">{formatCurrency(subscription.principal)}</span>
                        </div>
                        <div>
                          <span>Expected ROI: </span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(subscription.principal * (subscription.roiPercent / 100))}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Started {formatDate(subscription.startedAt)}</span>
                          <span>
                            {daysRemaining === 0 ? 'Matures today' : `${daysRemaining} days remaining`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/subscriptions">View All Subscriptions</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {userTransactions.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent transactions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium text-sm">
                          {transaction.type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium text-sm ${
                        transaction.direction === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.direction === 'CREDIT' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Balance: {formatCurrency(transaction.balanceAfter)}
                      </p>
                    </div>
                  </div>
                ))}
                
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/wallet">View Transaction History</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Available Plans Preview */}
      {activePlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Available Investment Plans
            </CardTitle>
            <CardDescription>Start growing your portfolio today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {activePlans.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-4">
                  <h4 className="font-semibold">{plan.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Investment:</span>
                      <span className="font-medium">{formatCurrency(plan.price)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>ROI:</span>
                      <span className="font-medium text-green-600">{plan.roiPercent}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Duration:</span>
                      <span className="font-medium">{plan.durationDays} days</span>
                    </div>
                  </div>
                  
                  <Button asChild size="sm" className="w-full">
                    <Link to={`/plans`}>
                      {(user?.balances.available || 0) >= plan.price ? 'Invest Now' : 'Deposit Required'}
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <Button asChild>
                <Link to="/plans">View All Plans</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button asChild size="lg" className="h-20">
          <Link to="/deposits" className="flex-col gap-2">
            <ArrowDownLeft className="h-5 w-5" />
            Deposit Funds
          </Link>
        </Button>
        
        <Button asChild size="lg" variant="outline" className="h-20">
          <Link to="/withdrawals" className="flex-col gap-2">
            <ArrowUpRight className="h-5 w-5" />
            Withdraw Funds
          </Link>
        </Button>
        
        <Button asChild size="lg" variant="outline" className="h-20">
          <Link to="/plans" className="flex-col gap-2">
            <Package className="h-5 w-5" />
            Browse Plans
          </Link>
        </Button>
        
        <Button asChild size="lg" variant="outline" className="h-20">
          <Link to="/subscriptions" className="flex-col gap-2">
            <TrendingUp className="h-5 w-5" />
            My Investments
          </Link>
        </Button>
      </div>
    </div>
  );
}