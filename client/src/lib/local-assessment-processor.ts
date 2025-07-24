// Client-side assessment processor for local storage
import { localStorage } from './local-storage';
import type { ChildProfile, SymptomChecklist } from './local-storage';

export class LocalAssessmentProcessor {
  // Extract child names from message
  extractChildNames(message: string): string[] {
    const names: string[] = [];
    
    // Common patterns for child names
    const namePatterns = [
      /(?:my (?:son|daughter|child|kid))\s+([A-Z][a-z]+)/gi,
      /([A-Z][a-z]+)\s+(?:is|was|has|does|can't|won't)/gi,
      /(?:with|about|for)\s+([A-Z][a-z]+)/gi
    ];
    
    for (const pattern of namePatterns) {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      while ((match = regex.exec(message)) !== null) {
        const name = match[1];
        if (name && name.length > 1 && !names.includes(name)) {
          // Filter out common words that aren't names
          const nonNames = ['He', 'She', 'They', 'This', 'That', 'Then', 'When', 'Where', 'What', 'How', 'Why'];
          if (!nonNames.includes(name)) {
            names.push(name);
          }
        }
        if (!pattern.global) break;
      }
    }
    
    return names;
  }

  // Get or create child profile in local storage
  async getOrCreateChildProfile(userId: string, childName: string): Promise<ChildProfile> {
    let profile = await localStorage.getChildProfile(userId, childName);
    
    if (!profile) {
      console.log(`Creating new profile for child: ${childName}`);
      profile = await localStorage.saveChildProfile({
        userId,
        childName
      });
    }
    
    return profile;
  }

  // Update child profile with new information
  async updateChildProfile(userId: string, childName: string, updates: any): Promise<void> {
    const profile = await this.getOrCreateChildProfile(userId, childName);
    
    // Merge arrays without duplicates
    const mergeArrays = (existing: string[] | undefined, newItems: string[]) => {
      const existingArray = existing || [];
      const combined = [...existingArray, ...newItems];
      return Array.from(new Set(combined)); // Remove duplicates
    };
    
    const updateData: any = {};
    
    // Update scalar fields
    if (updates.age) updateData.age = updates.age;
    if (updates.gender) updateData.gender = updates.gender;
    if (updates.schoolGrade) updateData.schoolGrade = updates.schoolGrade;
    if (updates.schoolType) updateData.schoolType = updates.schoolType;
    if (updates.hasIEP !== undefined) updateData.hasIEP = updates.hasIEP;
    if (updates.has504Plan !== undefined) updateData.has504Plan = updates.has504Plan;
    if (updates.sensoryNeeds) updateData.sensoryNeeds = updates.sensoryNeeds;
    if (updates.communicationStyle) updateData.communicationStyle = updates.communicationStyle;
    if (updates.familyStructure) updateData.familyStructure = updates.familyStructure;
    if (updates.siblings) updateData.siblings = updates.siblings;
    
    // Update array fields by merging
    if (updates.existingDiagnoses) {
      updateData.existingDiagnoses = mergeArrays(profile.existingDiagnoses, updates.existingDiagnoses);
    }
    if (updates.currentChallenges) {
      updateData.currentChallenges = mergeArrays(profile.currentChallenges, updates.currentChallenges);
    }
    if (updates.currentStrengths) {
      updateData.currentStrengths = mergeArrays(profile.currentStrengths, updates.currentStrengths);
    }
    if (updates.currentTherapies) {
      updateData.currentTherapies = mergeArrays(profile.currentTherapies, updates.currentTherapies);
    }
    if (updates.currentMedications) {
      updateData.currentMedications = mergeArrays(profile.currentMedications, updates.currentMedications);
    }
    if (updates.parentGoals) {
      updateData.parentGoals = mergeArrays(profile.parentGoals, updates.parentGoals);
    }
    
    // Update notes by appending
    if (updates.parentNotes) {
      const existingNotes = profile.parentNotes || '';
      updateData.parentNotes = existingNotes ? 
        `${existingNotes}\n\n[${new Date().toLocaleDateString()}] ${updates.parentNotes}` : 
        `[${new Date().toLocaleDateString()}] ${updates.parentNotes}`;
    }
    
    if (updates.senaliObservations) {
      const existingObs = profile.senaliObservations || '';
      updateData.senaliObservations = existingObs ? 
        `${existingObs}\n\n[${new Date().toLocaleDateString()}] ${updates.senaliObservations}` : 
        `[${new Date().toLocaleDateString()}] ${updates.senaliObservations}`;
    }
    
    await localStorage.saveChildProfile({
      ...profile,
      ...updateData
    });
    
    console.log(`✅ Updated profile for ${childName}`);
  }

