// AI-powered questionnaire analysis for personalized insights
import { DiagnosticResult } from './diagnostic-questions';

export interface AIAnalysisResult {
  summary: string;
  insights: string[];
  nextSteps: string[];
  parentGuidance: string;
}

export async function generateAIAnalysis(
  childName: string,
  age: string,
  results: DiagnosticResult[],
  responses: Record<string, 'yes' | 'no' | 'unsure'>
): Promise<AIAnalysisResult> {
  try {
    const prompt = `You are a compassionate parenting coach providing insights about a child's developmental questionnaire results. 

Child Information:
- Name: ${childName}
- Age: ${age}

Assessment Results:
${results.map(r => `- ${r.condition}: ${r.probability} probability
  Description: ${r.description}
  Actions: ${r.recommendedActions.join(', ')}`).join('\n')}

Please provide:
1. A warm, encouraging summary for the parent (2-3 sentences)
2. 3-4 key insights about the child's strengths and areas that may need support
3. 3-4 specific next steps the parent can take
4. Supportive guidance for the parent about moving forward

Write at a 7th grade reading level. Be encouraging and focus on the child's potential. Avoid medical language and keep it conversational.

Respond in this JSON format:
{
  "summary": "brief encouraging overview",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "nextSteps": ["step 1", "step 2", "step 3"],
  "parentGuidance": "supportive message for parent"
}`;

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt,
        isQuestionnaire: true
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate AI analysis');
    }

    const data = await response.json();
    
    try {
      // Try to parse the AI response as JSON
      const aiResult = JSON.parse(data.reply);
      return aiResult;
    } catch (parseError) {
      // If parsing fails, create a structured response from the text
      return {
        summary: "Your questionnaire results provide helpful information about your child's development and areas where they might benefit from support.",
        insights: [
          "Every child develops at their own pace and has unique strengths",
          "The patterns shown can help guide support strategies",
          "Early support and understanding make a big difference"
        ],
        nextSteps: [
          "Review the specific recommendations for each area",
          "Talk to your child's teacher about what they observe",
          "Consider discussing results with your child's doctor"
        ],
        parentGuidance: "Remember that you know your child best. These results are just one tool to help you support their growth and development."
      };
    }
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    
    // Return fallback analysis
    return {
      summary: "Your questionnaire results show important information about how your child learns and grows. Every child is unique and has their own special strengths.",
      insights: [
        "Your child has many strengths that will help them succeed",
        "Some areas might need extra support and understanding",
        "With the right help, children can learn to manage challenges",
        "You are taking the right steps by learning about your child's needs"
      ],
      nextSteps: [
        "Look at the specific suggestions for each area of concern",
        "Talk to your child's teacher or school counselor",
        "Consider meeting with your child's doctor to discuss the results",
        "Connect with other parents who have similar experiences"
      ],
      parentGuidance: "Being a parent can feel overwhelming sometimes, especially when your child faces challenges. Remember that seeking help and information shows how much you care. Take things one step at a time, and trust that you and your child will figure this out together."
    };
  }
}