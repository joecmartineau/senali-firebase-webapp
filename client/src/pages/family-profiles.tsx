import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, Plus, Edit, Trash2, Save, X, ArrowLeft, FileText } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { localStorage } from "@/lib/local-storage";
import type { ChildProfile } from "@/lib/local-storage";
import { Link } from "wouter";
import { subscriptionService } from '@/services/subscription-service';

interface FamilyProfilesProps {
  user: any;
}

export function FamilyProfiles({ user }: FamilyProfilesProps) {
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState<ChildProfile | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newProfile, setNewProfile] = useState({
    childName: '',
    age: '',
    gender: 'prefer_not_to_say' as const,
    relationshipToUser: 'child' as const,
    height: '',
    workInfo: '',
    schoolGrade: '',
    existingDiagnoses: [] as string[],
    currentChallenges: [] as string[],
    currentStrengths: [] as string[]
  });

  // Load family profiles
  useEffect(() => {
    const loadProfiles = async () => {
      if (!user?.uid) return;
      
      try {
        setIsLoading(true);
        await localStorage.init();
        const familyProfiles = await localStorage.getChildProfiles(user.uid);
        setProfiles(familyProfiles);
      } catch (error) {
        console.error('Failed to load family profiles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfiles();
  }, [user?.uid]);

  // Add new family member
  const handleAddProfile = async () => {
    if (!user?.uid || !newProfile.childName.trim()) return;



    try {
      const profileData = {
        childName: newProfile.childName.trim(),
        age: newProfile.age || undefined,
        gender: newProfile.gender,
        relationshipToUser: newProfile.relationshipToUser,
        height: newProfile.height || undefined,
        workInfo: newProfile.workInfo || undefined,
        schoolGrade: newProfile.schoolGrade || undefined,
        existingDiagnoses: newProfile.existingDiagnoses.filter(d => d.trim()),
        currentChallenges: newProfile.currentChallenges.filter(c => c.trim()),
        currentStrengths: newProfile.currentStrengths.filter(s => s.trim()),
        userId: user.uid
      };

      const savedProfile = await localStorage.saveChildProfile(profileData);
      setProfiles(prev => [...prev, savedProfile]);
      
      // Reset form
      setNewProfile({
        childName: '',
        age: '',
        gender: 'prefer_not_to_say',
        relationshipToUser: 'child',
        height: '',
        workInfo: '',
        schoolGrade: '',
        existingDiagnoses: [],
        currentChallenges: [],
        currentStrengths: []
      });
      setShowAddDialog(false);
    } catch (error) {
      console.error('Failed to add profile:', error);
    }
  };

  // Update existing family member
  const handleUpdateProfile = async (profile: ChildProfile) => {
    if (!user?.uid) return;

    try {
      const updatedProfile = await localStorage.updateChildProfile(profile.id, profile);
      setProfiles(prev => prev.map(p => p.id === profile.id ? updatedProfile : p));
      setEditingProfile(null);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  // Delete family member
  const handleDeleteProfile = async (profileId: string) => {
    try {
      await localStorage.deleteChildProfile(profileId);
      setProfiles(prev => prev.filter(p => p.id !== profileId));
    } catch (error) {
      console.error('Failed to delete profile:', error);
    }
  };

  // Helper to format relationship display
  const getRelationshipDisplay = (relationship: string) => {
    const relationships = {
      'child': 'Child',
      'spouse': 'Spouse/Partner',
      'self': 'Self',
      'parent': 'Parent',
      'sibling': 'Sibling',
      'other': 'Other Family Member'
    };
    return relationships[relationship as keyof typeof relationships] || relationship;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Link to="/chat">
              <Button variant="outline" size="sm" className="flex-shrink-0">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Chat
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                Family Profiles
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Manage your family member information and details
              </p>
            </div>
          </div>
          <div className="flex justify-center sm:justify-end">
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Family Member
                </Button>
              </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Family Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={newProfile.childName}
                      onChange={(e) => setNewProfile(prev => ({ ...prev, childName: e.target.value }))}
                      placeholder="Enter name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      value={newProfile.age}
                      onChange={(e) => setNewProfile(prev => ({ ...prev, age: e.target.value }))}
                      placeholder="Enter age"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="relationship">Relationship</Label>
                    <Select value={newProfile.relationshipToUser} onValueChange={(value: any) => setNewProfile(prev => ({ ...prev, relationshipToUser: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="spouse">Spouse/Partner</SelectItem>
                        <SelectItem value="self">Self</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="sibling">Sibling</SelectItem>
                        <SelectItem value="other">Other Family Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={newProfile.gender} onValueChange={(value: any) => setNewProfile(prev => ({ ...prev, gender: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non_binary">Non-binary</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      value={newProfile.height}
                      onChange={(e) => setNewProfile(prev => ({ ...prev, height: e.target.value }))}
                      placeholder="e.g., 5'2&quot; or 158cm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="workSchool">Work/School</Label>
                    <Input
                      id="workSchool"
                      value={newProfile.relationshipToUser === 'child' ? newProfile.schoolGrade : newProfile.workInfo}
                      onChange={(e) => setNewProfile(prev => ({ 
                        ...prev, 
                        ...(newProfile.relationshipToUser === 'child' 
                          ? { schoolGrade: e.target.value }
                          : { workInfo: e.target.value })
                      }))}
                      placeholder={newProfile.relationshipToUser === 'child' ? "Grade/School" : "Work/Occupation"}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddProfile} disabled={!newProfile.childName.trim()}>
                    Add Family Member
                  </Button>
                </div>
              </div>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Family Profiles Grid */}
        {profiles.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Family Members Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Start by adding your first family member to get personalized support from Senali.
              </p>
              <Button onClick={() => setShowAddDialog(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Family Member
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <Card key={profile.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{profile.childName}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {getRelationshipDisplay(profile.relationshipToUser)}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingProfile(profile)}
                        title="Edit Profile"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Link to={`/assessment/${profile.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Complete Questionnaires"
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Family Member</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {profile.childName}'s profile? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteProfile(profile.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {profile.age && (
                    <p className="text-sm"><span className="font-medium">Age:</span> {profile.age}</p>
                  )}
                  {profile.gender && profile.gender !== 'prefer_not_to_say' && (
                    <p className="text-sm">
                      <span className="font-medium">Gender:</span> {profile.gender.replace('_', ' ')}
                    </p>
                  )}
                  {profile.height && (
                    <p className="text-sm"><span className="font-medium">Height:</span> {profile.height}</p>
                  )}
                  {profile.schoolGrade && (
                    <p className="text-sm"><span className="font-medium">School:</span> {profile.schoolGrade}</p>
                  )}
                  {profile.workInfo && (
                    <p className="text-sm"><span className="font-medium">Work:</span> {profile.workInfo}</p>
                  )}
                  {profile.existingDiagnoses && profile.existingDiagnoses.length > 0 && (
                    <p className="text-sm">
                      <span className="font-medium">Diagnoses:</span> {profile.existingDiagnoses.join(', ')}
                    </p>
                  )}
                  
                  <div className="pt-2 border-t">
                    <Link to={`/assessment/${profile.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <FileText className="w-4 h-4 mr-2" />
                        Complete Questionnaires
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Profile Modal */}
        {editingProfile && (
          <Dialog open={!!editingProfile} onOpenChange={() => setEditingProfile(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit {editingProfile.childName}'s Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Name *</Label>
                    <Input
                      id="edit-name"
                      value={editingProfile.childName}
                      onChange={(e) => setEditingProfile(prev => prev ? { ...prev, childName: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-age">Age</Label>
                    <Input
                      id="edit-age"
                      value={editingProfile.age || ''}
                      onChange={(e) => setEditingProfile(prev => prev ? { ...prev, age: e.target.value } : null)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-relationship">Relationship</Label>
                    <Select 
                      value={editingProfile.relationshipToUser} 
                      onValueChange={(value: any) => setEditingProfile(prev => prev ? { ...prev, relationshipToUser: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="spouse">Spouse/Partner</SelectItem>
                        <SelectItem value="self">Self</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="sibling">Sibling</SelectItem>
                        <SelectItem value="other">Other Family Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-gender">Gender</Label>
                    <Select 
                      value={editingProfile.gender || 'prefer_not_to_say'} 
                      onValueChange={(value: any) => setEditingProfile(prev => prev ? { ...prev, gender: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non_binary">Non-binary</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-height">Height</Label>
                    <Input
                      id="edit-height"
                      value={editingProfile.height || ''}
                      onChange={(e) => setEditingProfile(prev => prev ? { ...prev, height: e.target.value } : null)}
                      placeholder="e.g., 5'2&quot; or 158cm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-workSchool">Work/School</Label>
                    <Input
                      id="edit-workSchool"
                      value={editingProfile.relationshipToUser === 'child' ? editingProfile.schoolGrade || '' : editingProfile.workInfo || ''}
                      onChange={(e) => setEditingProfile(prev => prev ? { 
                        ...prev, 
                        ...(editingProfile.relationshipToUser === 'child' 
                          ? { schoolGrade: e.target.value }
                          : { workInfo: e.target.value })
                      } : null)}
                      placeholder={editingProfile.relationshipToUser === 'child' ? "Grade/School" : "Work/Occupation"}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditingProfile(null)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={() => handleUpdateProfile(editingProfile)}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}