  // Process message and extract information
  async processMessage(userId: string, message: string): Promise<void> {
    console.log(`🔄 Processing message for local assessments: ${message.substring(0, 100)}...`);
    
    // Extract child names mentioned in the message
    const childNames = this.extractChildNames(message);
    console.log(`👶 Children mentioned: ${childNames.join(', ')}`);
    
    // Process each child mentioned
    for (const childName of childNames) {
      const profile = await this.getOrCreateChildProfile(userId, childName);
      
      // Extract and update child profile information
      await this.extractAndUpdateProfileInfo(userId, childName, message);
      
      // Process symptom checklist updates based on conversation
      await this.updateSymptomChecklist(profile.id, message, childName);
    }
  }

  // Extract and update profile information from conversation
  async extractAndUpdateProfileInfo(userId: string, childName: string, message: string): Promise<void> {
    const lowerMessage = message.toLowerCase();
    const updates: any = {};
    
    // Extract age information
    const ageMatch = message.match(new RegExp(`${childName}.*?is\\s*(\\d+)\\s*(?:years?\\s*old)`, 'i')) ||
                     message.match(/(?:he|she) is (\d+)\s*(?:years?\s*old)/i) ||
                     message.match(/(\d+)\s*year-old/i);
    if (ageMatch) {
      updates.age = parseInt(ageMatch[1]);
    }
    
    // Extract gender information
    if (lowerMessage.includes('my son') && lowerMessage.includes(childName.toLowerCase())) {
      updates.gender = 'male';
    } else if (lowerMessage.includes('my daughter') && lowerMessage.includes(childName.toLowerCase())) {
      updates.gender = 'female';
    }
    
    // Extract existing diagnoses
    const diagnoses = [];
    if (lowerMessage.includes('diagnosed with adhd') || lowerMessage.includes('has adhd')) {
      diagnoses.push('ADHD');
    }
    if (lowerMessage.includes('diagnosed with autism') || lowerMessage.includes('has autism') || lowerMessage.includes('on the spectrum')) {
      diagnoses.push('Autism Spectrum Disorder');
    }
    if (lowerMessage.includes('anxiety') && lowerMessage.includes('diagnosed')) {
      diagnoses.push('Anxiety Disorder');
    }
    if (lowerMessage.includes('odd') && lowerMessage.includes('diagnosed')) {
      diagnoses.push('Oppositional Defiant Disorder');
    }
    if (diagnoses.length > 0) {
      updates.existingDiagnoses = diagnoses;
    }
    
    // Extract challenges
    const challenges = [];
    if (lowerMessage.includes('has trouble focusing') || lowerMessage.includes('can\'t focus') || lowerMessage.includes('struggles with attention')) {
      challenges.push('attention and focus difficulties');
    }
    if (lowerMessage.includes('social') && (lowerMessage.includes('difficult') || lowerMessage.includes('struggle') || lowerMessage.includes('hard time'))) {
      challenges.push('social interaction challenges');
    }
    if ((lowerMessage.includes('sensory') && (lowerMessage.includes('issues') || lowerMessage.includes('problems') || lowerMessage.includes('difficulties'))) ||
        (lowerMessage.includes('sensitive to') && (lowerMessage.includes('noise') || lowerMessage.includes('texture') || lowerMessage.includes('sounds')))) {
      challenges.push('sensory processing difficulties');
    }
    if (lowerMessage.includes('meltdown') || lowerMessage.includes('tantrum') || lowerMessage.includes('emotional outburst')) {
      challenges.push('emotional regulation challenges');
    }
    if (challenges.length > 0) {
      updates.currentChallenges = challenges;
    }
    
    // Extract strengths
    const strengths = [];
    if (lowerMessage.includes('good at') || lowerMessage.includes('excellent at') || lowerMessage.includes('talented') || lowerMessage.includes('great with')) {
      const strengthMatch = message.match(/(?:good at|excellent at|talented in|great with|excels at)\s+([^.!?]+)/i);
      if (strengthMatch) {
        strengths.push(strengthMatch[1].trim());
      }
    }
    if (strengths.length > 0) {
      updates.currentStrengths = strengths;
    }
    
    if (Object.keys(updates).length > 0) {
      await this.updateChildProfile(userId, childName, updates);
    }
  }

