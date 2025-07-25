import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Edit, MessageCircle, Brain, Plus, ArrowLeft } from 'lucide-react';

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

  // Main family profiles view
  if (!selectedProfile) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-700 p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-lg">∞</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Family Profiles</h1>
                <p className="text-sm text-gray-400">Manage your family members and questionnaires</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={onBack}
                variant="outline"
                className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Setup
              </Button>
              <Button
                onClick={onStartChat}
                className="bg-green-500 hover:bg-green-600 text-black font-semibold"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Chatting
              </Button>
            </div>
          </div>
        </div>

        {/* Family Members Grid */}
        <div className="max-w-4xl mx-auto p-6">
          {/* Add New Member Button */}
          <div className="mb-6">
            <Button
              onClick={() => setIsCreatingNew(true)}
              className="bg-green-500 hover:bg-green-600 text-black font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Family Member
            </Button>
          </div>

          {/* New Member Creation Form */}
          {isCreatingNew && (
            <Card className="bg-gray-900 border-gray-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Add New Family Member</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newName" className="text-white">Name *</Label>
                    <Input
                      id="newName"
                      value={newProfile.name || ''}
                      onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                      placeholder="Enter family member's name"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newAge" className="text-white">Age</Label>
                    <Input
                      id="newAge"
                      type="number"
                      value={newProfile.age || 0}
                      onChange={(e) => setNewProfile({ ...newProfile, age: parseInt(e.target.value) || 0 })}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newRelationship" className="text-white">Relationship</Label>
                    <Select
                      value={newProfile.relationship}
                      onValueChange={(value: any) => setNewProfile({ ...newProfile, relationship: value })}
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
                    <Label htmlFor="newHeight" className="text-white">Height</Label>
                    <Input
                      id="newHeight"
                      value={newProfile.height || ''}
                      onChange={(e) => setNewProfile({ ...newProfile, height: e.target.value })}
                      placeholder="e.g., 5'6&quot;"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="newMedical" className="text-white">Medical Diagnoses</Label>
                  <Input
                    id="newMedical"
                    value={newProfile.medicalDiagnoses || ''}
                    onChange={(e) => setNewProfile({ ...newProfile, medicalDiagnoses: e.target.value })}
                    placeholder="Any medical diagnoses or conditions"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="newWork" className="text-white">Work/School Info</Label>
                  <Input
                    id="newWork"
                    value={newProfile.workSchoolInfo || ''}
                    onChange={(e) => setNewProfile({ ...newProfile, workSchoolInfo: e.target.value })}
                    placeholder="Work, school, or daily activity information"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={createNewProfile}
                    className="bg-green-500 hover:bg-green-600 text-black font-semibold"
                  >
                    Create Family Member
                  </Button>
                  <Button
                    onClick={cancelNewProfile}
                    variant="outline"
                    className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile, index) => {
              const stats = getCompletionStats(profile);
              const completionPercentage = Math.round((stats.completed / stats.total) * 100);
              
              return (
                <Card
                  key={index}
                  className="bg-gray-900 border-gray-700 hover:border-green-500 transition-colors cursor-pointer"
                  onClick={() => setSelectedProfile(profile)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{profile.name}</CardTitle>
                        <p className="text-sm text-gray-400 capitalize">{profile.relationship}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Age:</span>
                        <span className="text-white">{profile.age}</span>
                      </div>
                      {profile.medicalDiagnoses && (
                        <div className="text-sm">
                          <span className="text-gray-400">Diagnoses:</span>
                          <p className="text-white text-xs mt-1">{profile.medicalDiagnoses}</p>
                        </div>
                      )}
                      <div className="pt-2 border-t border-gray-700">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Questionnaire:</span>
                          <span className={`font-medium ${
                            completionPercentage === 100 ? 'text-green-400' :
                            completionPercentage > 0 ? 'text-yellow-400' : 'text-gray-400'
                          }`}>
                            {completionPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              completionPercentage === 100 ? 'bg-green-500' :
                              completionPercentage > 0 ? 'bg-yellow-500' : 'bg-gray-600'
                            }`}
                            style={{ width: `${completionPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-4 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
                      variant="outline"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
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