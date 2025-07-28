import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Shield, Users, CreditCard, LogOut, Settings, Loader2, MessageCircle } from 'lucide-react';

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
  lastSignIn: string;
  credits: number;
  subscriptionStatus: string;
}

export default function AdminPanel({ onGoToChat }: { onGoToChat?: () => void }) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [creditAdjustment, setCreditAdjustment] = useState('');
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      console.log('Loading real Firebase users...');
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('Loaded users:', userData);
        setUsers(userData.users || []);
      } else {
        console.error('Failed to load users:', response.status);
        // Show empty state if API fails
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const adjustCredits = async () => {
    if (!selectedUser || !creditAdjustment) return;

    try {
      const adjustment = parseInt(creditAdjustment);
      // Check if the input starts with '=' to set absolute value
      const isAbsolute = creditAdjustment.startsWith('=');
      const actualValue = isAbsolute ? parseInt(creditAdjustment.substring(1)) : adjustment;
      
      const response = await fetch(`/api/admin/users/${selectedUser.uid}/credits`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          adjustment: actualValue,
          setAbsolute: isAbsolute
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        // Update local state
        setUsers(users.map(user => 
          user.uid === selectedUser.uid ? updatedUser : user
        ));
        
        setSelectedUser(updatedUser);
        setCreditAdjustment('');
        
        alert(`Credits adjusted! New balance: ${updatedUser.credits}`);
      } else {
        throw new Error('Failed to adjust credits');
      }
    } catch (error) {
      console.error('Error adjusting credits:', error);
      alert('Error adjusting credits. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Senali Admin Panel</h1>
              <p className="text-sm text-gray-400">User management and system administration</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => onGoToChat?.()}
              variant="outline"
              className="bg-green-600/20 border-green-500/50 text-green-300 hover:bg-green-600/30"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Go to Chat
            </Button>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users List */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management ({users.length} users)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {users.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No users found</p>
                  <p className="text-xs mt-1">Users will appear here after they sign in</p>
                </div>
              ) : (
                users.map((user) => (
                  <div
                    key={user.uid}
                    onClick={() => setSelectedUser(user)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedUser?.uid === user.uid
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        {user.photoURL && (
                          <img 
                            src={user.photoURL} 
                            alt={user.displayName}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-medium text-white">{user.displayName || 'Unknown User'}</p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                          <p className="text-xs text-gray-500">
                            Last sign in: {new Date(user.lastSignIn).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Created: {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-400">{user.credits} credits</p>
                        <p className={`text-xs ${
                          user.subscriptionStatus === 'active' ? 'text-green-400' :
                          user.subscriptionStatus === 'trial' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {user.subscriptionStatus}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* User Details & Actions */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                User Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedUser ? (
                <>
                  <div className="space-y-2">
                    <h3 className="font-medium text-white">{selectedUser.displayName}</h3>
                    <p className="text-sm text-gray-400">{selectedUser.email}</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Credits:</span>
                      <span className="text-green-400 font-medium">{selectedUser.credits}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subscription:</span>
                      <span className={
                        selectedUser.subscriptionStatus === 'active' ? 'text-green-400' :
                        selectedUser.subscriptionStatus === 'trial' ? 'text-yellow-400' : 'text-red-400'
                      }>
                        {selectedUser.subscriptionStatus}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">User ID:</span>
                      <span className="text-gray-300 text-xs font-mono">{selectedUser.uid}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Created:</span>
                      <span className="text-gray-300">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <Label htmlFor="credit-adjustment" className="text-white">Adjust Credits</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="credit-adjustment"
                        value={creditAdjustment}
                        onChange={(e) => setCreditAdjustment(e.target.value)}
                        placeholder="=100 (set to 100) or +50/-25 (adjust)"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                      <Button
                        onClick={adjustCredits}
                        disabled={!creditAdjustment}
                        className="bg-green-500 hover:bg-green-600 text-black font-semibold"
                      >
                        Apply
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Use =100 to set exact amount, +50 to add, -25 to subtract
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Select a user from the list to manage their account</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Stats */}
        <Card className="mt-6 bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              System Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{users.length}</p>
                <p className="text-sm text-gray-400">Total Users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">
                  {users.filter(u => u.subscriptionStatus === 'active').length}
                </p>
                <p className="text-sm text-gray-400">Active Subscribers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">
                  {users.filter(u => u.subscriptionStatus === 'trial').length}
                </p>
                <p className="text-sm text-gray-400">Trial Users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">
                  {users.reduce((sum, u) => sum + u.credits, 0)}
                </p>
                <p className="text-sm text-gray-400">Total Credits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}