import { db } from '../db';
import { childProfiles, adhdAssessments, autismAssessments, oddAssessments, symptomChecklists } from '@shared/schema';
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
    
    // Create new profile with comprehensive information
    console.log(`➕ Creating new profile for ${childName}`);
    const newProfile = await db.insert(childProfiles)
      .values({
        userId,
        childName,
        dateOfBirth: additionalInfo?.dateOfBirth || null,
        age: additionalInfo?.age || null,
        gender: additionalInfo?.gender || null,
        existingDiagnoses: additionalInfo?.existingDiagnoses || [],
        currentChallenges: additionalInfo?.currentChallenges || [],
        currentStrengths: additionalInfo?.currentStrengths || [],
        parentGoals: additionalInfo?.parentGoals || [],
        senaliObservations: 'Initial profile created through conversation'
      })
      .returning();
    
    // Initialize empty assessments
    await this.initializeAssessments(newProfile[0].id);
    
    return newProfile[0];
  }

  // Update child profile with new information from conversation
  async updateChildProfile(userId: string, childName: string, updates: any) {
    console.log(`📝 Updating profile for ${childName} with new information`);
    
    const profile = await this.getOrCreateChildProfile(userId, childName);
    
    // Merge arrays without duplicates
    const mergeArrays = (existing: string[] | null, newItems: string[]) => {
      const existingArray = existing || [];
      const combined = [...existingArray, ...newItems];
      // Convert Set to Array for TypeScript compatibility
      return Array.from(new Set(combined)); // Remove duplicates
    };
    
    const updateData: any = {
      updatedAt: new Date()
    };
    
    // Update scalar fields
    if (updates.age) updateData.age = updates.age;
    if (updates.gender) updateData.gender = updates.gender;
    if (updates.schoolGrade) updateData.schoolGrade = updates.schoolGrade;
    if (updates.schoolType) updateData.schoolType = updates.schoolType;
    if (updates.hasIEP !== undefined) updateData.hasIEP = updates.hasIEP;
    if (updates.has504Plan !== undefined) updateData.has504Plan = updates.has504Plan;
    if (updates.sleepPatterns) updateData.sleepPatterns = updates.sleepPatterns;
    if (updates.dietaryNeeds) updateData.dietaryNeeds = updates.dietaryNeeds;
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
    if (updates.primaryCaregivers) {
      updateData.primaryCaregivers = mergeArrays(profile.primaryCaregivers, updates.primaryCaregivers);
    }
    
    // Update notes by appending
    if (updates.parentNotes) {
      const existingNotes = profile.parentNotes || '';
      updateData.parentNotes = existingNotes ? 
        `${existingNotes}\n\n[${new Date().toLocaleDateString()}] ${updates.parentNotes}` : 
        `[${new Date().toLocaleDateString()}] ${updates.parentNotes}`;
    }
    
    // Update Senali observations
    if (updates.senaliObservations) {
      const existingObs = profile.senaliObservations || '';
      updateData.senaliObservations = existingObs ? 
        `${existingObs}\n\n[${new Date().toLocaleDateString()}] ${updates.senaliObservations}` : 
        `[${new Date().toLocaleDateString()}] ${updates.senaliObservations}`;
    }
    
    await db.update(childProfiles)
      .set(updateData)
      .where(eq(childProfiles.id, profile.id));
    
    console.log(`✅ Updated profile for ${childName}`);
    return updateData;
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
      
      // Extract and update child profile information
      await this.extractAndUpdateProfileInfo(userId, childName, message);
      
      // Process symptom checklist updates based on conversation
      await this.updateSymptomChecklist(profile.id, message, childName);
      
      // Extract and update ADHD symptoms
      await this.updateAdhdAssessment(profile.id, message);
      
      // Extract and update Autism symptoms
      await this.updateAutismAssessment(profile.id, message);
      
      // Extract and update ODD symptoms
      await this.updateOddAssessment(profile.id, message);
    }
  }

  // Update symptom checklist based on conversational context
  async updateSymptomChecklist(childId: number, message: string, childName: string) {
    console.log(`🔄 Processing symptom updates for ${childName} from conversation`);
    
    // Get or create symptom checklist
    let [checklist] = await db.select()
      .from(symptomChecklists)
      .where(eq(symptomChecklists.childId, childId));
    
    if (!checklist) {
      // Create new checklist
      const [newChecklist] = await db.insert(symptomChecklists)
        .values({ childId })
        .returning();
      checklist = newChecklist;
    }
    
    const updates: any = {};
    const lowerMessage = message.toLowerCase();
    
    // Track symptom mentions with positive/negative context
    const symptomUpdates = this.extractSymptomUpdates(message, childName);
    
    // Apply updates to checklist
    for (const update of symptomUpdates) {
      if (update.field && update.value !== null) {
        updates[update.field] = update.value;
        console.log(`📝 Updating ${update.field}: ${update.value} (${update.reason})`);
      }
    }
    
    // Update database if we have changes
    if (Object.keys(updates).length > 0) {
      updates.lastUpdated = new Date();
      await db.update(symptomChecklists)
        .set(updates)
        .where(eq(symptomChecklists.childId, childId));
      
      console.log(`✅ Updated ${Object.keys(updates).length} symptoms for ${childName}`);
    }
  }

  // Extract symptom updates from natural conversation
  extractSymptomUpdates(message: string, childName: string): Array<{field: string, value: boolean, reason: string}> {
    const updates: Array<{field: string, value: boolean, reason: string}> = [];
    const lowerMessage = message.toLowerCase();
    const childLower = childName.toLowerCase();
    
    // Define symptom patterns with their corresponding database fields
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
      { patterns: ['avoids homework', 'hates homework', 'refuses to do', 'won\'t do mental work'], field: 'avoidsTasksRequiringMentalEffort', positive: true },
      { patterns: ['does homework willingly', 'enjoys mental tasks', 'doesn\'t avoid work'], field: 'avoidsTasksRequiringMentalEffort', positive: false },
      { patterns: ['doesn\'t listen', 'ignores me', 'tunes out', 'acts like deaf'], field: 'difficultyListeningWhenSpokenTo', positive: true },
      { patterns: ['listens well', 'pays attention when spoken to', 'good listener'], field: 'difficultyListeningWhenSpokenTo', positive: false },
      { patterns: ['doesn\'t follow directions', 'ignores instructions', 'won\'t follow rules'], field: 'difficultyFollowingInstructions', positive: true },
      { patterns: ['follows directions', 'good at following instructions', 'listens to rules'], field: 'difficultyFollowingInstructions', positive: false },
      { patterns: ['messy', 'disorganized', 'can\'t organize', 'everything is chaos'], field: 'difficultyOrganizingTasks', positive: true },
      { patterns: ['organized', 'neat', 'good at organizing', 'keeps things tidy'], field: 'difficultyOrganizingTasks', positive: false },
      
      // Hyperactivity & Impulsivity
      { patterns: ['fidgets', 'squirms', 'can\'t sit still', 'always moving hands'], field: 'fidgetsOrSquirms', positive: true },
      { patterns: ['sits still', 'calm hands', 'doesn\'t fidget'], field: 'fidgetsOrSquirms', positive: false },
      { patterns: ['gets up', 'leaves seat', 'won\'t stay seated', 'stands up'], field: 'difficultyStayingSeated', positive: true },
      { patterns: ['stays seated', 'sits well', 'remains in seat'], field: 'difficultyStayingSeated', positive: false },
      { patterns: ['runs everywhere', 'climbs on everything', 'excessive running', 'can\'t walk'], field: 'excessiveRunningOrClimbing', positive: true },
      { patterns: ['walks appropriately', 'doesn\'t run inside', 'calm movement'], field: 'excessiveRunningOrClimbing', positive: false },
      { patterns: ['can\'t play quietly', 'loud during play', 'noisy'], field: 'difficultyPlayingQuietly', positive: true },
      { patterns: ['plays quietly', 'can be quiet', 'peaceful play'], field: 'difficultyPlayingQuietly', positive: false },
      { patterns: ['talks too much', 'non-stop talking', 'excessive talking', 'talks constantly'], field: 'talksExcessively', positive: true },
      { patterns: ['talks appropriately', 'good conversation', 'doesn\'t talk too much'], field: 'talksExcessively', positive: false },
      { patterns: ['blurts out', 'interrupts', 'answers before asked', 'speaks out of turn'], field: 'blurtsOutAnswers', positive: true },
      { patterns: ['waits to answer', 'raises hand', 'waits turn to speak'], field: 'blurtsOutAnswers', positive: false },
      { patterns: ['can\'t wait', 'impatient', 'wants things now', 'trouble waiting'], field: 'difficultyWaitingTurn', positive: true },
      { patterns: ['waits patiently', 'good at waiting', 'patient'], field: 'difficultyWaitingTurn', positive: false },
      { patterns: ['butts in', 'interrupts others', 'intrudes', 'barges in'], field: 'interruptsOrIntrudes', positive: true },
      { patterns: ['waits for others', 'doesn\'t interrupt', 'respectful of others'], field: 'interruptsOrIntrudes', positive: false },
      
      // Social Communication
      { patterns: ['trouble with friends', 'doesn\'t share emotions', 'cold', 'doesn\'t respond socially'], field: 'socialEmotionalReciprocity', positive: true },
      { patterns: ['good with friends', 'shares emotions', 'warm', 'socially responsive'], field: 'socialEmotionalReciprocity', positive: false },
      { patterns: ['no eye contact', 'avoids eye contact', 'looks away', 'won\'t look at me'], field: 'nonverbalCommunication', positive: true },
      { patterns: ['good eye contact', 'looks at me', 'normal eye contact'], field: 'nonverbalCommunication', positive: false },
      { patterns: ['no friends', 'trouble making friends', 'can\'t keep friends', 'isolated'], field: 'developingMaintainingRelationships', positive: true },
      { patterns: ['has friends', 'good friendships', 'social', 'gets along well'], field: 'developingMaintainingRelationships', positive: false },
      
      // Restricted Interests & Repetitive Behaviors
      { patterns: ['obsessed with', 'only talks about', 'fixated on', 'intense interest'], field: 'restrictedFixatedInterests', positive: true },
      { patterns: ['varied interests', 'flexible interests', 'not obsessed'], field: 'restrictedFixatedInterests', positive: false },
      { patterns: ['same routine', 'must be the same', 'melts down if changed', 'rigid routine'], field: 'insistenceOnSameness', positive: true },
      { patterns: ['flexible', 'adapts to change', 'okay with changes'], field: 'insistenceOnSameness', positive: false },
      { patterns: ['flaps hands', 'rocks', 'spins', 'repetitive movements'], field: 'stereotypedRepetitiveMotor', positive: true },
      { patterns: ['no repetitive movements', 'normal movements'], field: 'stereotypedRepetitiveMotor', positive: false },
      
      // Sensory Processing
      { patterns: ['covers ears', 'hates loud sounds', 'sensitive to noise', 'sound bothers'], field: 'sensoryReactivity', positive: true },
      { patterns: ['normal with sounds', 'not sensitive to noise'], field: 'sensoryReactivity', positive: false },
      
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
            
            // If this is a correction, flip the previous value or be more careful
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

  // Extract comprehensive profile information from conversation
  async extractAndUpdateProfileInfo(userId: string, childName: string, message: string) {
    const lowerMessage = message.toLowerCase();
    const updates: any = {};
    
    // Extract age information - ONLY from explicit age statements
    const ageMatch = message.match(new RegExp(`${childName}.*?is\\s*(\\d+)\\s*(?:years?\\s*old)`, 'i')) ||
                     message.match(/(?:he|she) is (\d+)\s*(?:years?\s*old)/i) ||
                     message.match(/(\d+)\s*year-old/i);
    if (ageMatch) {
      updates.age = parseInt(ageMatch[1]);
      console.log(`📝 Age extracted: ${updates.age}`);
    }
    
    // Extract gender information - ONLY from explicit parent statements
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
      console.log(`📝 Diagnoses extracted: ${diagnoses.join(', ')}`);
    }
    
    // Extract challenges - ONLY from explicit parent statements about difficulties
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
    if (lowerMessage.includes('sleep') && (lowerMessage.includes('problem') || lowerMessage.includes('difficult') || lowerMessage.includes('trouble sleeping'))) {
      challenges.push('sleep difficulties');
    }
    if (challenges.length > 0) {
      updates.currentChallenges = challenges;
      console.log(`📝 Challenges extracted: ${challenges.join(', ')}`);
    }
    
    // Extract strengths - ONLY from explicit statements
    const strengths = [];
    if (lowerMessage.includes('good at') || lowerMessage.includes('excellent at') || lowerMessage.includes('talented') || lowerMessage.includes('great with')) {
      const strengthMatch = message.match(/(?:good at|excellent at|talented in|great with|excels at)\s+([^.!?]+)/i);
      if (strengthMatch) {
        strengths.push(strengthMatch[1].trim());
      }
    }
    // Only add generic strengths if explicitly stated by parent
    if ((lowerMessage.includes('he is creative') || lowerMessage.includes('she is creative') || lowerMessage.includes(`${childName} is creative`)) || 
        (lowerMessage.includes('he is artistic') || lowerMessage.includes('she is artistic') || lowerMessage.includes(`${childName} is artistic`))) {
      strengths.push('creative and artistic abilities');
    }
    if (strengths.length > 0) {
      updates.currentStrengths = strengths;
      console.log(`📝 Strengths extracted: ${strengths.join(', ')}`);
    }
    
    // Extract school information
    if (lowerMessage.includes('grade') || lowerMessage.includes('kindergarten') || lowerMessage.includes('preschool')) {
      const gradeMatch = message.match(/(?:in\s+)?(\w+)\s+grade|kindergarten|preschool/i);
      if (gradeMatch) {
        updates.schoolGrade = gradeMatch[1] || (lowerMessage.includes('kindergarten') ? 'kindergarten' : 'preschool');
        console.log(`📝 School grade extracted: ${updates.schoolGrade}`);
      }
    }
    
    // Extract IEP/504 information
    if (lowerMessage.includes('iep')) {
      updates.hasIEP = true;
      console.log(`📝 IEP status: true`);
    }
    if (lowerMessage.includes('504') || lowerMessage.includes('five oh four')) {
      updates.has504Plan = true;
      console.log(`📝 504 plan status: true`);
    }
    
    // Extract therapy information
    const therapies = [];
    if (lowerMessage.includes('speech therapy') || lowerMessage.includes('speech therapist')) {
      therapies.push('speech therapy');
    }
    if (lowerMessage.includes('occupational therapy') || lowerMessage.includes('ot ')) {
      therapies.push('occupational therapy');
    }
    if (lowerMessage.includes('behavioral therapy') || lowerMessage.includes('aba')) {
      therapies.push('behavioral therapy');
    }
    if (lowerMessage.includes('physical therapy') || lowerMessage.includes('pt ')) {
      therapies.push('physical therapy');
    }
    if (therapies.length > 0) {
      updates.currentTherapies = therapies;
      console.log(`📝 Therapies extracted: ${therapies.join(', ')}`);
    }
    
    // Extract medication information
    const medications = [];
    if (lowerMessage.includes('medication') || lowerMessage.includes('meds')) {
      // Common ADHD medications
      if (lowerMessage.includes('adderall') || lowerMessage.includes('ritalin') || lowerMessage.includes('concerta') || lowerMessage.includes('vyvanse')) {
        const medMatch = message.match(/(adderall|ritalin|concerta|vyvanse)/i);
        if (medMatch) medications.push(medMatch[1]);
      }
    }
    if (medications.length > 0) {
      updates.currentMedications = medications;
      console.log(`📝 Medications extracted: ${medications.join(', ')}`);
    }
    
    // Extract parent goals
    const goals = [];
    if (lowerMessage.includes('want to work on') || lowerMessage.includes('hoping to improve') || lowerMessage.includes('goal is')) {
      const goalMatch = message.match(/(?:want to work on|hoping to improve|goal is)\s+([^.!?]+)/i);
      if (goalMatch) {
        goals.push(goalMatch[1].trim());
      }
    }
    if (goals.length > 0) {
      updates.parentGoals = goals;
      console.log(`📝 Parent goals extracted: ${goals.join(', ')}`);
    }
    
    // Add Senali observation based on the conversation
    const observationParts = [];
    if (Object.keys(updates).length > 0) {
      observationParts.push('Parent shared new information about child');
    }
    if (lowerMessage.includes('struggling') || lowerMessage.includes('difficult') || lowerMessage.includes('problem')) {
      observationParts.push('Parent expressing concerns about challenges');
    }
    if (lowerMessage.includes('improve') || lowerMessage.includes('help') || lowerMessage.includes('support')) {
      observationParts.push('Parent seeking guidance and support');
    }
    
    if (observationParts.length > 0) {
      updates.senaliObservations = observationParts.join('; ');
    }
    
    // Update the profile if we found any information
    if (Object.keys(updates).length > 0) {
      await this.updateChildProfile(userId, childName, updates);
      console.log(`📊 Updated ${childName}'s profile with ${Object.keys(updates).length} new pieces of information`);
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

  // Get all child profiles for a user (for chat context)
  async getAllChildProfiles(userId: string) {
    const profiles = await db.select()
      .from(childProfiles)
      .where(eq(childProfiles.userId, userId))
      .orderBy(childProfiles.createdAt);
    
    return profiles;
  }

  // Get comprehensive child context for chat  
  async getChildContext(userId: string): Promise<string> {
    const profiles = await this.getAllChildProfiles(userId);
    
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
      } else if (profile.currentMedications && profile.currentMedications.length === 0) {
        context += `   Medications: None\n`;
      }
      
      if (profile.parentGoals && profile.parentGoals.length > 0) {
        context += `   Parent goals: ${profile.parentGoals.join('; ')}\n`;
      }
      
      if (profile.sensoryNeeds) context += `   Sensory needs: ${profile.sensoryNeeds}\n`;
      if (profile.communicationStyle) context += `   Communication style: ${profile.communicationStyle}\n`;
      
      // Get symptom checklist data
      const [symptomData] = await db.select()
        .from(symptomChecklists)
        .where(eq(symptomChecklists.childId, profile.id));
      
      if (symptomData) {
        context += `   Symptom Profile (parent-reported):\n`;
        
        // Attention & Focus symptoms
        const attentionSymptoms = this.formatSymptomGroup([
          { label: 'Difficulty paying attention', value: symptomData.difficultyPayingAttention },
          { label: 'Easily distracted', value: symptomData.easilyDistracted },
          { label: 'Difficulty finishing tasks', value: symptomData.difficultyFinishingTasks },
          { label: 'Forgetful in daily activities', value: symptomData.forgetfulInDailyActivities },
          { label: 'Loses things frequently', value: symptomData.losesThingsFrequently },
          { label: 'Avoids tasks requiring mental effort', value: symptomData.avoidsTasksRequiringMentalEffort },
          { label: 'Difficulty listening when spoken to', value: symptomData.difficultyListeningWhenSpokenTo },
          { label: 'Difficulty following instructions', value: symptomData.difficultyFollowingInstructions },
          { label: 'Difficulty organizing tasks', value: symptomData.difficultyOrganizingTasks }
        ]);
        if (attentionSymptoms) context += `      Attention/Focus: ${attentionSymptoms}\n`;
        
        // Hyperactivity & Impulsivity symptoms  
        const hyperactivitySymptoms = this.formatSymptomGroup([
          { label: 'Fidgets or squirms', value: symptomData.fidgetsOrSquirms },
          { label: 'Difficulty staying seated', value: symptomData.difficultyStayingSeated },
          { label: 'Excessive running/climbing', value: symptomData.excessiveRunningOrClimbing },
          { label: 'Difficulty playing quietly', value: symptomData.difficultyPlayingQuietly },
          { label: 'Talks excessively', value: symptomData.talksExcessively },
          { label: 'Blurts out answers', value: symptomData.blurtsOutAnswers },
          { label: 'Difficulty waiting turn', value: symptomData.difficultyWaitingTurn },
          { label: 'Interrupts or intrudes', value: symptomData.interruptsOrIntrudes },
          { label: 'Always on the go', value: symptomData.alwaysOnTheGo }
        ]);
        if (hyperactivitySymptoms) context += `      Hyperactivity/Impulsivity: ${hyperactivitySymptoms}\n`;
        
        // Social Communication symptoms
        const socialSymptoms = this.formatSymptomGroup([
          { label: 'Difficulty making eye contact', value: symptomData.difficultyMakingEyeContact },
          { label: 'Difficulty understanding nonverbal cues', value: symptomData.difficultyUnderstandingNonverbalCues },
          { label: 'Difficulty making friends', value: symptomData.difficultyMakingFriends },
          { label: 'Difficulty initiating conversations', value: symptomData.difficultyInitiatingConversations },
          { label: 'Difficulty understanding social situations', value: symptomData.difficultyUnderstandingSocialSituations },
          { label: 'Difficulty with back-and-forth conversation', value: symptomData.difficultyWithBackAndForthConversation },
          { label: 'Difficulty showing emotions', value: symptomData.difficultyShowingEmotions },
          { label: 'Limited facial expressions', value: symptomData.limitedFacialExpressions },
          { label: 'Difficulty understanding others emotions', value: symptomData.difficultyUnderstandingOthersEmotions }
        ]);
        if (socialSymptoms) context += `      Social Communication: ${socialSymptoms}\n`;
        
        // Restricted Interests & Repetitive Behaviors
        const repetitiveSymptoms = this.formatSymptomGroup([
          { label: 'Intense focus on specific topics', value: symptomData.intenseFocusOnSpecificTopics },
          { label: 'Repetitive movements', value: symptomData.repetitiveMovements },
          { label: 'Insistence on sameness', value: symptomData.insistenceOnSameness },
          { label: 'Difficulty with changes in routine', value: symptomData.difficultyWithChangesInRoutine },
          { label: 'Unusual attachment to objects', value: symptomData.unusualAttachmentToObjects },
          { label: 'Repetitive use of language', value: symptomData.repetitiveUseOfLanguage },
          { label: 'Preoccupation with parts of objects', value: symptomData.preoccupationWithPartsOfObjects }
        ]);
        if (repetitiveSymptoms) context += `      Repetitive Behaviors: ${repetitiveSymptoms}\n`;
        
        // Sensory Processing symptoms
        const sensorySymptoms = this.formatSymptomGroup([
          { label: 'Oversensitive to sounds', value: symptomData.oversensitiveToSounds },
          { label: 'Oversensitive to textures', value: symptomData.oversensitiveToTextures },
          { label: 'Oversensitive to light', value: symptomData.oversensitiveToLight },
          { label: 'Undersensitive to temperature', value: symptomData.undersensitiveToTemperature },
          { label: 'Seeks out sensory input', value: symptomData.seeksOutSensoryInput },
          { label: 'Avoids messy play', value: symptomData.avoidsMessyPlay },
          { label: 'Difficulty with certain clothing textures', value: symptomData.difficultyWithCertainClothingTextures },
          { label: 'Unusual reaction to pain', value: symptomData.unusualReactionToPain }
        ]);
        if (sensorySymptoms) context += `      Sensory Processing: ${sensorySymptoms}\n`;
        
        // Emotional Regulation symptoms
        const emotionalSymptoms = this.formatSymptomGroup([
          { label: 'Frequent meltdowns', value: symptomData.frequentMeltdowns },
          { label: 'Difficulty controlling emotions', value: symptomData.difficultyControllingEmotions },
          { label: 'Frequent temper tantrums', value: symptomData.frequentTemperTantrums },
          { label: 'Difficulty with transitions', value: symptomData.difficultyWithTransitions },
          { label: 'Extreme reactions to disappointment', value: symptomData.extremeReactionsToDisappointment },
          { label: 'Difficulty calming down when upset', value: symptomData.difficultyCalminDownWhenUpset },
          { label: 'Mood swings', value: symptomData.moodSwings },
          { label: 'Anxiety or worrying', value: symptomData.anxietyOrWorrying }
        ]);
        if (emotionalSymptoms) context += `      Emotional Regulation: ${emotionalSymptoms}\n`;
      }
      
      context += `\n`;
    }
    
    context += `CRITICAL: This information represents ONLY what parents have explicitly shared about their children in previous conversations. Never add assumptions, typical characteristics, or details not directly provided by the parent. Only reference information that was specifically mentioned by the parent about their child.`;
    
    return context;
  }
  
  // Helper method to format symptom groups
  private formatSymptomGroup(symptoms: { label: string; value: string | null }[]): string | null {
    const presentSymptoms = symptoms.filter(s => s.value === 'yes').map(s => s.label);
    const absentSymptoms = symptoms.filter(s => s.value === 'no').map(s => s.label);
    
    if (presentSymptoms.length === 0 && absentSymptoms.length === 0) {
      return null; // No data to show
    }
    
    let result = '';
    if (presentSymptoms.length > 0) {
      result += `Present: ${presentSymptoms.join(', ')}`;
    }
    if (absentSymptoms.length > 0) {
      if (result) result += '; ';
      result += `Not present: ${absentSymptoms.join(', ')}`;
    }
    
    return result;
  }
}

export const assessmentProcessor = new AssessmentProcessor();