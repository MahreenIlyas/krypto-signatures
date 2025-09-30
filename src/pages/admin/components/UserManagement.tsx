import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, UserStatus } from '@/types';
import { getUsers, saveUsers } from '@/lib/storage';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Ban, Search } from 'lucide-react';

interface UserManagementProps {
  onUpdate: () => void;
}

export function UserManagement({ onUpdate }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const allUsers = getUsers().filter(u => u.role === 'USER');

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const updateUserStatus = (userId: string, newStatus: UserStatus) => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      toast.error('User not found');
      return;
    }

    users[userIndex].status = newStatus;
    users[userIndex].updatedAt = new Date().toISOString();
    saveUsers(users);
    
    toast.success(`User status updated to ${newStatus}`);
    onUpdate();
  };

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = 
      user.profile.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: UserStatus) => {
    const variants = {
      PENDING: 'secondary',
      APPROVED: 'default',
      REJECTED: 'destructive',
      DISABLED: 'outline',
    };
    return (
      <Badge variant={variants[status] as any}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="DISABLED">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{user.profile.fullName}</h4>
                        {getStatusBadge(user.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <div className="font-medium">{user.email}</div>
                        </div>
                        {user.profile.phone && (
                          <div>
                            <span className="text-muted-foreground">Phone:</span>
                            <div className="font-medium">{user.profile.phone}</div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Available:</span>
                          <div className="font-medium">{formatCurrency(user.balances.available)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Locked:</span>
                          <div className="font-medium">{formatCurrency(user.balances.locked)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total:</span>
                          <div className="font-medium">
                            {formatCurrency(user.balances.available + user.balances.locked)}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Joined: {formatDate(user.createdAt)}
                        {user.lastLoginAt && ` • Last login: ${formatDate(user.lastLoginAt)}`}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      {user.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateUserStatus(user.id, 'APPROVED')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateUserStatus(user.id, 'REJECTED')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {user.status === 'APPROVED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateUserStatus(user.id, 'DISABLED')}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Disable
                        </Button>
                      )}
                      {user.status === 'DISABLED' && (
                        <Button
                          size="sm"
                          onClick={() => updateUserStatus(user.id, 'APPROVED')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Enable
                        </Button>
                      )}
                      {user.status === 'REJECTED' && (
                        <Button
                          size="sm"
                          onClick={() => updateUserStatus(user.id, 'APPROVED')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
