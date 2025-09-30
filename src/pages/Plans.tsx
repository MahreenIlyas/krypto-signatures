import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Package, Clock, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { getPlans } from '@/lib/storage';
import { purchasePlan } from '@/lib/business';
import { Plan } from '@/types';

export default function Plans() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = getPlans().filter(plan => plan.status === 'ACTIVE');

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsConfirmOpen(true);
  };

  const handlePurchase = async () => {
    if (!selectedPlan || !user) return;

    setIsProcessing(true);
    
    try {
      const result = purchasePlan(user.id, selectedPlan.id);
      
      if (result.success) {
        toast({
          title: "Purchase Successful",
          description: result.message,
        });
        
        await refreshUser();
        setIsConfirmOpen(false);
        setSelectedPlan(null);
      } else {
        toast({
          title: "Purchase Failed",
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
      setIsProcessing(false);
    }
  };

  const canAfford = (price: number) => (user?.balances.available || 0) >= price;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Investment Plans</h1>
        <p className="text-muted-foreground">
          Choose from our carefully designed investment plans to grow your portfolio
        </p>
      </div>

      {/* Available Balance Card */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Available Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(user?.balances.available || 0)}</div>
          <p className="text-sm text-muted-foreground">Ready for investment</p>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const affordable = canAfford(plan.price);
          const expectedReturn = plan.price * (plan.roiPercent / 100);
          const totalReturn = plan.price + expectedReturn;

          return (
            <Card 
              key={plan.id} 
              className={`relative transition-all hover:shadow-lg ${
                affordable ? 'border-primary/20 hover:border-primary/40' : 'opacity-75'
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {plan.title}
                  </CardTitle>
                  <Badge variant={affordable ? "default" : "secondary"}>
                    {plan.roiPercent}% ROI
                  </Badge>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Investment Amount:</span>
                    <span className="text-lg font-bold">{formatCurrency(plan.price)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Expected Return:</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(expectedReturn)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium">Total Payout:</span>
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(totalReturn)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{plan.durationDays} days duration</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>ROI Percentage:</span>
                    <span className="font-medium">{plan.roiPercent}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Daily Return:</span>
                    <span className="font-medium">
                      {((plan.roiPercent / plan.durationDays)).toFixed(3)}%
                    </span>
                  </div>
                </div>

                {!affordable && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Insufficient balance. Need {formatCurrency(plan.price - (user?.balances.available || 0))} more.
                    </span>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  onClick={() => handlePlanSelect(plan)}
                  disabled={!affordable}
                  size="lg"
                >
                  {affordable ? 'Invest Now' : 'Insufficient Balance'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {plans.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Plans</h3>
            <p className="text-muted-foreground">
              There are currently no investment plans available. Please check back later.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Purchase Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Investment</DialogTitle>
            <DialogDescription>
              Please review your investment details before confirming.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Plan:</span>
                  <span>{selectedPlan.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Investment:</span>
                  <span>{formatCurrency(selectedPlan.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Duration:</span>
                  <span>{selectedPlan.durationDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">ROI:</span>
                  <span className="text-green-600">{selectedPlan.roiPercent}%</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="font-medium">Expected Return:</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(selectedPlan.price * (selectedPlan.roiPercent / 100))}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Investment Terms
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-200">
                      Your funds will be locked for {selectedPlan.durationDays} days. 
                      Principal and ROI will be credited to your available balance when the investment matures.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span>Current Available Balance:</span>
                <span className="font-medium">{formatCurrency(user?.balances.available || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>After Investment:</span>
                <span className="font-medium">
                  {formatCurrency((user?.balances.available || 0) - selectedPlan.price)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePurchase} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Confirm Investment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}