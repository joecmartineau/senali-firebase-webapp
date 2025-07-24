import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, CreditCard, Plus, Minus, Search, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  uid: string;
  email: string;
  displayName: string;
  credits: number;
  subscription: string;
  lastActive: string;
}

interface AdminPanelProps {
  currentUser: any;
}

export function AdminPanel({ currentUser }: AdminPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [creditAmount, setCreditAmount] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Check if current user is admin
  const isAdmin = currentUser?.email === 'joecmartineau@gmail.com';

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUsers(userData);
      } else {
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserCredits = async (userId: string, creditChange: number) => {
    try {
      const response = await fetch('/api/admin/update-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          creditChange,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(prev => prev.map(user => 
          user.uid === userId ? { ...user, credits: updatedUser.credits } : user
        ));
        
        if (selectedUser?.uid === userId) {
          setSelectedUser(prev => prev ? { ...prev, credits: updatedUser.credits } : null);
        }

        toast({
          title: "Success",
          description: `Credits updated for ${updatedUser.displayName || updatedUser.email}`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update credits",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating credits:', error);
      toast({
        title: "Error",
        description: "Failed to update credits",
        variant: "destructive",
      });
    }
  };

  const handleCreditAdjustment = (isAdd: boolean) => {
    const amount = parseInt(creditAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid number of credits",
        variant: "destructive",
      });
      return;
    }

    if (selectedUser) {
      updateUserCredits(selectedUser.uid, isAdd ? amount : -amount);
      setCreditAmount('');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-6 h-6 text-red-500" />
        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        <Badge variant="destructive">Admin Only</Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Premium Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {users.filter(u => u.subscription === 'premium').length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {users.reduce((sum, user) => sum + (user.credits || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Controls */}
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardHeader>
          <CardTitle className="text-white">User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-gray-300">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button onClick={loadUsers} disabled={loading} className="bg-green-600 hover:bg-green-700">
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
          </div>

          {/* Users Table */}
          <div className="border border-gray-600 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-600">
                  <TableHead className="text-gray-300">User</TableHead>
                  <TableHead className="text-gray-300">Email</TableHead>
                  <TableHead className="text-gray-300">Credits</TableHead>
                  <TableHead className="text-gray-300">Subscription</TableHead>
                  <TableHead className="text-gray-300">Last Active</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.uid} className="border-gray-600">
                    <TableCell className="text-white">
                      {user.displayName || 'Unknown'}
                    </TableCell>
                    <TableCell className="text-gray-300">{user.email}</TableCell>
                    <TableCell className="text-white">
                      <Badge variant={user.credits > 0 ? "default" : "destructive"}>
                        {user.credits || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.subscription === 'premium' ? "default" : "secondary"}>
                        {user.subscription || 'free'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                            className="border-gray-600 text-white hover:bg-gray-700"
                          >
                            <CreditCard className="w-4 h-4 mr-1" />
                            Manage
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-800 border-gray-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">
                              Manage Credits - {selectedUser?.displayName || selectedUser?.email}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-gray-300">Current Credits</Label>
                              <div className="text-2xl font-bold text-white">
                                {selectedUser?.credits || 0}
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor="creditAmount" className="text-gray-300">
                                Credit Amount
                              </Label>
                              <Input
                                id="creditAmount"
                                type="number"
                                placeholder="Enter amount..."
                                value={creditAmount}
                                onChange={(e) => setCreditAmount(e.target.value)}
                                className="bg-gray-700 border-gray-600 text-white"
                              />
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleCreditAdjustment(true)}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Credits
                              </Button>
                              <Button
                                onClick={() => handleCreditAdjustment(false)}
                                variant="destructive"
                                className="flex-1"
                              >
                                <Minus className="w-4 h-4 mr-1" />
                                Remove Credits
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              {searchTerm ? 'No users found matching your search.' : 'No users found.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}