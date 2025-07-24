import { db } from '../db';
import { childProfiles, adhdAssessments, autismAssessments, oddAssessments } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

// Maps for converting natural language to assessment values
const adhdResponseMap = {
  'never': 'never',
  'rarely': 'occasionally', 
  'sometimes': 'occasionally',
  'occasionally': 'occasionally',
  'often': 'often',
  'frequently': 'often',
  'very often': 'very_often',
  'always': 'very_often',
  'constantly': 'very_often'
};

const performanceMap = {
  'excellent': 'excellent',
  'great': 'above_average',
  'good': 'above_average', 
  'above average': 'above_average',
  'average': 'average',
  'okay': 'average',
  'problematic': 'problematic',
  'problem': 'somewhat_of_a_problem',
  'difficult': 'somewhat_of_a_problem',
  'struggles': 'problematic'
};

const autismSeverityMap = {
  'not present': 'not_present',
  'none': 'not_present',
  'mild': 'mild',
  'slight': 'mild',
  'moderate': 'moderate',
  'medium': 'moderate',
  'severe': 'severe',
  'significant': 'severe'
};

// ADHD symptom keywords and their corresponding database fields
const adhdSymptomMap = {
  // Inattention symptoms
  'attention': 'failsToPayAttention',
  'focus': 'difficultyMaintainingAttention',
  'listening': 'doesNotListenWhenSpokenTo',
  'instructions': 'doesNotFollowInstructions',
  'organizing': 'difficultyOrganizingTasks',
  'homework': 'avoidsTasksRequiringMentalEffort',
  'loses things': 'losesThings',
  'distracted': 'easilyDistracted',
  'forgetful': 'forgetfulInDailyActivities',
  
  // Hyperactivity/Impulsivity symptoms
  'fidgets': 'fidgetsWithHandsOrFeet',
  'sits still': 'leavesSeatsInClassroom',
  'running': 'runsOrClimbsExcessively',
  'quiet': 'difficultyPlayingQuietly',
  'motor': 'onTheGoOrDrivenByMotor',
  'talks': 'talksExcessively',
  'blurts': 'blurtsOutAnswers',
  'waiting': 'difficultyWaitingTurn',
  'interrupts': 'interruptsOrIntrudes'
};

// Autism symptom keywords
const autismSymptomMap = {
  'social': 'socialEmotionalReciprocity',
  'eye contact': 'nonverbalCommunication',
  'relationships': 'developingMaintainingRelationships',
  'repetitive': 'stereotypedRepetitiveMotor',
  'routine': 'insistenceOnSameness',
  'interests': 'restrictedFixatedInterests',
  'sensory': 'sensoryReactivity'
};

// ODD symptom keywords
const oddSymptomMap = {
  'temper': 'oftenLosesTemper',
  'annoyed': 'touchyOrEasilyAnnoyed',
  'angry': 'angryAndResentful',
  'argues': 'arguesWithAuthority',
  'defiant': 'activelyDefiesRules',
  'annoys': 'deliberatelyAnnoys',
  'blames': 'blamesOthers',
  'vindictive': 'spitefulOrVindictive'
};

export class AssessmentProcessor {
  
  // Create or get existing child profile
  async getOrCreateChildProfile(userId: string, childName: string, additionalInfo?: any) {
    console.log(`🔍 Looking for child profile: ${childName} for user: ${userId}`);
    
    // Try to find existing profile
    let profiles = await db.select()
      .from(childProfiles)
      .where(and(
        eq(childProfiles.userId, userId),
        eq(childProfiles.childName, childName)
      ));
    
    if (profiles.length > 0) {
      console.log(`✅ Found existing profile for ${childName}`);
      return profiles[0];
    }
    
    // Create new profile
    console.log(`➕ Creating new profile for ${childName}`);
    const newProfile = await db.insert(childProfiles)
      .values({
        userId,
        childName,
        dateOfBirth: additionalInfo?.dateOfBirth || null,
        gender: additionalInfo?.gender || null
      })
      .returning();
    
    // Initialize empty assessments
    await this.initializeAssessments(newProfile[0].id);
    
    return newProfile[0];
  }
  
