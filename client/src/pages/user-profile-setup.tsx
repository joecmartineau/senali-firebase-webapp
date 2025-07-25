import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'firebase/auth';

interface UserProfileSetupProps {
  user: User;
  onProfileComplete: () => void;
}

export default function UserProfileSetup({ user, onProfileComplete }: UserProfileSetupProps) {
  const [fullName, setFullName] = useState(user.displayName || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uid: user.uid,
          fullName: fullName.trim()
        })
      });

      if (response.ok) {
        console.log('Profile completed successfully');
        onProfileComplete();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error completing profile:', error);
      setError('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-700">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-bold text-2xl">∞</span>
          </div>
          <CardTitle className="text-2xl text-white">Welcome to Senali</CardTitle>
          <p className="text-gray-400 text-sm">
            Let's set up your profile to get started
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                What's your name?
              </label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                disabled={isLoading}
                autoFocus
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-black font-medium"
              disabled={isLoading || !fullName.trim()}
            >
              {isLoading ? 'Saving...' : 'Continue to Chat'}
            </Button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            You can add family members and edit profiles later in the app
          </p>
        </CardContent>
      </Card>
    </div>
  );
}