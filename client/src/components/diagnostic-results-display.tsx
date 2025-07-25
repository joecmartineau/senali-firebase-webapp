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
  }, [profile.id, profile.symptoms]); // Reload when profile ID OR symptoms change

  const loadDiagnosticResults = async () => {
    // Create a unique cache key based on symptoms for this profile
    const symptomData = JSON.stringify(profile.symptoms);
    const symptomHash = btoa(symptomData).slice(0, 10); // Simple hash for cache key
    const cacheKey = `diagnostic_results_${profile.id}_${symptomHash}`;
    const cacheTimeKey = `diagnostic_time_${profile.id}_${symptomHash}`;
    
    // Check for cached results (valid for 24 hours)
    const cachedResults = localStorage.getItem(cacheKey);
    const cacheTime = localStorage.getItem(cacheTimeKey);
    const isExpired = !cacheTime || (Date.now() - parseInt(cacheTime)) > (24 * 60 * 60 * 1000);
    
    if (cachedResults && !isExpired) {
      console.log('💾 Using cached diagnostic results for', profile.name, `(hash: ${symptomHash})`);
      setDiagnosticResults(JSON.parse(cachedResults));
      return;
    }

    // Clear old cache entries for this profile when symptoms change
    const cacheKeysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`diagnostic_results_${profile.id}_`) && key !== cacheKey) {
        cacheKeysToRemove.push(key);
        const timeKey = key.replace('diagnostic_results_', 'diagnostic_time_');
        cacheKeysToRemove.push(timeKey);
      }
    }
    cacheKeysToRemove.forEach(key => localStorage.removeItem(key));
    if (cacheKeysToRemove.length > 0) {
      console.log('🗑️ Cleared', cacheKeysToRemove.length / 2, 'old cache entries for', profile.name);
    }

    setLoading(true);
    console.log('🤖 Running NEW diagnostic analysis for', profile.name, `(hash: ${symptomHash})`);
    
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
      const totalResponses = Object.keys(responses).length;

      let results: DiagnosticResult[] = [];

      // Always try AI analysis if there are enough responses
      if (yesCount >= 1 && totalResponses >= 3) {
        try {
          console.log('🤖 Calling GPT-4o for', profile.name, `(${yesCount}/${totalResponses} symptoms)`);
          const aiResults = await getAIDiagnosticAnalysis(profile, responses);
          results = convertAIResultsToUIFormat(aiResults);
          console.log('✅ GPT-4o analysis completed for', profile.name);
        } catch (error) {
          console.error('❌ GPT-4o analysis failed:', error);
          console.log('🔄 Using rule-based fallback');
          results = calculateDiagnosticProbabilities(responses);
        }
      } else {
        // Use rule-based analysis for insufficient data
        results = calculateDiagnosticProbabilities(responses);
      }

      // Cache the results
      localStorage.setItem(cacheKey, JSON.stringify(results));
      localStorage.setItem(cacheTimeKey, Date.now().toString());
      console.log('💾 Diagnostic results cached for', profile.name);
      
      setDiagnosticResults(results);
    } catch (error) {
      console.error('Failed to load diagnostic results:', error);
      setDiagnosticResults([{
        condition: 'Analysis Unavailable',
        probability: 'low',
        description: 'Unable to analyze symptoms. Please check your connection and try again.',
        recommendedActions: ['Please refresh the page and try again']
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
      <div className="flex items-center gap-2 text-sm text-blue-600">
        <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
        <span>Running GPT-4o analysis...</span>
      </div>
    );
  }

  if (diagnosticResults.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        <Badge className="bg-gray-100 text-gray-600 border-gray-200">
          Complete questionnaire for analysis
        </Badge>
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