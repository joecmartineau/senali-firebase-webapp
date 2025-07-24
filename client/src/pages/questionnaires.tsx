import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { localStorage, type ChildProfile } from '@/lib/local-storage';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { ProfileQuestionnaire } from '@/components/profile-questionnaire';

interface QuestionnairesProps {
  profileId?: string;
}

export default function Questionnaires({ profileId }: QuestionnairesProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, [user, profileId]);

  const loadProfiles = async () => {
    if (!user?.uid) return;
    
    try {
      const familyProfiles = await localStorage.getChildProfiles(user.uid);
      setProfiles(familyProfiles);
      
      if (familyProfiles.length === 0) {
        // No family members, redirect to setup
        setLocation('/family-setup');
        return;
      }
      
      // If a specific profileId is provided, auto-select that profile
      if (profileId) {
        const targetProfile = familyProfiles.find(p => p.id === profileId);
        if (targetProfile) {
          setSelectedProfile(targetProfile);
        }
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProfileCompletionStatus = (profile: ChildProfile) => {
    const hasSymptoms = profile.symptoms && Object.keys(profile.symptoms).length > 0;
    const totalQuestions = 27; // Total diagnostic questions
    const answeredQuestions = hasSymptoms ? Object.values(profile.symptoms || {}).filter(v => v !== undefined).length : 0;
    
    if (answeredQuestions === 0) return { status: 'not_started', percentage: 0 };
    if (answeredQuestions < totalQuestions) return { status: 'in_progress', percentage: Math.round((answeredQuestions / totalQuestions) * 100) };
    return { status: 'completed', percentage: 100 };
  };

  const getRelationshipIcon = (relationship: string) => {
    if (relationship === 'self') return '👤';
    if (relationship === 'child') return '👶';
    if (relationship === 'spouse') return '💑';
    return '👥';
  };

  const handleProfileUpdate = async (updatedProfile: ChildProfile) => {
    // Update the profile in the list
    setProfiles(prev => 
      prev.map(p => p.id === updatedProfile.id ? updatedProfile : p)
    );
    setSelectedProfile(null);
  };

  const goToChat = () => {
    setLocation('/chat');
  };

  const goBack = () => {
    if (selectedProfile) {
      setSelectedProfile(null);
    } else {
      setLocation('/family-setup');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (selectedProfile) {
    return (
      <ProfileQuestionnaire 
        profile={selectedProfile}
        onComplete={handleProfileUpdate}
        onBack={() => {
          if (profileId) {
            // If came from specific profile link, go back to family profiles
            setLocation('/family-profiles');
          } else {
            // Otherwise, go back to questionnaire selection
            setSelectedProfile(null);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={goBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Family Setup
          </Button>
          <Button onClick={goToChat}>
            Skip to Chat
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Family Questionnaires
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Complete these assessments to help Senali understand your family better
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {profiles.map((profile) => {
            const completion = getProfileCompletionStatus(profile);
            
            return (
              <Card 
                key={profile.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedProfile(profile)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center text-xl">
                        {getRelationshipIcon(profile.relationshipToUser || 'other')}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{profile.childName}</CardTitle>
                        <p className="text-sm text-gray-500">
                          {profile.relationshipToUser === 'self' ? 'Myself' :
                           profile.relationshipToUser === 'spouse' ? 'Spouse' :
                           profile.relationshipToUser === 'child' ? 'Child' : 'Family Member'}
                          {profile.age && ` • Age ${profile.age}`}
                        </p>
                      </div>
                    </div>
                    {completion.status === 'completed' && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Assessment Progress
                      </span>
                      <Badge 
                        variant={completion.status === 'completed' ? 'default' : 
                                completion.status === 'in_progress' ? 'secondary' : 'outline'}
                      >
                        {completion.status === 'completed' ? 'Complete' :
                         completion.status === 'in_progress' ? `${completion.percentage}%` : 'Not Started'}
                      </Badge>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${completion.percentage}%` }}
                      />
                    </div>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {completion.status === 'completed' ? 'Assessment complete!' :
                       completion.status === 'in_progress' ? 'Continue assessment' : 'Start assessment'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button onClick={goToChat} size="lg">
            <ArrowRight className="w-4 h-4 mr-2" />
            Start Chatting with Senali
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            You can always complete questionnaires later during your conversation
          </p>
        </div>
      </div>
    </div>
  );
}