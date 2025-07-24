import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocation } from 'wouter';
// Simple family profile interface for local storage
interface FamilyProfile {
  name: string;
  age: number;
  relationship: 'child' | 'spouse' | 'self' | 'other';
  height: string;
  medicalDiagnoses: string;
  workSchoolInfo: string;
  symptoms: any[];
}

interface FamilyMember {
  id: string;
  name: string;
  age: string;
  relationship: 'child' | 'spouse' | 'self' | 'other';
  height?: string;
  medicalDiagnoses?: string;
  workSchoolInfo?: string;
}

export default function FamilySetup() {
  const [, setLocation] = useLocation();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      id: '1',
      name: '',
      age: '',
      relationship: 'self'
    }
  ]);

  const addFamilyMember = () => {
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: '',
      age: '',
      relationship: 'child'
    };
    setFamilyMembers([...familyMembers, newMember]);
  };

  const updateFamilyMember = (id: string, field: keyof FamilyMember, value: string) => {
    setFamilyMembers(members =>
      members.map(member =>
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };

  const removeFamilyMember = (id: string) => {
    setFamilyMembers(members => members.filter(member => member.id !== id));
  };

  const saveProfiles = async () => {
    try {
      // Filter out empty profiles
      const validMembers = familyMembers.filter(member => member.name.trim());
      
      if (validMembers.length === 0) {
        alert('Please add at least one family member');
        return;
      }

      // Save to browser local storage
      const profiles = validMembers.map(member => ({
        name: member.name,
        age: parseInt(member.age) || 0,
        relationship: member.relationship,
        height: member.height || '',
        medicalDiagnoses: member.medicalDiagnoses || '',
        workSchoolInfo: member.workSchoolInfo || '',
        symptoms: []
      }));
      
      localStorage.setItem('senali_family_profiles', JSON.stringify(profiles));

      console.log('Family profiles saved successfully');
      setLocation('/family-profiles');
    } catch (error) {
      console.error('Error saving profiles:', error);
      alert('Error saving profiles. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-bold text-2xl">∞</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Senali</h1>
          <p className="text-gray-300 text-lg">
            Let's start by creating profiles for your family members
          </p>
        </div>

        <div className="space-y-6">
          {familyMembers.map((member, index) => (
            <Card key={member.id} className="bg-gray-900 border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">
                    Family Member {index + 1}
                    {member.relationship === 'self' && ' (You)'}
                  </CardTitle>
                  {familyMembers.length > 1 && (
                    <Button
                      onClick={() => removeFamilyMember(member.id)}
                      variant="destructive"
                      size="sm"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <CardDescription className="text-gray-400">
                  Basic information about this family member
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`name-${member.id}`} className="text-white">Name</Label>
                    <Input
                      id={`name-${member.id}`}
                      value={member.name}
                      onChange={(e) => updateFamilyMember(member.id, 'name', e.target.value)}
                      placeholder="Enter name"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`age-${member.id}`} className="text-white">Age</Label>
                    <Input
                      id={`age-${member.id}`}
                      value={member.age}
                      onChange={(e) => updateFamilyMember(member.id, 'age', e.target.value)}
                      placeholder="Enter age"
                      type="number"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`relationship-${member.id}`} className="text-white">Relationship</Label>
                    <Select
                      value={member.relationship}
                      onValueChange={(value) => updateFamilyMember(member.id, 'relationship', value)}
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
                    <Label htmlFor={`height-${member.id}`} className="text-white">Height (optional)</Label>
                    <Input
                      id={`height-${member.id}`}
                      value={member.height || ''}
                      onChange={(e) => updateFamilyMember(member.id, 'height', e.target.value)}
                      placeholder="e.g., 5'6&quot;"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor={`medical-${member.id}`} className="text-white">Medical Diagnoses (optional)</Label>
                  <Input
                    id={`medical-${member.id}`}
                    value={member.medicalDiagnoses || ''}
                    onChange={(e) => updateFamilyMember(member.id, 'medicalDiagnoses', e.target.value)}
                    placeholder="Any medical diagnoses or conditions"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor={`work-${member.id}`} className="text-white">Work/School Info (optional)</Label>
                  <Input
                    id={`work-${member.id}`}
                    value={member.workSchoolInfo || ''}
                    onChange={(e) => updateFamilyMember(member.id, 'workSchoolInfo', e.target.value)}
                    placeholder="Work, school, or other activities"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={addFamilyMember}
              variant="outline"
              className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              Add Another Family Member
            </Button>
            <Button
              onClick={saveProfiles}
              className="bg-green-500 hover:bg-green-600 text-black font-semibold"
            >
              Save Family Profiles
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}