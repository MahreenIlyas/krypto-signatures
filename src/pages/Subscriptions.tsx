import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Clock, CheckCircle, Package, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSubscriptions, getPlans } from '@/lib/storage';

export default function Subscriptions() {
  const { user } = useAuth();

  const allSubscriptions = getSubscriptions();
  const allPlans = getPlans();
  
  const userSubscriptions = allSubscriptions
    .filter(sub => sub.userId === user?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const activeSubscriptions = userSubscriptions.filter(sub => sub.status === 'ACTIVE');
  const completedSubscriptions = userSubscriptions.filter(sub => sub.status === 'COMPLETED');

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSubscriptionProgress = (subscription: any) => {
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

  const getTotalInvested = () => {
    return userSubscriptions.reduce((total, sub) => total + sub.principal, 0);
  };

  const getTotalReturns = () => {
    return completedSubscriptions.reduce((total, sub) => {
      return total + (sub.principal * (sub.roiPercent / 100));
    }, 0);
  };

  const getExpectedReturns = () => {
    return activeSubscriptions.reduce((total, sub) => {
      return total + (sub.principal * (sub.roiPercent / 100));
    }, 0);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Investments</h1>
        <p className="text-muted-foreground">
          Track your investment subscriptions and their performance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getTotalInvested())}</div>
            <p className="text-xs text-muted-foreground">Across all investments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions.length}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Returns Earned</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(getTotalReturns())}</div>
            <p className="text-xs text-muted-foreground">From completed plans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Returns</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(getExpectedReturns())}</div>
            <p className="text-xs text-muted-foreground">From active plans</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Investments */}
      {activeSubscriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Active Investments
            </CardTitle>
            <CardDescription>Your currently running investment plans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {activeSubscriptions.map((subscription) => {
                const plan = allPlans.find(p => p.id === subscription.planId);
                const progress = getSubscriptionProgress(subscription);
                const daysRemaining = getDaysRemaining(subscription.maturesAt);
                const expectedROI = subscription.principal * (subscription.roiPercent / 100);
                
                return (
                  <div key={subscription.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{plan?.title}</h4>
                      <Badge variant="secondary">{subscription.roiPercent}% ROI</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Principal:</span>
                        <p className="font-medium">{formatCurrency(subscription.principal)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expected ROI:</span>
                        <p className="font-medium text-green-600">{formatCurrency(expectedROI)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Started:</span>
                        <p className="font-medium">{formatDate(subscription.startedAt)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Matures:</span>
                        <p className="font-medium">{formatDate(subscription.maturesAt)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{daysRemaining === 0 ? 'Matures today' : `${daysRemaining} days remaining`}</span>
                        <span>Total: {formatCurrency(subscription.principal + expectedROI)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Investments */}
      {completedSubscriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Completed Investments
            </CardTitle>
            <CardDescription>Your successfully completed investment plans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {completedSubscriptions.map((subscription) => {
                const plan = allPlans.find(p => p.id === subscription.planId);
                const actualROI = subscription.principal * (subscription.roiPercent / 100);
                const totalPayout = subscription.principal + actualROI;
                
                return (
                  <div key={subscription.id} className="border rounded-lg p-4 space-y-4 bg-green-50/50 dark:bg-green-950/10">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{plan?.title}</h4>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Principal:</span>
                        <p className="font-medium">{formatCurrency(subscription.principal)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ROI Earned:</span>
                        <p className="font-medium text-green-600">{formatCurrency(actualROI)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Started:</span>
                        <p className="font-medium">{formatDate(subscription.startedAt)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Completed:</span>
                        <p className="font-medium">{formatDate(subscription.completedAt!)}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Payout:</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(totalPayout)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        ROI: {subscription.roiPercent}% over {subscription.durationDays} days
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {userSubscriptions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Investments Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start building your investment portfolio by choosing from our available plans
            </p>
            <Button asChild>
              <Link to="/plans">Browse Investment Plans</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {userSubscriptions.length > 0 && (
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link to="/plans">Invest in More Plans</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/wallet">View Transaction History</Link>
          </Button>
        </div>
      )}
    </div>
  );
}