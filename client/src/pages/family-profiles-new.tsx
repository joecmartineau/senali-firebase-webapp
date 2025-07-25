import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InfinityIcon } from '@/components/ui/infinity-icon';
import { ArrowLeft, Plus, User, Brain, CheckSquare } from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  age: string;
  gender: 'male' | 'female' | 'other' | '';
  relation: 'self' | 'child' | 'spouse' | 'parent' | 'sibling' | 'other' | '';
  questionnaire?: QuestionnaireResponse[];
}

interface QuestionnaireResponse {
  questionId: string;
  answer: 'yes' | 'no' | 'unknown';
}

interface DiagnosticQuestion {
  id: string;
  category: string;
  text: string;
  condition: 'adhd' | 'autism' | 'anxiety';
}

const diagnosticQuestions: DiagnosticQuestion[] = [
  // ADHD Questions
  { id: 'adhd1', category: 'Attention & Focus', text: 'Has trouble paying attention to details or makes careless mistakes', condition: 'adhd' },
  { id: 'adhd2', category: 'Attention & Focus', text: 'Has difficulty keeping attention on tasks or play', condition: 'adhd' },
  { id: 'adhd3', category: 'Attention & Focus', text: 'Does not seem to listen when spoken to directly', condition: 'adhd' },
  { id: 'adhd4', category: 'Attention & Focus', text: 'Does not follow through on instructions and fails to finish work', condition: 'adhd' },
  { id: 'adhd5', category: 'Hyperactivity & Movement', text: 'Fidgets with hands or feet or squirms in seat', condition: 'adhd' },
  { id: 'adhd6', category: 'Hyperactivity & Movement', text: 'Leaves seat when expected to remain seated', condition: 'adhd' },
  { id: 'adhd7', category: 'Hyperactivity & Movement', text: 'Runs about or climbs when it is not appropriate', condition: 'adhd' },
  { id: 'adhd8', category: 'Impulsivity', text: 'Blurts out answers before questions are completed', condition: 'adhd' },
  { id: 'adhd9', category: 'Impulsivity', text: 'Has trouble waiting their turn', condition: 'adhd' },
  
  // Autism Questions
  { id: 'autism1', category: 'Social Communication', text: 'Has difficulty with back-and-forth conversation', condition: 'autism' },
  { id: 'autism2', category: 'Social Communication', text: 'Does not look at people when talking or use hand gestures', condition: 'autism' },
  { id: 'autism3', category: 'Social Communication', text: 'Has trouble understanding facial expressions or tone of voice', condition: 'autism' },
  { id: 'autism4', category: 'Social Communication', text: 'Has difficulty making friends or keeping friendships', condition: 'autism' },
  { id: 'autism5', category: 'Repetitive Behaviors', text: 'Repeats words, phrases, or movements over and over', condition: 'autism' },
  { id: 'autism6', category: 'Repetitive Behaviors', text: 'Gets very upset when routines change', condition: 'autism' },
  { id: 'autism7', category: 'Repetitive Behaviors', text: 'Has very strong interests in specific topics or objects', condition: 'autism' },
  { id: 'autism8', category: 'Sensory Processing', text: 'Is very sensitive to sounds, textures, lights, or smells', condition: 'autism' },
  
  // Anxiety Questions
  { id: 'anxiety1', category: 'Worry & Fear', text: 'Worries excessively about many different things', condition: 'anxiety' },
  { id: 'anxiety2', category: 'Worry & Fear', text: 'Has trouble controlling their worrying thoughts', condition: 'anxiety' },
  { id: 'anxiety3', category: 'Physical Symptoms', text: 'Gets stomachaches, headaches, or feels tired when worried', condition: 'anxiety' },
  { id: 'anxiety4', category: 'Avoidance', text: 'Avoids activities or situations that make them nervous', condition: 'anxiety' }
];

interface FamilyProfilesNewProps {
  onBack: () => void;
}

