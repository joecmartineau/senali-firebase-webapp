import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, User, ChevronRight, X } from 'lucide-react';
import { localStorage, type ChildProfile } from '@/lib/local-storage';
import { ProfileQuestionnaire } from './profile-questionnaire';

interface FamilySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function FamilySidebar({ isOpen, onClose, userId }: FamilySidebarProps) {
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, [userId]);

  const loadProfiles = async () => {
    try {
      const familyProfiles = await localStorage.getChildProfiles(userId);
      setProfiles(familyProfiles);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProfileCompletionStatus = (profile: ChildProfile) => {
    // Check if diagnostic questionnaire is completed
    const hasSymptoms = profile.symptomTracking && Object.keys(profile.symptomTracking).length > 0;
    const totalQuestions = 27; // Total diagnostic questions
    const answeredQuestions = hasSymptoms ? Object.values(profile.symptomTracking).filter(v => v !== undefined).length : 0;
    
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div 
        className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Family Profiles</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {selectedProfile ? (
          <ProfileQuestionnaire
            profile={selectedProfile}
            onBack={() => setSelectedProfile(null)}
            onUpdate={loadProfiles}
          />
        ) : (
          <ScrollArea className="h-full p-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading family profiles...
              </div>
            ) : profiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No family members yet</p>
                <p className="text-sm mt-2">Chat with Senali to add family members</p>
              </div>
            ) : (
              <div className="space-y-3">
                {profiles.map((profile) => {
                  const completion = getProfileCompletionStatus(profile);
                  
                  return (
                    <Card 
                      key={profile.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedProfile(profile)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {getRelationshipIcon(profile.relationship)}
                            </span>
                            <div>
                              <div className="font-medium">{profile.childName}</div>
                              <div className="text-sm text-muted-foreground capitalize">
                                {profile.relationship}
                                {profile.age && ` • ${profile.age} years old`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {completion.status === 'completed' && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Complete
                              </Badge>
                            )}
                            {completion.status === 'in_progress' && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                {completion.percentage}%
                              </Badge>
                            )}
                            {completion.status === 'not_started' && (
                              <Badge variant="outline">
                                Start Assessment
                              </Badge>
                            )}
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        )}
      </div>
    </div>
  );
}