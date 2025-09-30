import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { ArrowUpRight, Clock, CheckCircle, XCircle, DollarSign, AlertTriangle } from 'lucide-react';
import { getWithdrawals } from '@/lib/storage';
import { createWithdrawalRequest } from '@/lib/business';
import { withdrawalSchema, WithdrawalFormData } from '@/lib/validation';
import { Withdrawal } from '@/types';

export default function Withdrawals() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WithdrawalFormData>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: 0,
      destinationNote: '',
    },
  });

  const withdrawals = getWithdrawals()
    .filter(withdrawal => withdrawal.userId === user?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: Withdrawal['status']) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'APPROVED':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><DollarSign className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const onSubmit = async (data: WithdrawalFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    
    try {
      const result = createWithdrawalRequest(user.id, data.amount, data.destinationNote);
      
      if (result.success) {
        toast({
          title: "Withdrawal Request Submitted",
          description: result.message,
        });
        
        form.reset();
        await refreshUser();
        // Refresh the page to show new withdrawal
        window.location.reload();
      } else {
        toast({
          title: "Submission Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableBalance = user?.balances.available || 0;
  const watchedAmount = form.watch('amount');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Withdraw Funds</h1>
        <p className="text-muted-foreground">
          Request to withdraw funds from your available balance
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Withdrawal Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5" />
              New Withdrawal Request
            </CardTitle>
            <CardDescription>
              Submit a withdrawal request for admin processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (USD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="1"
                          max={availableBalance}
                          placeholder="Enter amount"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      {watchedAmount > availableBalance && (
                        <p className="text-sm text-destructive">
                          Amount exceeds available balance
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Available: {formatCurrency(availableBalance)}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="destinationNote"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination Details</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter your bank account details, wallet address, or payment method information..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                        Important Notice
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-200">
                        Funds will be deducted from your available balance immediately upon submission. 
                        The withdrawal will be processed after admin approval. Only funds from your available balance can be withdrawn.
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || watchedAmount > availableBalance || watchedAmount <= 0}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Withdrawal Request'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Balance Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Balance Overview</CardTitle>
            <CardDescription>Your current account balances</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div>
                  <p className="font-medium">Available Balance</p>
                  <p className="text-sm text-muted-foreground">Ready for withdrawal</p>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(user?.balances.available || 0)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <div>
                  <p className="font-medium">Locked Balance</p>
                  <p className="text-sm text-muted-foreground">Invested in plans</p>
                </div>
                <span className="text-lg font-bold text-orange-600">
                  {formatCurrency(user?.balances.locked || 0)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div>
                  <p className="font-medium">Total Balance</p>
                  <p className="text-sm text-muted-foreground">Complete portfolio</p>
                </div>
                <span className="text-xl font-bold">
                  {formatCurrency((user?.balances.available || 0) + (user?.balances.locked || 0))}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Withdrawal Policy
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    Only available balance can be withdrawn. Locked funds will become available when your investments mature.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5" />
            Withdrawal History
          </CardTitle>
          <CardDescription>View all your withdrawal requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <div className="text-center py-8">
              <ArrowUpRight className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Withdrawals Yet</h3>
              <p className="text-muted-foreground">
                Submit your first withdrawal request when you're ready to cash out
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Processed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>{formatDate(withdrawal.createdAt)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(withdrawal.amount)}</TableCell>
                    <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                    <TableCell className="max-w-xs truncate">{withdrawal.destinationNote}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {withdrawal.paidAt ? formatDate(withdrawal.paidAt) : 
                       withdrawal.reviewedAt ? formatDate(withdrawal.reviewedAt) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}