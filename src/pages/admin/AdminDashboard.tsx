import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  DollarSign,
  TrendingUp,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { getUsers, getDeposits, getWithdrawals, getPlans, getSubscriptions, getTransactions } from '@/lib/storage';
import { approveDeposit, rejectDeposit, approveWithdrawal, markWithdrawalPaid } from '@/lib/business';
import { toast } from 'sonner';
import { useState } from 'react';
import { User, Deposit, Withdrawal, Plan } from '@/types';
import { UserManagement } from './components/UserManagement';
import { PlanManagement } from './components/PlanManagement';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  // Get all data
  const allUsers = getUsers();
  const allDeposits = getDeposits();
  const allWithdrawals = getWithdrawals();
  const allPlans = getPlans();
  const allSubscriptions = getSubscriptions();
  const allTransactions = getTransactions();

  // Calculate stats
  const stats = {
    totalUsers: allUsers.filter(u => u.role === 'USER').length,
    pendingApprovals: allUsers.filter(u => u.status === 'PENDING').length,
    activeUsers: allUsers.filter(u => u.status === 'APPROVED' && u.role === 'USER').length,
    totalDeposits: allDeposits.reduce((sum, d) => sum + (d.status === 'APPROVED' ? d.amount : 0), 0),
    pendingDeposits: allDeposits.filter(d => d.status === 'PENDING').length,
    totalWithdrawals: allWithdrawals.reduce((sum, w) => sum + (w.status === 'PAID' ? w.amount : 0), 0),
    pendingWithdrawals: allWithdrawals.filter(w => w.status === 'PENDING').length,
    activePlans: allPlans.filter(p => p.status === 'ACTIVE').length,
    activeSubscriptions: allSubscriptions.filter(s => s.status === 'ACTIVE').length,
    totalLocked: allUsers.reduce((sum, u) => sum + u.balances.locked, 0),
    totalAvailable: allUsers.reduce((sum, u) => sum + u.balances.available, 0),
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleApproveDeposit = (depositId: string) => {
    const result = approveDeposit(depositId, user!.id);
    if (result.success) {
      toast.success(result.message);
      setRefreshKey(prev => prev + 1);
    } else {
      toast.error(result.message);
    }
  };

  const handleRejectDeposit = (depositId: string) => {
    const result = rejectDeposit(depositId, user!.id);
    if (result.success) {
      toast.success(result.message);
      setRefreshKey(prev => prev + 1);
    } else {
      toast.error(result.message);
    }
  };

  const handleApproveWithdrawal = (withdrawalId: string) => {
    const result = approveWithdrawal(withdrawalId, user!.id);
    if (result.success) {
      toast.success(result.message);
      setRefreshKey(prev => prev + 1);
    } else {
      toast.error(result.message);
    }
  };

  const handleMarkPaid = (withdrawalId: string) => {
    const result = markWithdrawalPaid(withdrawalId, user!.id);
    if (result.success) {
      toast.success(result.message);
      setRefreshKey(prev => prev + 1);
    } else {
      toast.error(result.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { variant: 'secondary' as const, icon: Clock },
      APPROVED: { variant: 'default' as const, icon: CheckCircle },
      REJECTED: { variant: 'destructive' as const, icon: XCircle },
      PAID: { variant: 'default' as const, icon: CheckCircle },
    };
    const config = variants[status as keyof typeof variants];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const pendingDeposits = allDeposits
    .filter(d => d.status === 'PENDING')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const recentDeposits = allDeposits
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const pendingWithdrawals = allWithdrawals
    .filter(w => w.status === 'PENDING' || w.status === 'APPROVED')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const recentWithdrawals = allWithdrawals
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-8" key={refreshKey}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your investment platform</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">
            Users
            {stats.pendingApprovals > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.pendingApprovals}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="deposits">
            Deposits
            {stats.pendingDeposits > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.pendingDeposits}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="withdrawals">
            Withdrawals
            {stats.pendingWithdrawals > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.pendingWithdrawals}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeUsers} active, {stats.pendingApprovals} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
                <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalDeposits)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingDeposits} pending approval
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalWithdrawals)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingWithdrawals} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats.totalLocked)} locked
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Platform Stats */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Platform Balances</CardTitle>
                <CardDescription>Total user balances across the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available Balance</span>
                  <span className="font-semibold">{formatCurrency(stats.totalAvailable)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Locked Balance</span>
                  <span className="font-semibold">{formatCurrency(stats.totalLocked)}</span>
                </div>
                <div className="flex justify-between border-t pt-4">
                  <span className="font-medium">Total Platform Balance</span>
                  <span className="font-bold">{formatCurrency(stats.totalAvailable + stats.totalLocked)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plans & Subscriptions</CardTitle>
                <CardDescription>Investment plan statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Plans</span>
                  <span className="font-semibold">{stats.activePlans}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Subscriptions</span>
                  <span className="font-semibold">{stats.activeSubscriptions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Plans</span>
                  <span className="font-semibold">{allPlans.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          {(stats.pendingApprovals > 0 || stats.pendingDeposits > 0 || stats.pendingWithdrawals > 0) && (
            <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  Pending Actions Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.pendingApprovals > 0 && (
                  <p className="text-sm">• {stats.pendingApprovals} user(s) waiting for approval</p>
                )}
                {stats.pendingDeposits > 0 && (
                  <p className="text-sm">• {stats.pendingDeposits} deposit(s) pending review</p>
                )}
                {stats.pendingWithdrawals > 0 && (
                  <p className="text-sm">• {stats.pendingWithdrawals} withdrawal(s) pending action</p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <UserManagement onUpdate={() => setRefreshKey(prev => prev + 1)} />
        </TabsContent>

        {/* Deposits Tab */}
        <TabsContent value="deposits" className="space-y-6">
          {pendingDeposits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Deposits</CardTitle>
                <CardDescription>Deposits awaiting approval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingDeposits.map((deposit) => {
                    const depositUser = allUsers.find(u => u.id === deposit.userId);
                    return (
                      <div key={deposit.id} className="flex items-center justify-between border rounded-lg p-4">
                        <div className="space-y-1">
                          <div className="font-medium">{depositUser?.profile.fullName}</div>
                          <div className="text-sm text-muted-foreground">{depositUser?.email}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(deposit.createdAt)}
                          </div>
                          {deposit.note && (
                            <div className="text-sm mt-2">
                              <span className="font-medium">Note:</span> {deposit.note}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold">{formatCurrency(deposit.amount)}</div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveDeposit(deposit.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectDeposit(deposit.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>All Deposits</CardTitle>
              <CardDescription>Complete deposit history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentDeposits.map((deposit) => {
                  const depositUser = allUsers.find(u => u.id === deposit.userId);
                  return (
                    <div key={deposit.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <div className="font-medium">{depositUser?.profile.fullName}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(deposit.createdAt)}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">{formatCurrency(deposit.amount)}</span>
                        {getStatusBadge(deposit.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdrawals Tab */}
        <TabsContent value="withdrawals" className="space-y-6">
          {pendingWithdrawals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Withdrawals</CardTitle>
                <CardDescription>Withdrawals requiring action</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingWithdrawals.map((withdrawal) => {
                    const withdrawalUser = allUsers.find(u => u.id === withdrawal.userId);
                    return (
                      <div key={withdrawal.id} className="flex items-center justify-between border rounded-lg p-4">
                        <div className="space-y-1">
                          <div className="font-medium">{withdrawalUser?.profile.fullName}</div>
                          <div className="text-sm text-muted-foreground">{withdrawalUser?.email}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(withdrawal.createdAt)}
                          </div>
                          {withdrawal.destinationNote && (
                            <div className="text-sm mt-2">
                              <span className="font-medium">Destination:</span> {withdrawal.destinationNote}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold">{formatCurrency(withdrawal.amount)}</div>
                            {getStatusBadge(withdrawal.status)}
                          </div>
                          <div className="flex gap-2">
                            {withdrawal.status === 'PENDING' ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveWithdrawal(withdrawal.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                              </>
                            ) : withdrawal.status === 'APPROVED' ? (
                              <Button
                                size="sm"
                                onClick={() => handleMarkPaid(withdrawal.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Mark Paid
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>All Withdrawals</CardTitle>
              <CardDescription>Complete withdrawal history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentWithdrawals.map((withdrawal) => {
                  const withdrawalUser = allUsers.find(u => u.id === withdrawal.userId);
                  return (
                    <div key={withdrawal.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <div className="font-medium">{withdrawalUser?.profile.fullName}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(withdrawal.createdAt)}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">{formatCurrency(withdrawal.amount)}</span>
                        {getStatusBadge(withdrawal.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans">
          <PlanManagement onUpdate={() => setRefreshKey(prev => prev + 1)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