  // Update symptom checklist based on conversation
  async updateSymptomChecklist(childId: string, message: string, childName: string): Promise<void> {
    console.log(`🔄 Processing symptom updates for ${childName} from conversation`);
    
    // Get or create symptom checklist
    let checklist = await localStorage.getSymptomChecklist(childId);
    
    if (!checklist) {
      checklist = await localStorage.saveSymptomChecklist({ childId });
    }
    
    const updates: any = {};
    const symptomUpdates = this.extractSymptomUpdates(message, childName);
    
    // Apply updates to checklist
    for (const update of symptomUpdates) {
      if (update.field && update.value !== null) {
        updates[update.field] = update.value;
        console.log(`📝 Updating ${update.field}: ${update.value} (${update.reason})`);
      }
    }
    
    // Update local storage if we have changes
    if (Object.keys(updates).length > 0) {
      await localStorage.saveSymptomChecklist({
        ...checklist,
        ...updates
      });
      
      console.log(`✅ Updated ${Object.keys(updates).length} symptoms for ${childName}`);
    }
  }

  // Extract symptom updates from natural conversation
  extractSymptomUpdates(message: string, childName: string): Array<{field: string, value: boolean, reason: string}> {
    const updates: Array<{field: string, value: boolean, reason: string}> = [];
    const lowerMessage = message.toLowerCase();
    const childLower = childName.toLowerCase();
    
    // Define symptom patterns with their corresponding fields
    const symptomPatterns = [
      // Attention & Focus
      { patterns: ['can\'t focus', 'trouble focusing', 'loses focus', 'difficulty paying attention', 'doesn\'t pay attention'], field: 'difficultyPayingAttention', positive: true },
      { patterns: ['focuses well', 'pays attention', 'good focus', 'concentrates well'], field: 'difficultyPayingAttention', positive: false },
      { patterns: ['easily distracted', 'gets distracted', 'distracted by', 'can\'t concentrate'], field: 'easilyDistracted', positive: true },
      { patterns: ['not easily distracted', 'stays focused', 'not distracted'], field: 'easilyDistracted', positive: false },
      { patterns: ['doesn\'t finish', 'trouble finishing', 'gives up', 'starts but doesn\'t complete'], field: 'difficultyFinishingTasks', positive: true },
      { patterns: ['finishes tasks', 'completes work', 'follows through'], field: 'difficultyFinishingTasks', positive: false },
      { patterns: ['forgets things', 'forgetful', 'can\'t remember', 'loses track'], field: 'forgetfulInDailyActivities', positive: true },
      { patterns: ['remembers well', 'good memory', 'doesn\'t forget'], field: 'forgetfulInDailyActivities', positive: false },
      { patterns: ['loses things', 'can\'t find', 'misplaces', 'always losing'], field: 'losesThingsFrequently', positive: true },
      { patterns: ['keeps track', 'doesn\'t lose', 'organized with belongings'], field: 'losesThingsFrequently', positive: false },
      
      // Hyperactivity & Impulsivity
      { patterns: ['fidgets', 'squirms', 'can\'t sit still', 'always moving hands'], field: 'fidgetsOrSquirms', positive: true },
      { patterns: ['sits still', 'calm hands', 'doesn\'t fidget'], field: 'fidgetsOrSquirms', positive: false },
      { patterns: ['gets up', 'leaves seat', 'won\'t stay seated', 'stands up'], field: 'difficultyStayingSeated', positive: true },
      { patterns: ['stays seated', 'sits well', 'remains in seat'], field: 'difficultyStayingSeated', positive: false },
      { patterns: ['talks too much', 'non-stop talking', 'excessive talking', 'talks constantly'], field: 'talksExcessively', positive: true },
      { patterns: ['talks appropriately', 'good conversation', 'doesn\'t talk too much'], field: 'talksExcessively', positive: false },
      
      // Emotional Regulation
      { patterns: ['meltdowns', 'tantrums', 'explosive', 'can\'t control emotions'], field: 'frequentMeltdowns', positive: true },
      { patterns: ['calm', 'good emotional control', 'handles emotions well'], field: 'frequentMeltdowns', positive: false },
      { patterns: ['always angry', 'mad all the time', 'angry child', 'rage'], field: 'chronicAngerIrritability', positive: true },
      { patterns: ['not angry', 'happy child', 'pleasant mood', 'calm temperament'], field: 'chronicAngerIrritability', positive: false },
      { patterns: ['argues constantly', 'defiant', 'oppositional', 'fights everything'], field: 'argumentativeDefiantBehavior', positive: true },
      { patterns: ['compliant', 'doesn\'t argue', 'cooperative'], field: 'argumentativeDefiantBehavior', positive: false },
    ];
    
    // Look for correction patterns
    const correctionPatterns = [
      'actually', 'but really', 'i mean', 'well actually', 'correction', 'i misspoke', 
      'let me clarify', 'what i meant', 'not really', 'that\'s not right', 'i was wrong'
    ];
    
    const isCorrection = correctionPatterns.some(pattern => lowerMessage.includes(pattern));
    
    // Process each symptom pattern
    for (const symptom of symptomPatterns) {
      for (const pattern of symptom.patterns) {
        if (lowerMessage.includes(pattern)) {
          // Check if this is about the specific child
          const childMentioned = lowerMessage.includes(childLower) || 
                                 lowerMessage.includes('he ') || 
                                 lowerMessage.includes('she ') ||
                                 lowerMessage.includes('they ') ||
                                 lowerMessage.includes('my child') ||
                                 lowerMessage.includes('my kid');
          
          if (childMentioned) {
            let value = symptom.positive;
            let reason = `Parent mentioned: "${pattern}"`;
            
            if (isCorrection) {
              reason = `Correction - Parent clarified: "${pattern}"`;
            }
            
            updates.push({
              field: symptom.field,
              value: value,
              reason: reason
            });
          }
        }
      }
    }
    
    return updates;
  }

