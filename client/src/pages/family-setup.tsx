import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Users, ArrowRight } from 'lucide-react';
import { localStorage, type ChildProfile } from '@/lib/local-storage';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';

interface FamilyMember {
  name: string;
  age: string;
  relationship: 'self' | 'spouse' | 'child' | 'other';
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
}

export default function FamilySetup() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [currentMember, setCurrentMember] = useState<FamilyMember>({
    name: '',
    age: '',
    relationship: 'child'
  });
  const [existingProfiles, setExistingProfiles] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExistingProfiles();
  }, [user]);

  const loadExistingProfiles = async () => {
    if (!user?.id) return;
    
    try {
      const profiles = await localStorage.getChildProfiles(user.id);
      setExistingProfiles(profiles);
      
      // If user already has profiles, they can skip setup
      if (profiles.length > 0) {
        setFamilyMembers(profiles.map(p => ({
          name: p.childName,
          age: p.age || '',
          relationship: p.relationshipToUser || 'child',
          gender: p.gender
        })));
      }
    } catch (error) {
      console.error('Error loading existing profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFamilyMember = () => {
    if (!currentMember.name.trim()) return;
    
    setFamilyMembers(prev => [...prev, currentMember]);
    setCurrentMember({
      name: '',
      age: '',
      relationship: 'child'
    });
  };

  const removeFamilyMember = (index: number) => {
    setFamilyMembers(prev => prev.filter((_, i) => i !== index));
  };

  const saveFamily = async () => {
    if (!user?.id || familyMembers.length === 0) return;
    
    try {
      setLoading(true);
      
      // Save each family member as a profile
      for (const member of familyMembers) {
        const profile = {
          childName: member.name,
          age: member.age,
          userId: user.id,
          relationshipToUser: member.relationship,
          gender: member.gender
        };
        
        await localStorage.saveChildProfile(profile);
      }
      
      // Redirect to chat
      setLocation('/chat');
    } catch (error) {
      console.error('Error saving family profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const skipToChat = () => {
    setLocation('/chat');
  };

  const goToQuestionnaires = () => {
    setLocation('/questionnaires');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Senali
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Let's set up your family so I can provide personalized support
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Family Member
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={currentMember.name}
                  onChange={(e) => setCurrentMember(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter name"
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  value={currentMember.age}
                  onChange={(e) => setCurrentMember(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="Enter age"
                  type="number"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="relationship">Relationship *</Label>
                <Select
                  value={currentMember.relationship}
                  onValueChange={(value: 'self' | 'spouse' | 'child' | 'other') => 
                    setCurrentMember(prev => ({ ...prev, relationship: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">Myself</SelectItem>
                    <SelectItem value="spouse">Spouse/Partner</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="other">Other Family Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="gender">Gender (Optional)</Label>
                <Select
                  value={currentMember.gender || ''}
                  onValueChange={(value: 'male' | 'female' | 'other' | 'prefer_not_to_say') => 
                    setCurrentMember(prev => ({ ...prev, gender: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={addFamilyMember} disabled={!currentMember.name.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Family Member
            </Button>
          </CardContent>
        </Card>

        {familyMembers.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Family ({familyMembers.length} members)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {familyMembers.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                        {member.relationship === 'self' ? '👤' : 
                         member.relationship === 'spouse' ? '💑' : 
                         member.relationship === 'child' ? '👶' : '👥'}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {member.relationship === 'self' ? 'Myself' :
                             member.relationship === 'spouse' ? 'Spouse' :
                             member.relationship === 'child' ? 'Child' : 'Family Member'}
                          </Badge>
                          {member.age && (
                            <Badge variant="outline" className="text-xs">
                              Age {member.age}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFamilyMember(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          {familyMembers.length > 0 && (
            <>
              <Button onClick={saveFamily} className="flex-1" disabled={loading}>
                <ArrowRight className="w-4 h-4 mr-2" />
                Save Family & Start Chatting
              </Button>
              <Button variant="outline" onClick={goToQuestionnaires} className="flex-1">
                Complete Questionnaires First
              </Button>
            </>
          )}
          
          {existingProfiles.length > 0 && (
            <Button variant="outline" onClick={skipToChat}>
              Skip to Chat
            </Button>
          )}
        </div>

        {familyMembers.length === 0 && existingProfiles.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Add at least one family member to get started
            </p>
            <Button variant="outline" onClick={skipToChat}>
              Skip Setup & Chat Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}