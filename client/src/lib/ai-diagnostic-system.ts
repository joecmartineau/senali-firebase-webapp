/**
 * AI-Powered Diagnostic System using GPT-4o
 * Replaces rule-based algorithm with intelligent diagnosis determination
 */

interface FamilyProfile {
  id?: string;
  name?: string;
  childName?: string; // Support both name formats
  age?: number;
  relationship?: string;
  relationshipToUser?: string; // Support both relationship formats
  height?: string;
  medicalDiagnoses?: string;
  workSchoolInfo?: string;
  symptoms: Record<string, boolean | string>;
}

export interface AIDiagnosticResult {
  condition: string;
  probability: 'high' | 'moderate' | 'low';
  confidence: number; // 0-100
  reasoning: string;
  recommendedActions: string[];
}

export interface AIDiagnosticResponse {
  diagnoses: AIDiagnosticResult[];
  summary: string;
  overallAssessment: string;
}

/**
 * Send symptom data to GPT-4o for intelligent diagnostic analysis
 */
export async function getAIDiagnosticAnalysis(
  profile: FamilyProfile,
  responses: Record<string, 'yes' | 'no' | 'unsure'>
): Promise<AIDiagnosticResponse> {
  
  // Count symptoms by category for context
  const symptomCounts = {
    adhd_inattentive: 0,
    adhd_hyperactive: 0,
    autism_social: 0,
    autism_repetitive: 0,
    anxiety: 0,
    sensory: 0,
    executive_function: 0
  };

  // Map question IDs to categories (simplified mapping)
  Object.entries(responses).forEach(([questionId, response]) => {
    if (response === 'yes') {
      if (questionId.includes('attention') || questionId.includes('focus') || questionId.includes('distract')) {
        symptomCounts.adhd_inattentive++;
      } else if (questionId.includes('hyperact') || questionId.includes('impuls') || questionId.includes('fidget')) {
        symptomCounts.adhd_hyperactive++;
      } else if (questionId.includes('social') || questionId.includes('communication') || questionId.includes('eye_contact')) {
        symptomCounts.autism_social++;
      } else if (questionId.includes('repetitive') || questionId.includes('routine') || questionId.includes('restricted')) {
        symptomCounts.autism_repetitive++;
      } else if (questionId.includes('anxiety') || questionId.includes('worry') || questionId.includes('fear')) {
        symptomCounts.anxiety++;
      } else if (questionId.includes('sensory') || questionId.includes('texture') || questionId.includes('sound')) {
        symptomCounts.sensory++;
      } else if (questionId.includes('organization') || questionId.includes('planning') || questionId.includes('executive')) {
        symptomCounts.executive_function++;
      }
    }
  });

  const yesResponses = Object.values(responses).filter(r => r === 'yes').length;
  const totalResponses = Object.keys(responses).length;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `DIAGNOSTIC ANALYSIS REQUEST:

Please analyze the following symptom questionnaire data for ${profile.name || profile.childName} (age ${profile.age || 'unknown'}, ${profile.relationship || profile.relationshipToUser || 'family member'}) and provide probable diagnoses.

SYMPTOM DATA:
- Total questions answered: ${totalResponses}
- Positive responses (yes): ${yesResponses}
- Symptom categories:
  * ADHD Inattentive symptoms: ${symptomCounts.adhd_inattentive}
  * ADHD Hyperactive symptoms: ${symptomCounts.adhd_hyperactive}  
  * Autism Social symptoms: ${symptomCounts.autism_social}
  * Autism Repetitive symptoms: ${symptomCounts.autism_repetitive}
  * Anxiety symptoms: ${symptomCounts.anxiety}
  * Sensory Processing symptoms: ${symptomCounts.sensory}
  * Executive Function symptoms: ${symptomCounts.executive_function}

DETAILED RESPONSES:
${Object.entries(responses).map(([q, r]) => `${q}: ${r}`).join('\n')}

Please provide a JSON response with the following structure:
{
  "diagnoses": [
    {
      "condition": "Specific condition name",
      "probability": "high|moderate|low",
      "confidence": 85,
      "reasoning": "Brief explanation of why this diagnosis is likely",
      "recommendedActions": ["Action 1", "Action 2", "Action 3"]
    }
  ],
  "summary": "Overall assessment summary",
  "overallAssessment": "General interpretation and next steps"
}

IMPORTANT GUIDELINES:
- Only include conditions with meaningful probability (don't include everything)
- Use proper diagnostic terminology (ADHD, Autism Spectrum Disorder, Generalized Anxiety Disorder, etc.)
- Base probability on DSM-5 criteria and symptom clusters
- Be specific about which type of ADHD if relevant (inattentive, hyperactive-impulsive, combined)
- Include confidence percentage (0-100) for each diagnosis
- Provide actionable recommendations that parents can follow
- If symptoms don't suggest significant concerns, say so clearly
- Remember this is screening data, not formal diagnosis

Respond with ONLY the JSON object, no additional text.`,
        isSystem: false,
        diagnosticAnalysis: true
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse the AI response
    let aiResponse: AIDiagnosticResponse;
    try {
      // The AI should return JSON directly
      aiResponse = typeof data.response === 'string' ? JSON.parse(data.response) : data.response;
    } catch (parseError) {
      console.error('Failed to parse AI diagnostic response:', data.response);
      throw new Error('AI returned invalid JSON response');
    }

    // Validate the response structure
    if (!aiResponse.diagnoses || !Array.isArray(aiResponse.diagnoses)) {
      throw new Error('AI response missing diagnoses array');
    }

    // Ensure all diagnoses have required fields
    aiResponse.diagnoses = aiResponse.diagnoses.map(diagnosis => ({
      condition: diagnosis.condition || 'Unknown Condition',
      probability: diagnosis.probability || 'low',
      confidence: diagnosis.confidence || 0,
      reasoning: diagnosis.reasoning || 'No reasoning provided',
      recommendedActions: diagnosis.recommendedActions || ['Consult with healthcare provider']
    }));

    return aiResponse;

  } catch (error) {
    console.error('AI Diagnostic Analysis failed:', error);
    
    // Fallback response in case of API failure
    return {
      diagnoses: [{
        condition: 'Analysis Unavailable',
        probability: 'low',
        confidence: 0,
        reasoning: 'Unable to complete AI analysis at this time. Please try again later.',
        recommendedActions: [
          'Try the analysis again later',
          'Consult with your healthcare provider about your concerns',
          'Keep track of symptoms and behaviors you observe'
        ]
      }],
      summary: 'AI diagnostic analysis is temporarily unavailable.',
      overallAssessment: 'Please try the analysis again or consult with a healthcare professional.'
    };
  }
}

/**
 * Convert AI diagnostic results to the format expected by the UI
 */
export function convertAIResultsToUIFormat(aiResults: AIDiagnosticResponse): any[] {
  return aiResults.diagnoses.map(diagnosis => ({
    condition: diagnosis.condition,
    probability: diagnosis.probability,
    description: diagnosis.reasoning,
    recommendedActions: diagnosis.recommendedActions,
    confidence: diagnosis.confidence
  }));
}