export default function FamilyProfilesNew({ onBack }: FamilyProfilesNewProps) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [newMember, setNewMember] = useState<Partial<FamilyMember>>({
    name: '',
    age: '',
    gender: '',
    relation: ''
  });

  // Load family members from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('senali_family_members');
    if (saved) {
      try {
        setFamilyMembers(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading family members:', e);
      }
    }
  }, []);

  // Save family members to localStorage
  const saveFamilyMembers = (members: FamilyMember[]) => {
    setFamilyMembers(members);
    localStorage.setItem('senali_family_members', JSON.stringify(members));
  };

  const addFamilyMember = () => {
    if (!newMember.name || !newMember.age || !newMember.gender || !newMember.relation) {
      alert('Please fill in all fields');
      return;
    }

    const member: FamilyMember = {
      id: Date.now().toString(),
      name: newMember.name,
      age: newMember.age,
      gender: newMember.gender as any,
      relation: newMember.relation as any,
      questionnaire: []
    };

    saveFamilyMembers([...familyMembers, member]);
    setNewMember({ name: '', age: '', gender: '', relation: '' });
  };

  const deleteFamilyMember = (id: string) => {
    saveFamilyMembers(familyMembers.filter(member => member.id !== id));
  };

  const updateQuestionnaireResponse = (memberId: string, questionId: string, answer: 'yes' | 'no' | 'unknown') => {
    const updatedMembers = familyMembers.map(member => {
      if (member.id === memberId) {
        const questionnaire = member.questionnaire || [];
        const existingIndex = questionnaire.findIndex(q => q.questionId === questionId);
        
        if (existingIndex >= 0) {
          questionnaire[existingIndex].answer = answer;
        } else {
          questionnaire.push({ questionId, answer });
        }
        
        return { ...member, questionnaire };
      }
      return member;
    });
    
    saveFamilyMembers(updatedMembers);
  };

  const getQuestionnaireProgress = (member: FamilyMember) => {
    const responses = member.questionnaire || [];
    const answeredQuestions = responses.filter(r => r.answer !== 'unknown').length;
    return `${answeredQuestions}/${diagnosticQuestions.length}`;
  };

  const getProbableDiagnoses = (member: FamilyMember) => {
    const responses = member.questionnaire || [];
    const conditions = ['adhd', 'autism', 'anxiety'] as const;
    
    return conditions.map(condition => {
      const conditionQuestions = diagnosticQuestions.filter(q => q.condition === condition);
      const yesResponses = responses.filter(r => 
        conditionQuestions.some(q => q.id === r.questionId) && r.answer === 'yes'
      ).length;
      
      const percentage = conditionQuestions.length > 0 ? (yesResponses / conditionQuestions.length) * 100 : 0;
      
      let probability = 'Low';
      if (percentage >= 70) probability = 'High';
      else if (percentage >= 40) probability = 'Moderate';
      
      return { condition, percentage: Math.round(percentage), probability };
    });
  };

  if (showQuestionnaire && selectedMember) {
    const member = familyMembers.find(m => m.id === selectedMember);
    if (!member) return null;

    const groupedQuestions = diagnosticQuestions.reduce((acc, question) => {
      if (!acc[question.category]) acc[question.category] = [];
      acc[question.category].push(question);
      return acc;
    }, {} as Record<string, DiagnosticQuestion[]>);

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              onClick={() => setShowQuestionnaire(false)}
              variant="ghost" 
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <InfinityIcon size={32} glowing />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Assessment for {member.name}</h1>
                <p className="text-gray-600">Answer based on what you observe most of the time</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedQuestions).map(([category, questions]) => (
              <Card key={category} className="bg-white">
                <CardHeader>
                  <CardTitle className="text-lg text-emerald-700">{category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {questions.map(question => {
                    const response = member.questionnaire?.find(r => r.questionId === question.id);
                    return (
                      <div key={question.id} className="border-b pb-4 last:border-b-0">
                        <p className="text-gray-800 mb-3">{question.text}</p>
                        <div className="flex gap-2">
                          {(['yes', 'no', 'unknown'] as const).map(answer => (
                            <Button
                              key={answer}
                              onClick={() => updateQuestionnaireResponse(member.id, question.id, answer)}
                              variant={response?.answer === answer ? "default" : "outline"}
                              className={`px-4 py-2 ${
                                response?.answer === answer 
                                  ? answer === 'yes' ? 'bg-red-500 hover:bg-red-600' 
                                    : answer === 'no' ? 'bg-green-500 hover:bg-green-600'
                                    : 'bg-gray-500 hover:bg-gray-600'
                                  : ''
                              }`}
                            >
                              {answer === 'yes' ? 'Yes' : answer === 'no' ? 'No' : 'Unsure'}
                            </Button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}

            <Card className="bg-emerald-50 border-emerald-200">
              <CardHeader>
                <CardTitle className="text-emerald-800">Assessment Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {getProbableDiagnoses(member).map(({ condition, percentage, probability }) => (
                    <div key={condition} className="text-center p-4 bg-white rounded-lg">
                      <h3 className="font-semibold capitalize text-gray-800">{condition}</h3>
                      <p className="text-2xl font-bold text-emerald-600">{percentage}%</p>
                      <p className={`text-sm ${
                        probability === 'High' ? 'text-red-600' 
                        : probability === 'Moderate' ? 'text-yellow-600' 
                        : 'text-green-600'
                      }`}>
                        {probability} Probability
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-4 text-center">
                  Progress: {getQuestionnaireProgress(member)} questions answered
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={onBack} variant="ghost" className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <InfinityIcon size={32} glowing />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Family Profiles</h1>
              <p className="text-gray-600">Manage your family members and assessments</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add New Member */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Family Member
              </CardTitle>
              <CardDescription>
                Add a new family member to get personalized support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="Enter name"
                />
              </div>
              
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  value={newMember.age}
                  onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                  placeholder="Enter age"
                  type="number"
                />
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={newMember.gender} onValueChange={(value) => setNewMember({ ...newMember, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="relation">Family Relation</Label>
                <Select value={newMember.relation} onValueChange={(value) => setNewMember({ ...newMember, relation: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">Self</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="spouse">Spouse/Partner</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={addFamilyMember} className="w-full bg-emerald-600 hover:bg-emerald-700">
                Add Family Member
              </Button>
            </CardContent>
          </Card>

          {/* Family Members List */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Family Members ({familyMembers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {familyMembers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No family members added yet</p>
              ) : (
                <div className="space-y-3">
                  {familyMembers.map(member => (
                    <div key={member.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800">{member.name}</h3>
                          <p className="text-sm text-gray-600">
                            {member.age} years old • {member.gender} • {member.relation}
                          </p>
                          <p className="text-xs text-emerald-600 mt-1">
                            Assessment: {getQuestionnaireProgress(member)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setSelectedMember(member.id);
                              setShowQuestionnaire(true);
                            }}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Brain className="w-4 h-4 mr-1" />
                            Assess
                          </Button>
                          <Button
                            onClick={() => deleteFamilyMember(member.id)}
                            size="sm"
                            variant="destructive"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                      
                      {member.questionnaire && member.questionnaire.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex gap-4 text-xs">
                            {getProbableDiagnoses(member).map(({ condition, probability }) => (
                              <span key={condition} className={`px-2 py-1 rounded ${
                                probability === 'High' ? 'bg-red-100 text-red-700' 
                                : probability === 'Moderate' ? 'bg-yellow-100 text-yellow-700' 
                                : 'bg-green-100 text-green-700'
                              }`}>
                                {condition}: {probability}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}