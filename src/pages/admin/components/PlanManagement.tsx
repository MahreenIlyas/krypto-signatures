import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plan, PlanStatus } from '@/types';
import { getPlans, savePlans, generateId } from '@/lib/storage';
import { toast } from 'sonner';
import { Plus, Edit, Archive, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { planSchema, PlanFormData } from '@/lib/validation';

interface PlanManagementProps {
  onUpdate: () => void;
}

export function PlanManagement({ onUpdate }: PlanManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const allPlans = getPlans();

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      roiPercent: 0,
      durationDays: 0,
    },
  });

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const openCreateDialog = () => {
    setEditingPlan(null);
    form.reset({
      title: '',
      description: '',
      price: 0,
      roiPercent: 0,
      durationDays: 0,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (plan: Plan) => {
    setEditingPlan(plan);
    form.reset({
      title: plan.title,
      description: plan.description,
      price: plan.price,
      roiPercent: plan.roiPercent,
      durationDays: plan.durationDays,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: PlanFormData) => {
    const plans = getPlans();
    const now = new Date().toISOString();

    if (editingPlan) {
      // Update existing plan
      const planIndex = plans.findIndex(p => p.id === editingPlan.id);
      if (planIndex !== -1) {
        plans[planIndex] = {
          ...plans[planIndex],
          ...data,
          updatedAt: now,
        };
        toast.success('Plan updated successfully');
      }
    } else {
      // Create new plan
      const newPlan: Plan = {
        id: generateId(),
        ...data,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      };
      plans.push(newPlan);
      toast.success('Plan created successfully');
    }

    savePlans(plans);
    setIsDialogOpen(false);
    onUpdate();
  };

  const togglePlanStatus = (planId: string) => {
    const plans = getPlans();
    const planIndex = plans.findIndex(p => p.id === planId);
    
    if (planIndex === -1) {
      toast.error('Plan not found');
      return;
    }

    plans[planIndex].status = plans[planIndex].status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
    plans[planIndex].updatedAt = new Date().toISOString();
    savePlans(plans);
    
    toast.success(`Plan ${plans[planIndex].status === 'ACTIVE' ? 'activated' : 'archived'}`);
    onUpdate();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Investment Plans</CardTitle>
            <CardDescription>Create and manage investment plans</CardDescription>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allPlans.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No plans created yet
              </div>
            ) : (
              allPlans.map((plan) => (
                <Card key={plan.id} className={plan.status === 'ARCHIVED' ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{plan.title}</CardTitle>
                      <Badge variant={plan.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {plan.status}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Investment:</span>
                        <span className="font-semibold">{formatCurrency(plan.price)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">ROI:</span>
                        <span className="font-semibold text-green-600">{plan.roiPercent}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-semibold">{plan.durationDays} days</span>
                      </div>
                      <div className="flex justify-between text-sm border-t pt-2">
                        <span className="text-muted-foreground">Expected Return:</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(plan.price * (1 + plan.roiPercent / 100))}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => openEditDialog(plan)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant={plan.status === 'ACTIVE' ? 'destructive' : 'default'}
                        className="flex-1"
                        onClick={() => togglePlanStatus(plan.id)}
                      >
                        {plan.status === 'ACTIVE' ? (
                          <>
                            <Archive className="h-4 w-4 mr-1" />
                            Archive
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
              <DialogDescription>
                {editingPlan ? 'Update the investment plan details' : 'Create a new investment plan for users'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Plan Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Starter Plan"
                  {...form.register('title')}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the plan benefits and features"
                  {...form.register('description')}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="1000"
                    {...form.register('price', { valueAsNumber: true })}
                  />
                  {form.formState.errors.price && (
                    <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roiPercent">ROI (%)</Label>
                  <Input
                    id="roiPercent"
                    type="number"
                    step="0.1"
                    placeholder="10"
                    {...form.register('roiPercent', { valueAsNumber: true })}
                  />
                  {form.formState.errors.roiPercent && (
                    <p className="text-sm text-destructive">{form.formState.errors.roiPercent.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="durationDays">Days</Label>
                  <Input
                    id="durationDays"
                    type="number"
                    placeholder="30"
                    {...form.register('durationDays', { valueAsNumber: true })}
                  />
                  {form.formState.errors.durationDays && (
                    <p className="text-sm text-destructive">{form.formState.errors.durationDays.message}</p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
