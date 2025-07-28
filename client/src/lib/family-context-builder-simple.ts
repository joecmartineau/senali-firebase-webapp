/**
 * Family Context Builder - Database-backed version
 * Creates comprehensive family information for every message using PostgreSQL
 */

import { calculateDiagnosticProbabilities, type DiagnosticResult } from './diagnostic-questions';
import { getAIDiagnosticAnalysis, convertAIResultsToUIFormat } from './ai-diagnostic-system';

interface ChildProfile {
  id: number;
  childName: string;
  age?: string;
  gender?: string;
  relationshipToUser?: string;
  height?: string;
  medicalDiagnoses?: string;
  workSchoolInfo?: string;
  symptoms?: any;
  userId: string;
}

export interface FamilyMemberInfo {
  name: string;
  age?: string;
  gender?: string;
  relationship: string;
  diagnoses?: string[];
  questionnairesCompleted?: string[];
  medicalInfo?: string;
  schoolInfo?: string;
  strengths?: string;
  challenges?: string;
  diagnosticResults?: DiagnosticResult[];
  symptomSummary?: string;
  questionnaireProgress?: number;
}

export class FamilyContextBuilder {
  /**
   * Build comprehensive family context for every message
   */
  async buildFamilyContext(userId: string): Promise<string> {
    console.log('🏗️ Building comprehensive family context from database...');
    console.log('🔍 Looking for profiles for userId:', userId);
    
    // Get all family profiles from PostgreSQL database
    let profiles: ChildProfile[] = [];
    try {
      const response = await fetch('/api/children', {
        credentials: 'include'
      });
      
      if (response.ok) {
        profiles = await response.json();
      } else {
        console.error('❌ Failed to fetch profiles:', response.status);
        return '';
      }
    } catch (error) {
      console.error('❌ Error fetching profiles:', error);
      return '';
    }
    
    console.log('📊 Raw profiles result:', profiles);
    console.log('📊 Profiles length:', profiles ? profiles.length : 'undefined');
    
    if (!profiles || profiles.length === 0) {
      console.log('❌ No family profiles found');
      return '';
    }

    console.log(`✅ Found ${profiles.length} family members:`, profiles.map(p => p.childName).join(', '));

    const familyMembers: FamilyMemberInfo[] = [];

    for (const profile of profiles) {
      const memberInfo: FamilyMemberInfo = {
        name: profile.childName,
        age: profile.age,
        gender: profile.gender,
        relationship: this.formatRelationship(profile.relationshipToUser || 'family member')
      };

      // Get AI-powered diagnostic results if symptoms exist
      if (profile.symptoms && Object.keys(profile.symptoms).length > 0) {
        try {
          // Convert symptoms to response format for AI analysis
          const responses: Record<string, 'yes' | 'no' | 'unsure'> = {};
          Object.entries(profile.symptoms).forEach(([key, value]) => {
            if (value === 'yes' || value === true || value === 'true') {
              responses[key] = 'yes';
            } else if (value === 'no' || value === false || value === 'false') {
              responses[key] = 'no';
            } else {
              responses[key] = 'unsure';
            }
          });

          const yesCount = Object.values(responses).filter(r => r === 'yes').length;
          
          // Get AI diagnostic results if enough positive symptoms
          if (yesCount >= 2 && Object.keys(responses).length >= 5) {
            console.log(`🤖 Running AI diagnostics for ${profile.childName} with ${yesCount} positive symptoms`);
            
            // Create profile object for AI analysis
            const aiProfile = {
              name: profile.childName,
              childName: profile.childName,
              age: parseInt(profile.age || '0'),
              relationship: profile.relationshipToUser,
              relationshipToUser: profile.relationshipToUser,
              symptoms: profile.symptoms
            };
            
            try {
              const aiResults = await getAIDiagnosticAnalysis(aiProfile, responses);
              const diagnosticResults = convertAIResultsToUIFormat(aiResults);
              memberInfo.diagnosticResults = diagnosticResults;
              
              console.log(`✅ AI diagnostic results generated for ${profile.childName}:`, diagnosticResults);
            } catch (error) {
              console.error(`❌ AI diagnostic error for ${profile.childName}:`, error);
              // Use rule-based fallback
              const diagnosticResults = calculateDiagnosticProbabilities(responses);
              memberInfo.diagnosticResults = diagnosticResults;
            }
          }
        } catch (error) {
          console.error(`❌ Error processing symptoms for ${profile.childName}:`, error);
        }
      }

      // Add medical diagnoses if available
      if (profile.medicalDiagnoses) {
        memberInfo.medicalInfo = profile.medicalDiagnoses;
      }

      // Add work/school information
      if (profile.workSchoolInfo) {
        memberInfo.schoolInfo = profile.workSchoolInfo;
      }

      // Calculate questionnaire progress if symptoms exist
      if (profile.symptoms && Object.keys(profile.symptoms).length > 0) {
        const symptomEntries = Object.entries(profile.symptoms);
        const answeredQuestions = symptomEntries.filter(([_, value]) => value !== 'unknown').length;
        const totalQuestions = symptomEntries.length;
        memberInfo.questionnaireProgress = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
      }

      familyMembers.push(memberInfo);
    }

    // Create comprehensive family context text for Senali
    let contextText = '';
    
    if (familyMembers.length === 0) {
      console.log('❌ No family context - no profiles found!');
      return '';
    }

    contextText += `## Family Members:\n\n`;

    familyMembers.forEach((member, index) => {
      contextText += `### ${index + 1}. ${member.name}\n`;
      if (member.age) contextText += `- **Age**: ${member.age}\n`;
      if (member.gender) contextText += `- **Gender**: ${member.gender}\n`;
      contextText += `- **Relationship**: ${member.relationship}\n`;
      
      if (member.medicalInfo) {
        contextText += `- **Medical Information**: ${member.medicalInfo}\n`;
      }
      
      if (member.schoolInfo) {
        contextText += `- **School/Work**: ${member.schoolInfo}\n`;
      }

      // Add AI diagnostic results with probability levels
      if (member.diagnosticResults && member.diagnosticResults.length > 0) {
        contextText += `- **Diagnostic Assessment**:\n`;
        
        // Group by probability level for better organization
        const highProb = member.diagnosticResults.filter(r => r.probability === 'high');
        const moderateProb = member.diagnosticResults.filter(r => r.probability === 'moderate');
        const lowProb = member.diagnosticResults.filter(r => r.probability === 'low');
        
        if (highProb.length > 0) {
          contextText += `  - **HIGH probability**: ${highProb.map(r => r.condition).join(', ')}\n`;
        }
        if (moderateProb.length > 0) {
          contextText += `  - **MODERATE probability**: ${moderateProb.map(r => r.condition).join(', ')}\n`;
        }
        if (lowProb.length > 0) {
          contextText += `  - **LOW probability**: ${lowProb.map(r => r.condition).join(', ')}\n`;
        }
        
        contextText += `  - **Important**: Tell user explicitly what they likely have (e.g., "you most likely have Inattentive ADHD")\n`;
      }

      if (member.questionnaireProgress !== undefined && member.questionnaireProgress > 0) {
        contextText += `- **Questionnaire Progress**: ${member.questionnaireProgress}% complete\n`;
      }

      contextText += '\n';
    });

    contextText += `**Remember**: Reference these family details naturally in conversation. Always explicitly mention probable conditions when relevant.\n\n`;

    const finalContext = contextText.trim();
    console.log('🎯 Generated family context (' + finalContext.length + ' chars):', finalContext.substring(0, 200) + '...');
    console.log('👨‍👩‍👧‍👦 Family members in context:', familyMembers.map(m => `${m.name} (${m.relationship})`).join(', '));
    
    return finalContext;
  }

  /**
   * Format relationship for display
   */
  private formatRelationship(relationship: string): string {
    const relationshipMap: { [key: string]: string } = {
      'child': 'Child',
      'spouse': 'Spouse/Partner', 
      'self': 'Self',
      'other': 'Family Member',
      'parent': 'Parent',
      'sibling': 'Sibling'
    };
    
    return relationshipMap[relationship.toLowerCase()] || relationship;
  }
}

export const familyContextBuilder = new FamilyContextBuilder();