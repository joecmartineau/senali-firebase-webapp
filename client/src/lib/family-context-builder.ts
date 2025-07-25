/**
 * Family Context Builder - Creates comprehensive family information for every message
 * Includes names, ages, genders, relations, and completed diagnostic information
 */

import { localStorage, type ChildProfile } from './local-storage';
import { calculateDiagnosticProbabilities, type DiagnosticResult } from './diagnostic-questions';

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
    console.log('🏗️ Building comprehensive family context...');
    console.log('🔍 Looking for profiles for userId:', userId);
    
    // Get all family profiles with extensive debugging
    const profiles = await localStorage.getChildProfiles(userId);
    
    console.log('📊 Raw profiles result:', profiles);
    console.log('📊 Profiles length:', profiles ? profiles.length : 'undefined');
    
    if (!profiles || profiles.length === 0) {
      console.log('❌ No family profiles found - this is why Senali doesn\'t know the family!');
      console.log('🔍 Checking if ANY profiles exist in database...');
      
      // Debug: Check if profiles exist but for wrong userId
      try {
        const allProfiles = await localStorage.exportAllData();
        console.log('🗂️ All data in database:', allProfiles);
        if (allProfiles.childProfiles) {
          console.log('👥 Found profiles in database:', allProfiles.childProfiles.length);
          console.log('📋 Profile userIds:', allProfiles.childProfiles.map((p: any) => `${p.childName} (userId: ${p.userId})`));
        }
      } catch (error) {
        console.error('❌ Error checking database:', error);
      }
      
      return '';
    }

    console.log(`✅ Found ${profiles.length} family members:`, profiles.map(p => p.childName).join(', '));
    console.log('🔍 Profile details:', profiles.map(p => ({
      name: p.childName,
      age: p.age,
      gender: p.gender,
      relationship: p.relationshipToUser,
      userId: p.userId
    })));

    const familyMembers: FamilyMemberInfo[] = [];

    for (const profile of profiles) {
      const memberInfo: FamilyMemberInfo = {
        name: profile.childName,
        age: profile.age,
        gender: profile.gender,
        relationship: this.formatRelationship(profile.relationshipToUser || 'family member')
      };

      // Add medical diagnoses if available (check profile structure)
      if ((profile as any).medicalDiagnoses && (profile as any).medicalDiagnoses.length > 0) {
        memberInfo.diagnoses = (profile as any).medicalDiagnoses;
      }

      // Add other profile information if available
      if ((profile as any).medicalInfo) memberInfo.medicalInfo = (profile as any).medicalInfo;
      if ((profile as any).schoolInfo) memberInfo.schoolInfo = (profile as any).schoolInfo;
      if ((profile as any).strengths) memberInfo.strengths = (profile as any).strengths;
      if ((profile as any).challenges) memberInfo.challenges = (profile as any).challenges;

      // Enhanced symptom and diagnostic information
      try {
        // Get comprehensive symptom data from profile
        const profileSymptoms = (profile as any).symptoms || {};
        const symptomEntries = Object.entries(profileSymptoms);
        
        if (symptomEntries.length > 0) {
          // Calculate questionnaire progress
          const answeredQuestions = symptomEntries.filter(([_, value]) => value !== 'unknown').length;
          const totalQuestions = Object.keys(profileSymptoms).length;
          memberInfo.questionnaireProgress = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
          
          // Convert symptoms to diagnostic format and calculate results
          const responses: Record<string, 'yes' | 'no' | 'unsure'> = {};
          symptomEntries.forEach(([key, value]) => {
            if (value === 'yes') responses[key] = 'yes';
            else if (value === 'no') responses[key] = 'no';
            else responses[key] = 'unsure';
          });
          
          // Calculate diagnostic probabilities
          const diagnosticResults = calculateDiagnosticProbabilities(responses);
          if (diagnosticResults.length > 0) {
            memberInfo.diagnosticResults = diagnosticResults;
            memberInfo.questionnairesCompleted = ['Comprehensive Neurodevelopmental Assessment'];
          }
          
          // Create symptom summary for AI context
          const presentSymptoms: string[] = [];
          const absentSymptoms: string[] = [];
          
          symptomEntries.forEach(([key, value]) => {
            const symptomName = key.replace(/^(adhd_|autism_|anxiety_|sensory_|exec_)/, '').replace(/_/g, ' ');
            if (value === 'yes') presentSymptoms.push(symptomName);
            else if (value === 'no') absentSymptoms.push(symptomName);
          });
          
          if (presentSymptoms.length > 0 || absentSymptoms.length > 0) {
            let summary = '';
            if (presentSymptoms.length > 0) {
              summary += `Present symptoms: ${presentSymptoms.slice(0, 10).join(', ')}`;
              if (presentSymptoms.length > 10) summary += ` and ${presentSymptoms.length - 10} more`;
            }
            if (absentSymptoms.length > 0) {
              if (summary) summary += '. ';
              summary += `Absent symptoms: ${absentSymptoms.slice(0, 5).join(', ')}`;
              if (absentSymptoms.length > 5) summary += ` and ${absentSymptoms.length - 5} more`;
            }
            memberInfo.symptomSummary = summary;
          }
        }
      } catch (error) {
        console.error('Error processing symptoms for', profile.childName, error);
      }

      // Legacy symptom check fallback
      try {
        const symptoms = await localStorage.getSymptomChecklist(profile.id);
        if (symptoms && !memberInfo.questionnairesCompleted) {
          memberInfo.questionnairesCompleted = ['Legacy Symptom Assessment'];
          
          // Add relevant symptom information
          const presentSymptoms: string[] = [];
          
          // Check ADHD symptoms (use actual property names from SymptomChecklist)
          if ((symptoms as any).difficultyFocusing === true) presentSymptoms.push('attention difficulties');
          if ((symptoms as any).hyperactivity === true) presentSymptoms.push('hyperactivity');
          if ((symptoms as any).impulsivity === true) presentSymptoms.push('impulsivity');
          
          // Check Autism symptoms
          if ((symptoms as any).socialCommunicationChallenges === true) presentSymptoms.push('social communication challenges');
          if (symptoms.restrictedFixatedInterests === true) presentSymptoms.push('restricted interests');
          if (symptoms.sensoryReactivity === true) presentSymptoms.push('sensory sensitivities');
          
          // Check emotional regulation
          if (symptoms.frequentMeltdowns === true) presentSymptoms.push('frequent meltdowns');
          if (symptoms.chronicAngerIrritability === true) presentSymptoms.push('chronic irritability');
          
          if (presentSymptoms.length > 0) {
            memberInfo.questionnairesCompleted.push(`Present symptoms: ${presentSymptoms.join(', ')}`);
          }
        }
      } catch (error) {
        console.log(`ℹ️ No symptom data for ${profile.childName}`);
      }

      familyMembers.push(memberInfo);
    }

    // Build formatted context string
    return this.formatFamilyContext(familyMembers);
  }

  private formatRelationship(relationship: string): string {
    const relationshipMap: { [key: string]: string } = {
      'child': 'child',
      'spouse': 'spouse/partner',
      'self': 'user (self)',
      'other': 'family member',
      'parent': 'parent',
      'sibling': 'sibling'
    };
    
    return relationshipMap[relationship.toLowerCase()] || relationship;
  }

  private formatFamilyContext(familyMembers: FamilyMemberInfo[]): string {
    if (familyMembers.length === 0) return '';

    let context = `**FAMILY MEMBERS:**\n\n`;

    familyMembers.forEach((member, index) => {
      context += `**${member.name}**\n`;
      context += `- Relationship: ${member.relationship}\n`;
      
      if (member.age) {
        context += `- Age: ${member.age}\n`;
      }
      
      if (member.gender) {
        context += `- Gender: ${member.gender}\n`;
      }
      
      if (member.diagnoses && member.diagnoses.length > 0) {
        context += `- Medical diagnoses: ${member.diagnoses.join(', ')}\n`;
      }

      // Add diagnostic results from questionnaires
      if (member.diagnosticResults && member.diagnosticResults.length > 0) {
        context += `- Assessment Results:\n`;
        member.diagnosticResults.forEach(result => {
          context += `  • ${result.condition} (${result.probability} probability)\n`;
        });
      }

      // Add symptom summary
      if (member.symptomSummary) {
        context += `- Symptom Profile: ${member.symptomSummary}\n`;
      }

      // Add questionnaire progress
      if (member.questionnaireProgress && member.questionnaireProgress > 0) {
        context += `- Assessment Progress: ${member.questionnaireProgress}% completed\n`;
      }
      
      if (member.questionnairesCompleted && member.questionnairesCompleted.length > 0) {
        context += `- Assessments completed: ${member.questionnairesCompleted.join(', ')}\n`;
      }
      
      if (member.medicalInfo) {
        context += `- Medical info: ${member.medicalInfo}\n`;
      }
      
      if (member.schoolInfo) {
        context += `- School/work: ${member.schoolInfo}\n`;
      }
      
      if (member.strengths) {
        context += `- Strengths: ${member.strengths}\n`;
      }
      
      if (member.challenges) {
        context += `- Challenges: ${member.challenges}\n`;
      }

      // Add spacing between family members
      if (index < familyMembers.length - 1) {
        context += '\n';
      }
    });

    console.log('✅ Enhanced family context built with diagnostic information');
    console.log('👥 Context preview:', context.substring(0, 300) + '...');
    
    return context;
  }

  /**
   * Get family member count for context logging
   */
  async getFamilyMemberCount(userId: string): Promise<number> {
    const profiles = await localStorage.getChildProfiles(userId);
    return profiles.length;
  }

  /**
   * Get list of family member names for quick reference
   */
  async getFamilyMemberNames(userId: string): Promise<string[]> {
    const profiles = await localStorage.getChildProfiles(userId);
    return profiles.map(p => p.childName);
  }
}

export const familyContextBuilder = new FamilyContextBuilder();