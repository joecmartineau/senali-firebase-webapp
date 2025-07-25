import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Edit, MessageCircle, Brain, Plus, ArrowLeft, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { InfinityIcon } from '@/components/ui/infinity-icon';
import { calculateDiagnosticProbabilities, type DiagnosticResult } from '@/lib/diagnostic-questions';
import { DiagnosticResultsDisplay } from '@/components/diagnostic-results-display';
import { Badge } from '@/components/ui/badge';

interface FamilyProfile {
  name: string;
  age: number;
  relationship: 'child' | 'spouse' | 'self' | 'other';
  height: string;
  medicalDiagnoses: string;
  workSchoolInfo: string;
  symptoms: { [key: string]: 'yes' | 'no' | 'unknown' };
}

interface FamilyProfilesProps {
  onStartChat: () => void;
  onBack: () => void;
}

export default function FamilyProfiles({ onStartChat, onBack }: FamilyProfilesProps) {
  const [profiles, setProfiles] = useState<FamilyProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<FamilyProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newProfile, setNewProfile] = useState<Partial<FamilyProfile>>({
    name: '',
    age: 0,
    relationship: 'other',
    height: '',
    medicalDiagnoses: '',
    workSchoolInfo: '',
    symptoms: {}
  });

  // Neurodiversity symptoms checklist
  const symptoms = {
    'Attention & Focus': [
      'Difficulty paying attention to details',
      'Easily distracted by external stimuli',
      'Trouble staying focused on tasks',
      'Difficulty following through on instructions',
      'Problems with organization',
      'Avoids tasks requiring sustained mental effort',
      'Often loses things necessary for tasks',
      'Forgetful in daily activities',
      'Difficulty listening when spoken to directly'
    ],
    'Hyperactivity & Impulsivity': [
      'Fidgets with hands or feet',
      'Difficulty remaining seated',
      'Runs or climbs excessively',
      'Difficulty playing quietly',
      'Often "on the go" or restless',
      'Talks excessively',
      'Blurts out answers before questions completed',
      'Difficulty waiting turn',
      'Interrupts or intrudes on others'
    ],
    'Social Communication': [
      'Difficulty with social-emotional reciprocity',
      'Problems with nonverbal communication',
      'Difficulty developing peer relationships',
      'Lack of spontaneous sharing of interests',
      'Difficulty with social or emotional reciprocity',
      'Problems maintaining eye contact',
      'Difficulty understanding social cues',
      'Challenges with conversation skills',
      'Difficulty expressing emotions appropriately'
    ],
    'Restricted Interests & Behaviors': [
      'Repetitive motor movements or speech',
      'Insistence on sameness or routines',
      'Highly restricted, fixated interests',
      'Hyper- or hypo-reactivity to sensory input',
      'Unusual interest in sensory aspects',
      'Difficulty with transitions',
      'Strong need for predictability'
    ],
    'Sensory Processing': [
      'Over-sensitivity to sounds, lights, or textures',
      'Under-sensitivity to sensory input',
      'Seeks intense sensory experiences',
      'Difficulty with clothing textures',
      'Problems with food textures',
      'Sensitivity to temperature',
      'Difficulty with loud environments',
      'Unusual responses to pain'
    ],
    'Emotional Regulation': [
      'Frequent meltdowns or tantrums',
      'Difficulty calming down when upset',
      'Extreme reactions to minor changes',
      'Difficulty expressing needs appropriately',
      'Problems with emotional transitions',
      'Anxiety in new situations',
      'Difficulty coping with frustration',
      'Mood swings or emotional intensity'
    ]
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = () => {
    try {
      const saved = window.localStorage.getItem('senali_family_profiles');
      if (saved) {
        const loadedProfiles = JSON.parse(saved);
        // Ensure each profile has a symptoms object
        const profilesWithSymptoms = loadedProfiles.map((profile: any) => ({
          ...profile,
          symptoms: profile.symptoms || {}
        }));
        setProfiles(profilesWithSymptoms);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const saveProfiles = (updatedProfiles: FamilyProfile[]) => {
    try {
      window.localStorage.setItem('senali_family_profiles', JSON.stringify(updatedProfiles));
      setProfiles(updatedProfiles);
    } catch (error) {
      console.error('Error saving profiles:', error);
    }
  };

  const updateProfile = (updatedProfile: FamilyProfile) => {
    const updatedProfiles = profiles.map(p => 
      p.name === selectedProfile?.name ? updatedProfile : p
    );
    saveProfiles(updatedProfiles);
    setSelectedProfile(updatedProfile);
  };

  const createNewProfile = () => {
    if (!newProfile.name?.trim()) {
      alert('Please enter a name for the family member');
      return;
    }

    // Check if name already exists
    if (profiles.some(p => p.name.toLowerCase() === newProfile.name?.toLowerCase())) {
      alert('A family member with this name already exists');
      return;
    }

    const completeProfile: FamilyProfile = {
      name: newProfile.name.trim(),
      age: newProfile.age || 0,
      relationship: newProfile.relationship as 'child' | 'spouse' | 'self' | 'other',
      height: newProfile.height || '',
      medicalDiagnoses: newProfile.medicalDiagnoses || '',
      workSchoolInfo: newProfile.workSchoolInfo || '',
      symptoms: {}
    };

    const updatedProfiles = [...profiles, completeProfile];
    saveProfiles(updatedProfiles);
    
    // Reset form and close create mode
    setNewProfile({
      name: '',
      age: 0,
      relationship: 'other',
      height: '',
      medicalDiagnoses: '',
      workSchoolInfo: '',
      symptoms: {}
    });
    setIsCreatingNew(false);
  };

  const cancelNewProfile = () => {
    setNewProfile({
      name: '',
      age: 0,
      relationship: 'other',
      height: '',
      medicalDiagnoses: '',
      workSchoolInfo: '',
      symptoms: {}
    });
    setIsCreatingNew(false);
  };

  const updateSymptom = (category: string, symptom: string, value: 'yes' | 'no' | 'unknown') => {
    if (!selectedProfile) return;
    
    const updatedProfile = {
      ...selectedProfile,
      symptoms: {
        ...selectedProfile.symptoms,
        [`${category}:${symptom}`]: value
      }
    };
    updateProfile(updatedProfile);
  };

  const getSymptomValue = (category: string, symptom: string): 'yes' | 'no' | 'unknown' => {
    return selectedProfile?.symptoms[`${category}:${symptom}`] || 'unknown';
  };

  const getCompletionStats = (profile: FamilyProfile) => {
    const totalSymptoms = Object.values(symptoms).flat().length;
    const completedSymptoms = Object.values(profile.symptoms).filter(v => v !== 'unknown').length;
    return { completed: completedSymptoms, total: totalSymptoms };
  };

  // Simple diagnostic results calculation for display (used for quick stats)
  const getQuickDiagnosticResults = (profile: FamilyProfile): DiagnosticResult[] => {
    // Convert profile symptoms to questionnaire format
    const responses: Record<string, 'yes' | 'no' | 'unsure'> = {};
    
    Object.entries(profile.symptoms).forEach(([key, value]) => {
      // Handle both string and boolean values from different sources
      if (value === 'yes' || value === true) {
        responses[key] = 'yes';
      } else if (value === 'no' || value === false) {
        responses[key] = 'no';
      } else {
        responses[key] = 'unsure';
      }
    });
    
    // Use rule-based calculation for quick display
    return calculateDiagnosticProbabilities(responses);
  };

  const getDiagnosticIcon = (probability: string) => {
    switch (probability) {
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'moderate': return <Info className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getDiagnosticColor = (probability: string) => {
    switch (probability) {
      case 'high': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'moderate': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  // Main family profiles view
  if (!selectedProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        {/* Mobile-Optimized Header */}
        <div className="bg-black/40 backdrop-blur-sm border-b border-green-500/20 p-3 shadow-lg">
          <div className="max-w-4xl mx-auto">
            {/* Top row - Logo and title */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <InfinityIcon size={32} glowing />
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-white to-green-300 bg-clip-text text-transparent">
                    Family Profiles
                  </h1>
                  <p className="text-xs text-gray-300 leading-none">
                    Manage your family members and questionnaires
                  </p>
                </div>
              </div>
            </div>
            
            {/* Bottom row - Action buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <Button
                onClick={onBack}
                variant="outline"
                size="sm"
                className="bg-gray-800/50 border-gray-600/50 text-white hover:bg-gray-700/70 text-xs whitespace-nowrap flex-shrink-0 px-2 py-1 h-7"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                Back to Setup
              </Button>
              <Button
                onClick={onStartChat}
                size="sm"
                className="bg-green-500/90 hover:bg-green-600 text-black font-semibold text-xs whitespace-nowrap flex-shrink-0 px-2 py-1 h-7"
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                Start Chat
              </Button>
            </div>
          </div>
        </div>

        {/* Family Members Grid */}
        <div className="max-w-4xl mx-auto p-3">
          {/* Add New Member Button */}
          <div className="mb-4">
            <Button
              onClick={() => setIsCreatingNew(true)}
              className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-black font-semibold shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Family Member
            </Button>
          </div>

          {/* New Member Creation Form */}
          {isCreatingNew && (
            <Card className="bg-black/60 backdrop-blur-sm border border-green-500/20 shadow-xl mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-400" />
                  Add New Family Member
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newName" className="text-green-300 text-sm font-medium">Name *</Label>
                    <Input
                      id="newName"
                      value={newProfile.name || ''}
                      onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                      placeholder="Enter family member's name"
                      className="bg-gray-800/70 border-gray-600/50 text-white placeholder-gray-400 focus:border-green-500/50 mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newAge" className="text-green-300 text-sm font-medium">Age</Label>
                    <Input
                      id="newAge"
                      type="number"
                      value={newProfile.age || ''}
                      onChange={(e) => setNewProfile({ ...newProfile, age: parseInt(e.target.value) || 0 })}
                      placeholder="Age"
                      className="bg-gray-800/70 border-gray-600/50 text-white placeholder-gray-400 focus:border-green-500/50 mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newRelationship" className="text-green-300 text-sm font-medium">Relationship</Label>
                    <Select
                      value={newProfile.relationship}
                      onValueChange={(value: any) => setNewProfile({ ...newProfile, relationship: value })}
                    >
                      <SelectTrigger className="bg-gray-800/70 border-gray-600/50 text-white focus:border-green-500/50 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="self">Self (You)</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="spouse">Spouse/Partner</SelectItem>
                        <SelectItem value="other">Other Family Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="newHeight" className="text-green-300 text-sm font-medium">Height</Label>
                    <Input
                      id="newHeight"
                      value={newProfile.height || ''}
                      onChange={(e) => setNewProfile({ ...newProfile, height: e.target.value })}
                      placeholder="e.g., 5'6&quot;"
                      className="bg-gray-800/70 border-gray-600/50 text-white placeholder-gray-400 focus:border-green-500/50 mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="newMedical" className="text-green-300 text-sm font-medium">Medical Diagnoses</Label>
                  <Input
                    id="newMedical"
                    value={newProfile.medicalDiagnoses || ''}
                    onChange={(e) => setNewProfile({ ...newProfile, medicalDiagnoses: e.target.value })}
                    placeholder="Any medical diagnoses or conditions"
                    className="bg-gray-800/70 border-gray-600/50 text-white placeholder-gray-400 focus:border-green-500/50 mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="newWork" className="text-green-300 text-sm font-medium">Work/School Info</Label>
                  <Input
                    id="newWork"
                    value={newProfile.workSchoolInfo || ''}
                    onChange={(e) => setNewProfile({ ...newProfile, workSchoolInfo: e.target.value })}
                    placeholder="Work, school, or daily activity information"
                    className="bg-gray-800/70 border-gray-600/50 text-white placeholder-gray-400 focus:border-green-500/50 mt-1"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button
                    onClick={createNewProfile}
                    className="bg-green-500/90 hover:bg-green-600 text-black font-semibold shadow-lg"
                  >
                    Create Family Member
                  </Button>
                  <Button
                    onClick={cancelNewProfile}
                    variant="outline"
                    className="bg-gray-800/50 border-gray-600/50 text-white hover:bg-gray-700/70"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Family Members Display */}
          {profiles.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No Family Members Yet</h3>
              <p className="text-gray-400 text-sm">Click "Add New Family Member" to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {profiles.map((profile, index) => {
                const stats = getCompletionStats(profile);
                const completionPercentage = Math.round((stats.completed / stats.total) * 100);
                const diagnosticResults = getQuickDiagnosticResults(profile);
                
                return (
                  <Card
                    key={index}
                    className="bg-black/60 backdrop-blur-sm border border-green-500/20 hover:border-green-500/40 transition-all duration-200 cursor-pointer group shadow-lg hover:shadow-xl"
                    onClick={() => setSelectedProfile(profile)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                          <User className="w-5 h-5 text-black" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-white text-base font-semibold truncate">{profile.name}</CardTitle>
                          <p className="text-xs text-green-300 capitalize">{profile.relationship}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Age:</span>
                          <span className="text-white font-medium">{profile.age || 'Not set'}</span>
                        </div>
                        
                        {profile.medicalDiagnoses && (
                          <div className="text-sm">
                            <span className="text-gray-400">Diagnoses:</span>
                            <p className="text-white text-xs mt-1 line-clamp-2">{profile.medicalDiagnoses}</p>
                          </div>
                        )}

                        {/* AI-Powered Diagnostic Results Section */}
                        {completionPercentage >= 25 && (
                          <div className="text-sm">
                            <span className="text-gray-400">Probable Conditions:</span>
                            <div className="mt-2">
                              <DiagnosticResultsDisplay profile={profile} />
                            </div>
                          </div>
                        )}
                        
                        <div className="pt-2 border-t border-gray-600/50">
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-gray-400">Questionnaire:</span>
                            <span className={`font-medium text-xs px-2 py-1 rounded-full ${
                              completionPercentage === 100 ? 'bg-green-500/20 text-green-400' :
                              completionPercentage > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {completionPercentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                completionPercentage === 100 ? 'bg-green-500' :
                                completionPercentage > 0 ? 'bg-yellow-500' : 'bg-gray-600'
                              }`}
                              style={{ width: `${completionPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <Button
                          className="w-full mt-3 bg-gray-800/70 hover:bg-gray-700/80 text-white border border-gray-600/50 hover:border-green-500/50 transition-colors text-sm h-8"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProfile(profile);
                          }}
                        >
                          <Edit className="w-3 h-3 mr-2" />
                          Edit Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Individual profile management view
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{selectedProfile.name}</h1>
              <p className="text-sm text-gray-400 capitalize">{selectedProfile.relationship}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setSelectedProfile(null)}
              variant="outline"
              className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profiles
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => { setIsEditing(true); setShowQuestionnaire(false); }}
            variant={isEditing ? "default" : "outline"}
            className={isEditing ? "bg-green-500 text-black" : "bg-gray-800 border-gray-600 text-white hover:bg-gray-700"}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Info
          </Button>
          <Button
            onClick={() => { setShowQuestionnaire(true); setIsEditing(false); }}
            variant={showQuestionnaire ? "default" : "outline"}
            className={showQuestionnaire ? "bg-green-500 text-black" : "bg-gray-800 border-gray-600 text-white hover:bg-gray-700"}
          >
            <Brain className="w-4 h-4 mr-2" />
            Questionnaire
          </Button>
        </div>

        {isEditing && (
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Edit Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-white">Name</Label>
                  <Input
                    id="name"
                    value={selectedProfile.name}
                    onChange={(e) => updateProfile({ ...selectedProfile, name: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="age" className="text-white">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={selectedProfile.age}
                    onChange={(e) => updateProfile({ ...selectedProfile, age: parseInt(e.target.value) || 0 })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="relationship" className="text-white">Relationship</Label>
                  <Select
                    value={selectedProfile.relationship}
                    onValueChange={(value: any) => updateProfile({ ...selectedProfile, relationship: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="self">Self (You)</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="spouse">Spouse/Partner</SelectItem>
                      <SelectItem value="other">Other Family Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="height" className="text-white">Height</Label>
                  <Input
                    id="height"
                    value={selectedProfile.height}
                    onChange={(e) => updateProfile({ ...selectedProfile, height: e.target.value })}
                    placeholder="e.g., 5'6&quot;"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="medical" className="text-white">Medical Diagnoses</Label>
                <Input
                  id="medical"
                  value={selectedProfile.medicalDiagnoses}
                  onChange={(e) => updateProfile({ ...selectedProfile, medicalDiagnoses: e.target.value })}
                  placeholder="Any medical diagnoses or conditions"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="work" className="text-white">Work/School Info</Label>
                <Input
                  id="work"
                  value={selectedProfile.workSchoolInfo}
                  onChange={(e) => updateProfile({ ...selectedProfile, workSchoolInfo: e.target.value })}
                  placeholder="Work, school, or daily activity information"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {showQuestionnaire && (
          <div className="space-y-6">
            {Object.entries(symptoms).map(([category, symptomList]) => (
              <Card key={category} className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">{category}</CardTitle>
                  <div className="text-sm text-gray-400">
                    {symptomList.filter(s => getSymptomValue(category, s) !== 'unknown').length} of {symptomList.length} completed
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {symptomList.map((symptom) => {
                    const value = getSymptomValue(category, symptom);
                    return (
                      <div key={symptom} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <span className="text-white text-sm flex-1">{symptom}</span>
                        <div className="flex gap-2">
                          {['yes', 'no', 'unknown'].map((option) => (
                            <Button
                              key={option}
                              onClick={() => updateSymptom(category, symptom, option as any)}
                              variant={value === option ? "default" : "outline"}
                              size="sm"
                              className={
                                value === option
                                  ? option === 'yes' ? 'bg-green-500 text-black hover:bg-green-600' :
                                    option === 'no' ? 'bg-red-500 text-white hover:bg-red-600' :
                                    'bg-yellow-500 text-black hover:bg-yellow-600'
                                  : 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                              }
                            >
                              {option === 'yes' ? 'Yes' : option === 'no' ? 'No' : '?'}
                            </Button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}