  // Get child context for AI responses
  async getChildContext(userId: string): Promise<string> {
    const profiles = await localStorage.getChildProfiles(userId);
    
    if (profiles.length === 0) {
      return "No child profiles found. This appears to be a new conversation.";
    }
    
    let context = `Child Profiles Context:\n\n`;
    
    for (let index = 0; index < profiles.length; index++) {
      const profile = profiles[index];
      context += `${index + 1}. ${profile.childName}:\n`;
      
      if (profile.age) context += `   Age: ${profile.age}\n`;
      if (profile.gender && profile.gender !== 'prefer_not_to_say') context += `   Gender: ${profile.gender}\n`;
      
      if (profile.existingDiagnoses && profile.existingDiagnoses.length > 0) {
        context += `   Diagnosed conditions: ${profile.existingDiagnoses.join(', ')}\n`;
      }
      
      if (profile.currentChallenges && profile.currentChallenges.length > 0) {
        context += `   Current challenges: ${profile.currentChallenges.join(', ')}\n`;
      }
      
      if (profile.currentStrengths && profile.currentStrengths.length > 0) {
        context += `   Strengths: ${profile.currentStrengths.join(', ')}\n`;
      }
      
      if (profile.schoolGrade) context += `   School: ${profile.schoolGrade}\n`;
      if (profile.hasIEP) context += `   Has IEP: Yes\n`;
      if (profile.has504Plan) context += `   Has 504 Plan: Yes\n`;
      
      if (profile.currentTherapies && profile.currentTherapies.length > 0) {
        context += `   Current therapies: ${profile.currentTherapies.join(', ')}\n`;
      }
      
      if (profile.currentMedications && profile.currentMedications.length > 0) {
        context += `   Medications: ${profile.currentMedications.join(', ')}\n`;
      }
      
      if (profile.parentGoals && profile.parentGoals.length > 0) {
        context += `   Parent goals: ${profile.parentGoals.join('; ')}\n`;
      }
      
      if (profile.sensoryNeeds) context += `   Sensory needs: ${profile.sensoryNeeds}\n`;
      if (profile.communicationStyle) context += `   Communication style: ${profile.communicationStyle}\n`;
      
      // Get symptom checklist data
      const symptoms = await localStorage.getSymptomChecklist(profile.id);
      
      if (symptoms) {
        context += `   Symptom Profile (parent-reported):\n`;
        
        // Format symptoms in groups
        const attentionSymptoms = this.formatSymptomGroup([
          { label: 'Difficulty paying attention', value: symptoms.difficultyPayingAttention },
          { label: 'Easily distracted', value: symptoms.easilyDistracted },
          { label: 'Difficulty finishing tasks', value: symptoms.difficultyFinishingTasks },
          { label: 'Forgetful in daily activities', value: symptoms.forgetfulInDailyActivities },
          { label: 'Loses things frequently', value: symptoms.losesThingsFrequently }
        ]);
        if (attentionSymptoms) context += `      Attention/Focus: ${attentionSymptoms}\n`;
        
        const hyperactivitySymptoms = this.formatSymptomGroup([
          { label: 'Fidgets or squirms', value: symptoms.fidgetsOrSquirms },
          { label: 'Difficulty staying seated', value: symptoms.difficultyStayingSeated },
          { label: 'Talks excessively', value: symptoms.talksExcessively }
        ]);
        if (hyperactivitySymptoms) context += `      Hyperactivity: ${hyperactivitySymptoms}\n`;
        
        const emotionalSymptoms = this.formatSymptomGroup([
          { label: 'Frequent meltdowns', value: symptoms.frequentMeltdowns },
          { label: 'Chronic anger/irritability', value: symptoms.chronicAngerIrritability },
          { label: 'Argumentative/defiant behavior', value: symptoms.argumentativeDefiantBehavior }
        ]);
        if (emotionalSymptoms) context += `      Emotional Regulation: ${emotionalSymptoms}\n`;
      }
      
      context += `\n`;
    }
    
    return context;
  }

  // Helper method to format symptom groups
  private formatSymptomGroup(symptoms: Array<{label: string, value?: boolean}>): string {
    const present = symptoms.filter(s => s.value === true).map(s => s.label);
    const notPresent = symptoms.filter(s => s.value === false).map(s => s.label);
    
    let result = '';
    if (present.length > 0) {
      result += `Present: ${present.join(', ')}`;
    }
    if (notPresent.length > 0) {
      if (result) result += '; ';
      result += `Not present: ${notPresent.join(', ')}`;
    }
    
    return result;
  }
}

export const localAssessmentProcessor = new LocalAssessmentProcessor();