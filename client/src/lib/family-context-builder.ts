/**
 * Family Context Builder - Creates comprehensive family information for every message
 * Includes names, ages, genders, relations, and completed diagnostic information
 */

import { localStorage, type ChildProfile } from './local-storage';

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
}

export class FamilyContextBuilder {
  /**
   * Build comprehensive family context for every message
   */
  async buildFamilyContext(userId: string): Promise<string> {
    console.log('🏗️ Building comprehensive family context...');
    
    // Get all family profiles
    const profiles = await localStorage.getChildProfiles(userId);
    
    if (!profiles || profiles.length === 0) {
      console.log('👪 No family profiles found');
      return '';
    }

    console.log(`👨‍👩‍👧‍👦 Found ${profiles.length} family members:`, profiles.map(p => p.childName).join(', '));

    const familyMembers: FamilyMemberInfo[] = [];

    for (const profile of profiles) {
      const memberInfo: FamilyMemberInfo = {
        name: profile.childName,
        age: profile.age,
        gender: profile.gender,
        relationship: this.formatRelationship(profile.relationshipToUser || 'family member')
      };

      // Add medical diagnoses if available
      if (profile.medicalDiagnoses && profile.medicalDiagnoses.length > 0) {
        memberInfo.diagnoses = profile.medicalDiagnoses;
      }

      // Add other profile information
      if (profile.medicalInfo) memberInfo.medicalInfo = profile.medicalInfo;
      if (profile.schoolInfo) memberInfo.schoolInfo = profile.schoolInfo;
      if (profile.strengths) memberInfo.strengths = profile.strengths;
      if (profile.challenges) memberInfo.challenges = profile.challenges;

      // Check for completed symptom questionnaires
      try {
        const symptoms = await localStorage.getSymptomChecklist(profile.id);
        if (symptoms) {
          memberInfo.questionnairesCompleted = ['Neurodivergent Symptom Assessment'];
          
          // Add relevant symptom information
          const presentSymptoms: string[] = [];
          
          // Check ADHD symptoms
          if (symptoms.difficultyFocusing === true) presentSymptoms.push('attention difficulties');
          if (symptoms.hyperactivity === true) presentSymptoms.push('hyperactivity');
          if (symptoms.impulsivity === true) presentSymptoms.push('impulsivity');
          
          // Check Autism symptoms
          if (symptoms.socialCommunicationChallenges === true) presentSymptoms.push('social communication challenges');
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

    console.log('✅ Family context built successfully');
    console.log('👥 Context preview:', context.substring(0, 200) + '...');
    
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