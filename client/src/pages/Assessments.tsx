import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// Type definitions for assessment insights
interface AssessmentInsights {
  adhd: {
    inattentionScore: number;
    hyperactivityScore: number;
    likelihood: string;
    keyIndicators: string[];
    recommendations: string[];
  };
  autism: {
    socialCommunicationConcerns: number;
    restrictedBehaviorsConcerns: number;
    likelihood: string;
    keyIndicators: string[];
    recommendations: string[];
  };
  odd: {
    totalScore: number;
    likelihood: string;
    keyIndicators: string[];
    recommendations: string[];
  };
  generalRecommendations: string[];
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, Heart, Info, Search, TrendingUp } from 'lucide-react';
import { InfinityIcon } from "@/components/ui/infinity-icon";

export default function Assessments() {
  const [childName, setChildName] = useState('');
  const [selectedChild, setSelectedChild] = useState('');

  const { data: insights, isLoading, error } = useQuery<AssessmentInsights>({
    queryKey: ['/api/assessments/child', selectedChild, 'insights'],
    enabled: !!selectedChild,
  });

  const handleSearchChild = () => {
    if (childName.trim()) {
      setSelectedChild(childName);
    }
  };

  const getSeverityColor = (likelihood: string) => {
    switch (likelihood) {
      case 'high': return 'destructive';
      case 'moderate': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityProgress = (likelihood: string) => {
    switch (likelihood) {
      case 'high': return 85;
      case 'moderate': return 60;
      case 'low': return 30;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Assessment Insights
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Professional diagnostic insights based on your conversations with Senali
          </p>
        </div>

        {/* Child Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Child Profile
            </CardTitle>
            <CardDescription>
              Enter your child's name to view their assessment insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="childName">Child's Name</Label>
                <Input
                  id="childName"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Enter child's name..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchChild()}
                />
              </div>
              <Button 
                onClick={handleSearchChild} 
                className="mt-6"
                disabled={!childName.trim()}
              >
                View Insights
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Results */}
        {selectedChild && (
          <>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> These insights are based on conversational observations and should be discussed with healthcare professionals. They are not diagnostic tools.
              </AlertDescription>
            </Alert>

            {isLoading && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-2">Analyzing assessment data...</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  Unable to load assessment data. This may be because no conversations have been recorded for this child yet.
                </AlertDescription>
              </Alert>
            )}

            {insights && (
              <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ADHD Assessment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-blue-600" />
                      ADHD Assessment
                    </CardTitle>
                    <CardDescription>
                      Based on DSM-5 and Vanderbilt criteria
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Likelihood</span>
                        <Badge variant={getSeverityColor(insights.adhd.likelihood)}>
                          {insights.adhd.likelihood.replace('_', ' ')}
                        </Badge>
                      </div>
                      <Progress 
                        value={getSeverityProgress(insights.adhd.likelihood)} 
                        className="h-2" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Inattention symptoms:</span>
                        <span className="font-medium">{insights.adhd.inattentionScore}/9</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Hyperactivity symptoms:</span>
                        <span className="font-medium">{insights.adhd.hyperactivityScore}/9</span>
                      </div>
                    </div>

                    {insights.adhd.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
                        <ul className="text-xs space-y-1">
                          {insights.adhd.recommendations.map((rec: string, i: number) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-blue-600 mt-1">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Autism Assessment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-green-600" />
                      Autism Assessment
                    </CardTitle>
                    <CardDescription>
                      Based on DSM-5 and ADOS/ADI-R criteria
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Likelihood</span>
                        <Badge variant={getSeverityColor(insights.autism.likelihood)}>
                          {insights.autism.likelihood.replace('_', ' ')}
                        </Badge>
                      </div>
                      <Progress 
                        value={getSeverityProgress(insights.autism.likelihood)} 
                        className="h-2" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Social communication:</span>
                        <span className="font-medium">{insights.autism.socialCommunicationConcerns}/3</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Restricted behaviors:</span>
                        <span className="font-medium">{insights.autism.restrictedBehaviorsConcerns}/4</span>
                      </div>
                    </div>

                    {insights.autism.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
                        <ul className="text-xs space-y-1">
                          {insights.autism.recommendations.map((rec: string, i: number) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-green-600 mt-1">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* ODD Assessment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                      ODD Assessment
                    </CardTitle>
                    <CardDescription>
                      Oppositional Defiant Disorder - DSM-5 criteria
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Likelihood</span>
                        <Badge variant={getSeverityColor(insights.odd.likelihood)}>
                          {insights.odd.likelihood.replace('_', ' ')}
                        </Badge>
                      </div>
                      <Progress 
                        value={getSeverityProgress(insights.odd.likelihood)} 
                        className="h-2" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Symptoms present:</span>
                        <span className="font-medium">{insights.odd.totalScore}/8</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        (4+ symptoms required for diagnosis)
                      </div>
                    </div>

                    {insights.odd.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
                        <ul className="text-xs space-y-1">
                          {insights.odd.recommendations.map((rec: string, i: number) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-orange-600 mt-1">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* General Recommendations */}
            {insights && insights.generalRecommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-purple-600" />
                    General Recommendations
                  </CardTitle>
                  <CardDescription>
                    Overall guidance for {selectedChild}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {insights.generalRecommendations.map((rec: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {insights && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Professional Consultation:</strong> Share these insights with your child's healthcare provider, pediatrician, or a child psychologist for professional evaluation and guidance. These observations can help inform your discussions but are not a substitute for professional diagnosis.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </div>
    </div>
  );
}