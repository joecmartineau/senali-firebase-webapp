import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Edit, MessageCircle, Plus, ArrowLeft } from 'lucide-react';
import { InfinityIcon } from '@/components/ui/infinity-icon';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface FamilyProfile {
  id?: number;
  childName: string;
  age?: string;
  relationshipToUser: 'child' | 'spouse' | 'self' | 'other';
  height?: string;
  medicalDiagnoses?: string;
  workSchoolInfo?: string;
  symptoms?: { [key: string]: 'yes' | 'no' | 'unknown' };
  userId?: string;
}

interface FamilyProfilesProps {
  onStartChat: () => void;
  onBack: () => void;
}

export default function FamilyProfiles({ onStartChat, onBack }: FamilyProfilesProps) {
  const queryClient = useQueryClient();
  const [selectedProfile, setSelectedProfile] = useState<FamilyProfile | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newProfile, setNewProfile] = useState<Partial<FamilyProfile>>({
    childName: '',
    age: '',
    relationshipToUser: 'child',
    height: '',
    medicalDiagnoses: '',
    workSchoolInfo: '',
    symptoms: {}
  });

  // Fetch profiles from database
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['/api/children'],
    enabled: true
  });

  // Create profile mutation
  const createProfileMutation = useMutation({
    mutationFn: (profileData: Partial<FamilyProfile>) => 
      apiRequest('/api/children', 'POST', profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/children'] });
      setIsCreatingNew(false);
      setNewProfile({
        childName: '',
        age: '',
        relationshipToUser: 'child',
        height: '',
        medicalDiagnoses: '',
        workSchoolInfo: '',
        symptoms: {}
      });
    }
  });

  // Delete profile mutation
  const deleteProfileMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/children/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/children'] });
      setSelectedProfile(null);
    }
  });

  const handleCreateProfile = async () => {
    if (!newProfile.childName?.trim()) {
      alert('Please enter a name for the family member');
      return;
    }

    try {
      await createProfileMutation.mutateAsync(newProfile);
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const handleDeleteProfile = async (profileId: number) => {
    if (confirm('Are you sure you want to delete this profile?')) {
      try {
        await deleteProfileMutation.mutateAsync(profileId);
      } catch (error) {
        console.error('Error deleting profile:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <InfinityIcon className="w-12 h-12 mx-auto mb-4 text-emerald-600" />
          <p className="text-gray-600">Loading family profiles...</p>
        </div>
      </div>
    );
  }

  // Show selected profile details
  if (selectedProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedProfile(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Family
            </Button>
            <div className="flex items-center gap-2">
              <InfinityIcon className="w-8 h-8 text-emerald-600" />
              <span className="text-xl font-semibold text-gray-800">Senali</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {selectedProfile.childName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Age</Label>
                  <p className="text-gray-700">{selectedProfile.age || 'Not specified'}</p>
                </div>
                <div>
                  <Label>Relationship</Label>
                  <p className="text-gray-700 capitalize">{selectedProfile.relationshipToUser}</p>
                </div>
                <div>
                  <Label>Height</Label>
                  <p className="text-gray-700">{selectedProfile.height || 'Not specified'}</p>
                </div>
                <div>
                  <Label>Medical Diagnoses</Label>
                  <p className="text-gray-700">{selectedProfile.medicalDiagnoses || 'None specified'}</p>
                </div>
              </div>
              <div>
                <Label>Work/School Info</Label>
                <p className="text-gray-700">{selectedProfile.workSchoolInfo || 'Not specified'}</p>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={onStartChat}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat with Senali
                </Button>
                {selectedProfile.id && (
                  <Button 
                    variant="destructive"
                    onClick={() => handleDeleteProfile(selectedProfile.id!)}
                  >
                    Delete Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show create new profile form
  if (isCreatingNew) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setIsCreatingNew(false)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <InfinityIcon className="w-8 h-8 text-emerald-600" />
              <span className="text-xl font-semibold text-gray-800">Senali</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Add Family Member</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newProfile.childName || ''}
                  onChange={(e) => setNewProfile(prev => ({ ...prev, childName: e.target.value }))}
                  placeholder="Enter name"
                />
              </div>
              
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  value={newProfile.age || ''}
                  onChange={(e) => setNewProfile(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="Enter age"
                />
              </div>
              
              <div>
                <Label htmlFor="relationship">Relationship</Label>
                <Select
                  value={newProfile.relationshipToUser}
                  onValueChange={(value) => setNewProfile(prev => ({ 
                    ...prev, 
                    relationshipToUser: value as 'child' | 'spouse' | 'self' | 'other' 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="self">Self</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  value={newProfile.height || ''}
                  onChange={(e) => setNewProfile(prev => ({ ...prev, height: e.target.value }))}
                  placeholder="Enter height"
                />
              </div>
              
              <div>
                <Label htmlFor="diagnoses">Medical Diagnoses</Label>
                <Input
                  id="diagnoses"
                  value={newProfile.medicalDiagnoses || ''}
                  onChange={(e) => setNewProfile(prev => ({ ...prev, medicalDiagnoses: e.target.value }))}
                  placeholder="Enter any medical diagnoses"
                />
              </div>
              
              <div>
                <Label htmlFor="workSchool">Work/School Info</Label>
                <Input
                  id="workSchool"
                  value={newProfile.workSchoolInfo || ''}
                  onChange={(e) => setNewProfile(prev => ({ ...prev, workSchoolInfo: e.target.value }))}
                  placeholder="Enter work or school information"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleCreateProfile}
                  disabled={createProfileMutation.isPending}
                >
                  {createProfileMutation.isPending ? 'Creating...' : 'Create Profile'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsCreatingNew(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show family profiles list
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <InfinityIcon className="w-8 h-8 text-emerald-600" />
            <span className="text-xl font-semibold text-gray-800">Senali</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Family Profiles</h1>
          <p className="text-gray-600">
            Manage your family member profiles to help Senali provide personalized support
          </p>
        </div>

        <div className="grid gap-4 mb-6">
          {profiles.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">No family profiles yet</p>
                <Button onClick={() => setIsCreatingNew(true)}>
                  Add First Family Member
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {profiles.map((profile: FamilyProfile) => (
                <Card key={profile.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="w-8 h-8 text-emerald-600" />
                        <div>
                          <h3 className="font-semibold text-gray-800">{profile.childName}</h3>
                          <p className="text-sm text-gray-600">
                            {profile.relationshipToUser && profile.age 
                              ? `${profile.relationshipToUser.charAt(0).toUpperCase() + profile.relationshipToUser.slice(1)}, Age ${profile.age}`
                              : profile.relationshipToUser?.charAt(0).toUpperCase() + profile.relationshipToUser?.slice(1) || 'Family member'
                            }
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedProfile(profile)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Card className="border-dashed border-2 border-emerald-300">
                <CardContent className="text-center py-8">
                  <Button 
                    onClick={() => setIsCreatingNew(true)}
                    variant="ghost"
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Family Member
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="text-center">
          <Button 
            onClick={onStartChat}
            size="lg"
            className="flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Start Chatting with Senali
          </Button>
        </div>
      </div>
    </div>
  );
}