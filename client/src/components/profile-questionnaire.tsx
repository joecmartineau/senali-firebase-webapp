import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { localStorage, type ChildProfile } from '@/lib/local-storage';
import { 
  allDiagnosticQuestions, 
  calculateDiagnosticProbabilities, 
  type DiagnosticQuestion,
  type DiagnosticResult 
} from '@/lib/diagnostic-questions';

interface ProfileQuestionnaireProps {
  profile: ChildProfile;
  onClose: () => void;
}

export function ProfileQuestionnaire({ profile, onClose }: ProfileQuestionnaireProps) {
  const [responses, setResponses] = useState<Record<string, 'yes' | 'no' | 'unsure'>>({});
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load existing responses from profile symptoms
    if (profile.symptoms) {
      const convertedResponses: Record<string, 'yes' | 'no' | 'unsure'> = {};
      Object.entries(profile.symptoms).forEach(([key, value]) => {
        if (value === true) convertedResponses[key] = 'yes';
        else if (value === false) convertedResponses[key] = 'no';
        else convertedResponses[key] = 'unsure';
      });
      setResponses(convertedResponses);
    }
  }, [profile]);

  useEffect(() => {
    // Calculate diagnostic results when responses change
    if (Object.keys(responses).length > 0) {
      const results = calculateDiagnosticProbabilities(responses);
      setDiagnosticResults(results);
    }
  }, [responses]);

  const handleResponse = async (questionId: string, response: 'yes' | 'no' | 'unsure') => {
    const newResponses = { ...responses, [questionId]: response };
    setResponses(newResponses);

    // Save to profile immediately
    setLoading(true);
    try {
      const updatedSymptoms = { ...profile.symptoms } as Record<string, boolean | undefined>;
      Object.entries(newResponses).forEach(([key, value]) => {
        if (value === 'yes') updatedSymptoms[key] = true;
        else if (value === 'no') updatedSymptoms[key] = false;
        else delete updatedSymptoms[key];
      });

      await localStorage.updateChildProfile(profile.id, {
        symptoms: updatedSymptoms
      });
    } catch (error) {
      console.error('Error saving response:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgress = () => {
    const totalQuestions = allDiagnosticQuestions.length;
    const answeredQuestions = Object.keys(responses).length;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  };

  const groupQuestionsByCategory = () => {
    const groups = {
      'ADHD - Attention Problems': allDiagnosticQuestions.filter(q => q.category === 'adhd_inattentive'),
      'ADHD - Hyperactivity & Impulsivity': allDiagnosticQuestions.filter(q => q.category === 'adhd_hyperactive'),
      'Autism - Social Communication': allDiagnosticQuestions.filter(q => q.category === 'autism_social'),
      'Autism - Repetitive Behaviors': allDiagnosticQuestions.filter(q => q.category === 'autism_repetitive')
    };
    return groups;
  };

  const getProbabilityColor = (probability: string) => {
    switch (probability) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50'; 
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getProbabilityIcon = (probability: string) => {
    switch (probability) {
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'moderate': return <Info className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const questionGroups = groupQuestionsByCategory();
  const progress = getProgress();

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h3 className="font-semibold">{profile.childName}</h3>
            <p className="text-sm text-muted-foreground capitalize">
              {profile.relationshipToUser} Assessment
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Diagnostic Results */}
          {diagnosticResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assessment Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {diagnosticResults.map((result, index) => (
                  <div key={index} className={`p-3 rounded-lg ${getProbabilityColor(result.probability)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {getProbabilityIcon(result.probability)}
                      <span className="font-medium">{result.condition}</span>
                      <Badge 
                        variant="secondary" 
                        className={`${getProbabilityColor(result.probability)} border-0`}
                      >
                        {result.probability} probability
                      </Badge>
                    </div>
                    <p className="text-sm mb-3">{result.description}</p>
                    <div className="text-sm">
                      <strong>Recommended Actions:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        {result.recommendedActions.map((action, actionIndex) => (
                          <li key={actionIndex}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
                
                <div className="p-3 bg-blue-50 rounded-lg text-blue-800">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5" />
                    <div className="text-sm">
                      <strong>Important:</strong> This assessment is for informational purposes only. 
                      Please consult with a healthcare professional for proper diagnosis and treatment.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Question Groups */}
          {Object.entries(questionGroups).map(([categoryName, questions]) => (
            <Card key={categoryName}>
              <CardHeader>
                <CardTitle className="text-lg">{categoryName}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Answer these questions based on behavior over the past 6 months
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {questions.map((question) => (
                  <div key={question.id} className="space-y-3">
                    <p className="text-sm font-medium">{question.text}</p>
                    <div className="flex gap-2">
                      <Button
                        variant={responses[question.id] === 'yes' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleResponse(question.id, 'yes')}
                        disabled={loading}
                        className="flex-1"
                      >
                        Yes
                      </Button>
                      <Button
                        variant={responses[question.id] === 'no' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleResponse(question.id, 'no')}
                        disabled={loading}
                        className="flex-1"
                      >
                        No
                      </Button>
                      <Button
                        variant={responses[question.id] === 'unsure' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleResponse(question.id, 'unsure')}
                        disabled={loading}
                        className="flex-1"
                      >
                        Not Sure
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}