  // Initialize empty assessment forms for a new child
  async initializeAssessments(childId: number) {
    console.log(`🆕 Initializing assessments for child ID: ${childId}`);
    
    // Create empty ADHD assessment
    await db.insert(adhdAssessments)
      .values({ childId })
      .onConflictDoNothing();
    
    // Create empty Autism assessment  
    await db.insert(autismAssessments)
      .values({ childId })
      .onConflictDoNothing();
    
    // Create empty ODD assessment
    await db.insert(oddAssessments)
      .values({ childId })
      .onConflictDoNothing();
  }
  
  // Process message and extract assessment information
  async processMessage(userId: string, message: string) {
    console.log(`🔄 Processing message for assessments: ${message.substring(0, 100)}...`);
    
    // Extract child names mentioned in the message
    const childNames = this.extractChildNames(message);
    console.log(`👶 Children mentioned: ${childNames.join(', ')}`);
    
    // Process each child mentioned
    for (const childName of childNames) {
      const profile = await this.getOrCreateChildProfile(userId, childName);
      
      // Extract and update ADHD symptoms
      await this.updateAdhdAssessment(profile.id, message);
      
      // Extract and update Autism symptoms
      await this.updateAutismAssessment(profile.id, message);
      
      // Extract and update ODD symptoms
      await this.updateOddAssessment(profile.id, message);
    }
  }
  
