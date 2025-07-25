import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { getAIDiagnosticAnalysis, convertAIResultsToUIFormat } from '@/lib/ai-diagnostic-system';
import { calculateDiagnosticProbabilities, type DiagnosticResult } from '@/lib/diagnostic-questions';

interface FamilyProfile {
  id: string;
  name: string;
  age: number;
  relationship: string;
  symptoms: Record<string, boolean | string>;
}

interface DiagnosticResultsDisplayProps {
  profile: FamilyProfile;
}

export function DiagnosticResultsDisplay({ profile }: DiagnosticResultsDisplayProps) {
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDiagnosticResults();
  }, [profile.symptoms]);

  const loadDiagnosticResults = async () => {
    setLoading(true);
    try {
      // Convert profile symptoms to questionnaire format
      const responses: Record<string, 'yes' | 'no' | 'unsure'> = {};
      
      Object.entries(profile.symptoms).forEach(([key, value]) => {
        if (value === 'yes' || value === true) {
          responses[key] = 'yes';
        } else if (value === 'no' || value === false) {
          responses[key] = 'no';
        } else {
          responses[key] = 'unsure';
        }
      });

      const yesCount = Object.values(responses).filter(r => r === 'yes').length;
      console.log('🤖 Loading diagnostics for', profile.name, 'with', yesCount, 'positive symptoms');

      // Only run AI analysis if there are enough responses
      if (yesCount >= 3 && Object.keys(responses).length >= 5) {
        try {
          const aiResults = await getAIDiagnosticAnalysis(profile, responses);
          const formattedResults = convertAIResultsToUIFormat(aiResults);
          console.log('🤖 AI diagnostic results for', profile.name, ':', formattedResults);
          setDiagnosticResults(formattedResults);
        } catch (error) {
          console.error('AI diagnostic analysis failed, using fallback:', error);
          const fallbackResults = calculateDiagnosticProbabilities(responses);
          setDiagnosticResults(fallbackResults);
        }
      } else {
        // Use rule-based analysis for insufficient data
        const fallbackResults = calculateDiagnosticProbabilities(responses);
        setDiagnosticResults(fallbackResults);
      }
    } catch (error) {
      console.error('Failed to load diagnostic results:', error);
      setDiagnosticResults([{
        condition: 'Analysis Error',
        probability: 'low',
        description: 'Unable to analyze symptoms at this time',
        recommendedActions: ['Please try again later']
      }]);
    } finally {
      setLoading(false);
    }
  };

  const getDiagnosticColor = (probability: string) => {
    switch (probability) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDiagnosticIcon = (probability: string) => {
    switch (probability) {
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'moderate': return <Info className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
        <span>Analyzing symptoms with AI...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {diagnosticResults.map((result, index) => (
        <div key={index} className="flex items-center gap-2">
          {getDiagnosticIcon(result.probability)}
          <Badge className={getDiagnosticColor(result.probability)}>
            {result.condition} ({result.probability})
          </Badge>
        </div>
      ))}
    </div>
  );
}