  // Extract child names from message using common patterns
  extractChildNames(message: string): string[] {
    const names: string[] = [];
    const patterns = [
      /my (?:son|daughter|child)\s+(\w+)/gi,
      /(\w+)\s+(?:is|has|does|struggles|can't|won't)/gi,
      /for\s+(\w+),?\s+(?:he|she|they)/gi,
      /(\w+)'s\s+(?:behavior|attention|focus)/gi
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(message)) !== null) {
        const name = match[1];
        if (name && name.length > 2 && !names.includes(name) && this.isLikelyName(name)) {
          names.push(name);
        }
      }
    });
    
    return names.length > 0 ? names : ['my child']; // Default if no specific names found
  }
  
  // Check if a word is likely a name (starts with capital, not a common word)
  isLikelyName(word: string): boolean {
    const commonWords = ['he', 'she', 'they', 'child', 'son', 'daughter', 'kid', 'school', 'home', 'teacher', 'parent', 'family'];
    return word[0] === word[0].toUpperCase() && !commonWords.includes(word.toLowerCase());
  }
  
  // Update ADHD assessment based on message content
  async updateAdhdAssessment(childId: number, message: string) {
    const updates: any = {};
    const lowerMessage = message.toLowerCase();
    
    // Check for ADHD symptoms and severity
    Object.entries(adhdSymptomMap).forEach(([keyword, field]) => {
      if (lowerMessage.includes(keyword)) {
        // Extract severity from context
        const severity = this.extractSeverity(message, keyword, adhdResponseMap);
        if (severity) {
          updates[field] = severity;
          console.log(`📝 ADHD: ${field} = ${severity}`);
        }
      }
    });
    
    // Check for performance indicators
    if (lowerMessage.includes('school') || lowerMessage.includes('grades')) {
      const performance = this.extractPerformance(message, performanceMap);
      if (performance) {
        updates.academicPerformance = performance;
        console.log(`📝 ADHD: Academic performance = ${performance}`);
      }
    }
    
    // Update database if we found relevant information
    if (Object.keys(updates).length > 0) {
      await db.update(adhdAssessments)
        .set({ ...updates, lastUpdated: new Date() })
        .where(eq(adhdAssessments.childId, childId));
    }
  }
  
  // Update Autism assessment based on message content
  async updateAutismAssessment(childId: number, message: string) {
    const updates: any = {};
    const lowerMessage = message.toLowerCase();
    
    // Check for autism symptoms
    Object.entries(autismSymptomMap).forEach(([keyword, field]) => {
      if (lowerMessage.includes(keyword)) {
        const severity = this.extractSeverity(message, keyword, autismSeverityMap);
        if (severity) {
          updates[field] = severity;
          console.log(`📝 Autism: ${field} = ${severity}`);
        }
      }
    });
    
    // Check for developmental information
    if (lowerMessage.includes('language') || lowerMessage.includes('talking')) {
      if (lowerMessage.includes('delayed') || lowerMessage.includes('late')) {
        updates.languageDevelopment = 'delayed';
      } else if (lowerMessage.includes('regression') || lowerMessage.includes('lost')) {
        updates.languageDevelopment = 'regression';
      }
    }
    
    // Update database if we found relevant information
    if (Object.keys(updates).length > 0) {
      await db.update(autismAssessments)
        .set({ ...updates, lastUpdated: new Date() })
        .where(eq(autismAssessments.childId, childId));
    }
  }
  
  // Update ODD assessment based on message content
  async updateOddAssessment(childId: number, message: string) {
    const updates: any = {};
    const lowerMessage = message.toLowerCase();
    
    // Check for ODD symptoms
    Object.entries(oddSymptomMap).forEach(([keyword, field]) => {
      if (lowerMessage.includes(keyword)) {
        const severity = this.extractOddSeverity(message, keyword);
        if (severity) {
          updates[field] = severity;
          console.log(`📝 ODD: ${field} = ${severity}`);
        }
      }
    });
    
    // Update database if we found relevant information
    if (Object.keys(updates).length > 0) {
      await db.update(oddAssessments)
        .set({ ...updates, lastUpdated: new Date() })
        .where(eq(oddAssessments.childId, childId));
    }
  }
  
  // Extract severity from message context
  extractSeverity(message: string, keyword: string, severityMap: any): string | null {
    const context = this.getContext(message, keyword, 20);
    const contextLower = context.toLowerCase();
    
    for (const [phrase, value] of Object.entries(severityMap)) {
      if (contextLower.includes(phrase)) {
        return value as string;
      }
    }
    
    // Default severity based on context clues
    if (contextLower.includes('always') || contextLower.includes('constantly')) return 'very_often';
    if (contextLower.includes('often') || contextLower.includes('frequently')) return 'often';
    if (contextLower.includes('sometimes') || contextLower.includes('occasionally')) return 'occasionally';
    
    return 'often'; // Default assumption if mentioned
  }
  
  // Extract ODD-specific severity
  extractOddSeverity(message: string, keyword: string): string | null {
    const context = this.getContext(message, keyword, 20);
    const contextLower = context.toLowerCase();
    
    if (contextLower.includes('never')) return 'never';
    if (contextLower.includes('rarely') || contextLower.includes('sometimes')) return 'sometimes';
    if (contextLower.includes('often') || contextLower.includes('frequently')) return 'often';
    if (contextLower.includes('always') || contextLower.includes('constantly')) return 'very_often';
    
    return 'often'; // Default if mentioned
  }
  
  // Extract performance level from message
  extractPerformance(message: string, performanceMap: any): string | null {
    const messageLower = message.toLowerCase();
    
    for (const [phrase, value] of Object.entries(performanceMap)) {
      if (messageLower.includes(phrase)) {
        return value as string;
      }
    }
    
    // Context-based performance assessment
    if (messageLower.includes('struggling') || messageLower.includes('failing')) return 'problematic';
    if (messageLower.includes('doing well') || messageLower.includes('good grades')) return 'above_average';
    
    return null;
  }
  
  // Get surrounding context of a keyword in message
  getContext(message: string, keyword: string, wordsAround: number): string {
    const words = message.split(' ');
    const keywordIndex = words.findIndex(word => 
      word.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (keywordIndex === -1) return message;
    
    const start = Math.max(0, keywordIndex - wordsAround);
    const end = Math.min(words.length, keywordIndex + wordsAround + 1);
    
    return words.slice(start, end).join(' ');
  }
  
  // Get assessment summary for a child
  async getAssessmentSummary(userId: string, childName: string) {
    const profile = await db.select()
      .from(childProfiles)
      .where(and(
        eq(childProfiles.userId, userId),
        eq(childProfiles.childName, childName)
      ));
    
    if (profile.length === 0) return null;
    
    const childId = profile[0].id;
    
    // Get all assessments
    const [adhdData] = await db.select().from(adhdAssessments).where(eq(adhdAssessments.childId, childId));
    const [autismData] = await db.select().from(autismAssessments).where(eq(autismAssessments.childId, childId));
    const [oddData] = await db.select().from(oddAssessments).where(eq(oddAssessments.childId, childId));
    
    return {
      profile: profile[0],
      adhd: adhdData,
      autism: autismData,
      odd: oddData
    };
  }
}

export const assessmentProcessor = new AssessmentProcessor();