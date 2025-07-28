// Client-side assessment processor for local storage
import { localStorage } from './local-storage';
import { enhancedPatternMatcher } from './enhanced-pattern-matcher';
import type { ChildProfile, SymptomChecklist } from './local-storage';

export class LocalAssessmentProcessor {
  // Extract all names from message (children, parents, spouses)
  extractAllNames(message: string): { children: string[], adults: string[] } {
    const childNames: string[] = [];
    const adultNames: string[] = [];
    
    // Patterns for adult family member detection (Mom, Dad, spouse)
    const adultPatterns = [
      // Direct references
      /(?:my (?:wife|husband|spouse|partner))\s+([A-Z][a-z]+)/gi,
      /(?:my (?:mom|mother|dad|father))\s+([A-Z][a-z]+)/gi,
      /([A-Z][a-z]+)\s+(?:is my (?:wife|husband|spouse|partner|mom|mother|dad|father))/gi,
      
      // Name patterns for adults
      /([A-Z][a-z]+)\s+(?:and I|works|teaches|drives|cooks|helps)/gi,
      
      // Context clues for parents/spouses
      /([A-Z][a-z]+)\s+(?:thinks|says|believes|wants|needs|feels)/gi
    ];
    
    // Enhanced patterns for child names - more precise detection
    const childPatterns = [
      // Direct child references with names
      /(?:my (?:son|daughter|child|kid|baby|toddler|boy|girl))\s+([A-Z][a-z]+)/gi,
      /(?:my (?:sons?|daughters?|children|kids))\s+(?:are\s+)?([A-Z][a-z]+)/gi,
      
      // Name patterns with actions/descriptions (but not generic words)
      /([A-Z][a-z]+)\s+(?:is|was|has|does|can't|won't|will|would|should|could|loves|likes|hates|enjoys|struggles|needs|goes|attends|started|finished)/gi,
      
      // Explicit name statements
      /(?:his|her|their) name is ([A-Z][a-z]+)/gi,
      /(?:called|named)\s+([A-Z][a-z]+)/gi,
      /([A-Z][a-z]+) is (?:my|our) (?:son|daughter|child|kid)/gi,
      
      // When correcting or clarifying names
      /(?:not|isn't)\s+([A-Z][a-z]+)[.,]\s+(?:it|his name|her name) is ([A-Z][a-z]+)/gi
    ];
    

    
    // Process child patterns
    for (const pattern of childPatterns) {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      while ((match = regex.exec(message)) !== null) {
        const name = match[1];
        if (name && name.length > 2 && !childNames.includes(name)) {
          // Comprehensive filter for non-names - including common question words
          const nonNames = [
            // Pronouns and common words
            'He', 'She', 'They', 'This', 'That', 'Then', 'When', 'Where', 'What', 'How', 'Why', 'The', 'And', 'But', 'Or', 'So', 'If', 'As', 'To', 'At', 'In', 'On', 'Up', 'By', 'For', 'From', 'With', 'About', 'Over', 'Under', 'Through', 'During', 'Before', 'After', 'Above', 'Below', 'Between', 'Among', 'Against', 'Across', 'Behind', 'Beyond', 'Beside', 'Near', 'Around', 'Inside', 'Outside', 'Without', 'Within', 'Upon', 'Since', 'Until', 'While', 'Although', 'Because', 'Unless', 'Whether', 'Though', 'Whereas', 'However', 'Therefore', 'Moreover', 'Furthermore', 'Nevertheless', 'Nonetheless', 'Consequently', 'Otherwise', 'Meanwhile', 'Similarly', 'Likewise', 'Instead', 'Rather', 'Indeed', 'Actually', 'Really', 'Quite', 'Very', 'Too', 'Also', 'Even', 'Just', 'Only', 'Still', 'Yet', 'Already', 'Soon', 'Now', 'Then', 'Here', 'There', 'Everywhere', 'Anywhere', 'Somewhere', 'Nowhere',
            // App/tech terms
            'Senali', 'Chat', 'Message', 'App', 'Screen', 'Phone', 'Browser', 'Website', 'Internet', 'Premium', 'Free', 'Trial', 'Subscribe', 'Upgrade',
            // Common verbs/adjectives that get capitalized
            'Are', 'Were', 'Been', 'Being', 'Have', 'Has', 'Had', 'Will', 'Would', 'Could', 'Should', 'Must', 'Might', 'May', 'Can', 'Cannot', 'Does', 'Did', 'Done', 'Make', 'Made', 'Take', 'Took', 'Give', 'Gave', 'Get', 'Got', 'Come', 'Came', 'Go', 'Went', 'See', 'Saw', 'Know', 'Knew', 'Think', 'Thought', 'Feel', 'Felt', 'Look', 'Looked', 'Want', 'Wanted', 'Need', 'Needed', 'Help', 'Helped', 'Try', 'Tried', 'Work', 'Worked', 'Play', 'Played', 'Live', 'Lived', 'Love', 'Loved', 'Like', 'Liked', 'Hate', 'Hated', 'Hope', 'Hoped', 'Wish', 'Wished', 'Good', 'Bad', 'Great', 'Best', 'Worst', 'Better', 'Worse', 'Big', 'Small', 'Large', 'Little', 'Old', 'New', 'Young', 'Happy', 'Sad', 'Angry', 'Mad', 'Glad', 'Nice', 'Mean', 'Kind', 'Smart', 'Dumb', 'Funny', 'Silly', 'Cute', 'Pretty', 'Ugly', 'Fast', 'Slow', 'Easy', 'Hard', 'Difficult', 'Simple', 'Right', 'Wrong', 'True', 'False',
            // CRITICAL: Words commonly used in questions about names
            'Name', 'Names', 'Called', 'Call', 'Known', 'Calling', 'Title', 'Titled'
          ];
          
          if (!nonNames.includes(name)) {
            childNames.push(name);
            console.log(`🧒 Detected child name: ${name} from pattern: ${pattern.source}`);
          }
        }
      }
    }
    
    // Process adult patterns
    for (const adultPattern of adultPatterns) {
      let match;
      const regex = new RegExp(adultPattern.source, adultPattern.flags);
      while ((match = regex.exec(message)) !== null) {
        const name = match[1];
        if (name && name.length > 2 && !adultNames.includes(name)) {
          // Same filter logic as children
          const nonNames = [
            'He', 'She', 'They', 'This', 'That', 'Then', 'When', 'Where', 'What', 'How', 'Why', 'The', 'And', 'But', 'Or', 'So', 'If', 'As', 'To', 'At', 'In', 'On', 'Up', 'By', 'For', 'From', 'With', 'About', 'Over', 'Under', 'Through', 'During', 'Before', 'After', 'Above', 'Below', 'Between', 'Among', 'Against', 'Across', 'Behind', 'Beyond', 'Beside', 'Near', 'Around', 'Inside', 'Outside', 'Without', 'Within', 'Upon', 'Since', 'Until', 'While', 'Although', 'Because', 'Unless', 'Whether', 'Though', 'Whereas', 'However', 'Therefore', 'Moreover', 'Furthermore', 'Nevertheless', 'Nonetheless', 'Consequently', 'Otherwise', 'Meanwhile', 'Similarly', 'Likewise', 'Instead', 'Rather', 'Indeed', 'Actually', 'Really', 'Quite', 'Very', 'Too', 'Also', 'Even', 'Just', 'Only', 'Still', 'Yet', 'Already', 'Soon', 'Now', 'Then', 'Here', 'There', 'Everywhere', 'Anywhere', 'Somewhere', 'Nowhere',
            'Senali', 'Chat', 'Message', 'App', 'Screen', 'Phone', 'Browser', 'Website', 'Internet', 'Premium', 'Free', 'Trial', 'Subscribe', 'Upgrade',
            'Are', 'Were', 'Been', 'Being', 'Have', 'Has', 'Had', 'Will', 'Would', 'Could', 'Should', 'Must', 'Might', 'May', 'Can', 'Cannot', 'Does', 'Did', 'Done', 'Make', 'Made', 'Take', 'Took', 'Give', 'Gave', 'Get', 'Got', 'Come', 'Came', 'Go', 'Went', 'See', 'Saw', 'Know', 'Knew', 'Think', 'Thought', 'Feel', 'Felt', 'Look', 'Looked', 'Want', 'Wanted', 'Need', 'Needed', 'Help', 'Helped', 'Try', 'Tried', 'Work', 'Worked', 'Play', 'Played', 'Live', 'Lived', 'Love', 'Loved', 'Like', 'Liked', 'Hate', 'Hated', 'Hope', 'Hoped', 'Wish', 'Wished', 'Good', 'Bad', 'Great', 'Best', 'Worst', 'Better', 'Worse', 'Big', 'Small', 'Large', 'Little', 'Old', 'New', 'Young', 'Happy', 'Sad', 'Angry', 'Mad', 'Glad', 'Nice', 'Mean', 'Kind', 'Smart', 'Dumb', 'Funny', 'Silly', 'Cute', 'Pretty', 'Ugly', 'Fast', 'Slow', 'Easy', 'Hard', 'Difficult', 'Simple', 'Right', 'Wrong', 'True', 'False', 'Name', 'Names', 'Called', 'Call', 'Known', 'Calling', 'Title', 'Titled'
          ];
          
          if (!nonNames.includes(name)) {
            adultNames.push(name);
            console.log(`👨 Detected adult name: ${name} from pattern: ${adultPattern.source}`);
          }
        }
      }
    }
    
    return { children: childNames, adults: adultNames };
  }

  // Get or create child profile in local storage
  async getOrCreateChildProfile(userId: string, childName: string): Promise<ChildProfile> {
    let profile = await localStorage.getChildProfile(userId, childName);
    
    if (!profile) {
      console.log(`Creating new profile for child: ${childName}`);
      profile = await localStorage.saveChildProfile({
        userId,
        childName,
        relationshipToUser: 'child',
        symptoms: {} // Initialize with empty symptoms object
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

  // Get or create family member profile (for Mom, Dad, spouse)
  async getOrCreateFamilyMemberProfile(userId: string, name: string, relationship: 'child' | 'spouse' | 'self' | 'other'): Promise<ChildProfile> {
    let profile = await localStorage.getChildProfile(userId, name);
    
    if (!profile) {
      console.log(`Creating new family member profile: ${name} (${relationship})`);
      profile = await localStorage.saveChildProfile({
        userId,
        childName: name,
        relationshipToUser: relationship,
        symptoms: {} // Initialize with empty symptoms object
      });
    }
    
    return profile;
  }


  // COST-EFFICIENT: Process message using enhanced local pattern matching (NO API CALLS)
  async processMessageEfficient(userId: string, message: string): Promise<void> {
    console.log(`💰 Cost-efficient processing: ${message.substring(0, 100)}...`);
    
    // Get existing family member names for context
    const existingProfiles = await localStorage.getChildProfiles(userId);
    const existingNames = existingProfiles.map(p => p.childName);
    
    // Use enhanced pattern matcher to extract comprehensive info in one pass
    const extracted = enhancedPatternMatcher.extractFamilyInfo(message, existingNames);
    
    console.log('📊 Extracted comprehensive info:', {
      newAges: Object.keys(extracted.ages).length,
      newGrades: Object.keys(extracted.grades).length,
      newDiagnoses: Object.keys(extracted.diagnoses).length,
      symptoms: Object.keys(extracted.symptoms).length
    });
    
    // Update all profiles efficiently 
    for (const [name, age] of Object.entries(extracted.ages)) {
      const profile = await this.getOrCreateChildProfile(userId, name);
      await this.updateChildProfile(userId, name, { age });
    }
    
    for (const [name, grade] of Object.entries(extracted.grades)) {
      await this.updateChildProfile(userId, name, { schoolGrade: grade });
    }
    
    for (const [name, school] of Object.entries(extracted.schools)) {
      await this.updateChildProfile(userId, name, { schoolType: school });
    }
    
    for (const [name, activities] of Object.entries(extracted.activities)) {
      await this.updateChildProfile(userId, name, { currentStrengths: activities });
    }
    
    for (const [name, diagnoses] of Object.entries(extracted.diagnoses)) {
      await this.updateChildProfile(userId, name, { existingDiagnoses: diagnoses });
    }
    
    // Process symptoms for all mentioned family members
    for (const name of [...existingNames, ...Object.keys(extracted.ages)]) {
      if (message.toLowerCase().includes(name.toLowerCase())) {
        const profile = await this.getOrCreateChildProfile(userId, name);
        await this.updateSymptomChecklist(profile.id, message, name);
      }
    }
  }

  // Extract and update profile information from conversation
  async extractAndUpdateProfileInfo(userId: string, childName: string, message: string): Promise<void> {
    const lowerMessage = message.toLowerCase();
    const updates: any = {};
    
    // Extract age information - comprehensive patterns for "Sam is 12 and Noah is 5"
    const nameAgePatterns = [
      // Primary pattern: "Sam is 12" or "Sam who is 12"
      new RegExp(`${childName}\\s+(?:is|who is)\\s+(\\d+)\\s*(?:years?\\s*old)?`, 'i'),
      // Specific pattern to avoid cross-matching: "Sam is 12 and Noah"
      new RegExp(`${childName}\\s+is\\s+(\\d+)(?=\\s*(?:years?\\s*old)?\\s*(?:and|,|\\.|$))`, 'i'),
      // Age before name: "12 year old Sam"
      new RegExp(`(\\d+)\\s*year[s]?[\\s-]*old\\s+${childName}`, 'i'),
      // Age context: "Sam age 12"
      new RegExp(`${childName}.*?age\\s+(\\d+)`, 'i')
    ];
    
    let ageMatch = null;
    for (const pattern of nameAgePatterns) {
      const match = message.match(pattern);
      if (match) {
        ageMatch = match;
        console.log(`🎯 Age pattern matched for ${childName}: "${match[0]}" -> ${match[1]}`);
        break;
      }
    }
    
    if (ageMatch) {
      const age = parseInt(ageMatch[1]);
      if (age > 0 && age < 25) { // Reasonable age range
        updates.age = age;
        console.log(`📅 Successfully extracted age ${age} for ${childName}`);
      }
    }
    
    // Extract gender information
    if (lowerMessage.includes('my son') && lowerMessage.includes(childName.toLowerCase())) {
      updates.gender = 'male';
    } else if (lowerMessage.includes('my daughter') && lowerMessage.includes(childName.toLowerCase())) {
      updates.gender = 'female';
    }
    
    // Extract existing diagnoses with comprehensive patterns
    const diagnoses = [];
    
    // ADHD patterns
    const adhdPatterns = [
      /diagnosed with adhd/i, /has adhd/i, /adhd diagnosis/i, /attention deficit/i,
      /add diagnosis/i, /\badd\b/i, /hyperactivity disorder/i
    ];
    if (adhdPatterns.some(pattern => pattern.test(lowerMessage))) {
      diagnoses.push('ADHD');
    }
    
    // Autism patterns
    const autismPatterns = [
      /diagnosed with autism/i, /has autism/i, /autism diagnosis/i, /on the spectrum/i,
      /asd diagnosis/i, /autism spectrum/i, /asperger/i, /pervasive developmental/i
    ];
    if (autismPatterns.some(pattern => pattern.test(lowerMessage))) {
      diagnoses.push('Autism Spectrum Disorder');
    }
    
    // Anxiety patterns
    const anxietyPatterns = [
      /anxiety disorder/i, /diagnosed with anxiety/i, /has anxiety/i, /panic disorder/i,
      /social anxiety/i, /generalized anxiety/i, /separation anxiety/i
    ];
    if (anxietyPatterns.some(pattern => pattern.test(lowerMessage))) {
      diagnoses.push('Anxiety Disorder');
    }
    
    // ODD patterns
    const oddPatterns = [
      /odd diagnosis/i, /oppositional defiant/i, /diagnosed with odd/i, /has odd/i,
      /defiant disorder/i, /conduct disorder/i
    ];
    if (oddPatterns.some(pattern => pattern.test(lowerMessage))) {
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
      console.log(`📝 Updating profile for ${childName}:`, updates);
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

  // Extract symptom updates from natural conversation - COST-EFFICIENT LOCAL PROCESSING
  extractSymptomUpdates(message: string, childName: string): Array<{field: string, value: boolean, reason: string}> {
    const updates: Array<{field: string, value: boolean, reason: string}> = [];
    const lowerMessage = message.toLowerCase();
    const childLower = childName.toLowerCase();
    
    // Comprehensive symptom patterns - NO API CALLS NEEDED
    const symptomPatterns = [
      // === ATTENTION & FOCUS SYMPTOMS ===
      { patterns: ['can\'t focus', 'trouble focusing', 'loses focus', 'difficulty paying attention', 'doesn\'t pay attention', 'attention problems', 'poor concentration', 'spacing out', 'daydreaming constantly'], field: 'difficultyPayingAttention', positive: true },
      { patterns: ['focuses well', 'pays attention', 'good focus', 'concentrates well', 'good attention', 'stays on task'], field: 'difficultyPayingAttention', positive: false },
      
      { patterns: ['easily distracted', 'gets distracted', 'distracted by', 'can\'t concentrate', 'attention wanders', 'mind elsewhere'], field: 'easilyDistracted', positive: true },
      { patterns: ['not easily distracted', 'stays focused', 'not distracted', 'good concentration'], field: 'easilyDistracted', positive: false },
      
      { patterns: ['doesn\'t finish', 'trouble finishing', 'gives up', 'starts but doesn\'t complete', 'leaves things unfinished', 'quits halfway'], field: 'difficultyFinishingTasks', positive: true },
      { patterns: ['finishes tasks', 'completes work', 'follows through', 'sees things through'], field: 'difficultyFinishingTasks', positive: false },
      
      { patterns: ['forgets things', 'forgetful', 'can\'t remember', 'loses track', 'memory problems', 'forgets homework', 'forgets chores'], field: 'forgetfulInDailyActivities', positive: true },
      { patterns: ['remembers well', 'good memory', 'doesn\'t forget', 'remembers tasks'], field: 'forgetfulInDailyActivities', positive: false },
      
      { patterns: ['loses things', 'can\'t find', 'misplaces', 'always losing', 'loses homework', 'loses toys', 'loses backpack'], field: 'losesThingsFrequently', positive: true },
      { patterns: ['keeps track', 'doesn\'t lose', 'organized with belongings', 'takes care of things'], field: 'losesThingsFrequently', positive: false },
      
      // === HYPERACTIVITY & IMPULSIVITY ===
      { patterns: ['fidgets', 'squirms', 'can\'t sit still', 'always moving hands', 'restless', 'wiggles', 'taps fingers'], field: 'fidgetsOrSquirms', positive: true },
      { patterns: ['sits still', 'calm hands', 'doesn\'t fidget', 'stays calm'], field: 'fidgetsOrSquirms', positive: false },
      
      { patterns: ['gets up', 'leaves seat', 'won\'t stay seated', 'stands up', 'out of seat', 'wanders around'], field: 'difficultyStayingSeated', positive: true },
      { patterns: ['stays seated', 'sits well', 'remains in seat', 'stays put'], field: 'difficultyStayingSeated', positive: false },
      
      { patterns: ['talks too much', 'non-stop talking', 'excessive talking', 'talks constantly', 'never stops talking', 'chatters endlessly'], field: 'talksExcessively', positive: true },
      { patterns: ['talks appropriately', 'good conversation', 'doesn\'t talk too much', 'quiet'], field: 'talksExcessively', positive: false },
      
      // === EMOTIONAL REGULATION ===
      { patterns: ['meltdowns', 'tantrums', 'explosive', 'can\'t control emotions', 'emotional outbursts', 'rages', 'loses it'], field: 'frequentMeltdowns', positive: true },
      { patterns: ['calm', 'good emotional control', 'handles emotions well', 'emotionally stable'], field: 'frequentMeltdowns', positive: false },
      
      { patterns: ['always angry', 'mad all the time', 'angry child', 'rage', 'irritable', 'quick to anger', 'bad temper'], field: 'chronicAngerIrritability', positive: true },
      { patterns: ['not angry', 'happy child', 'pleasant mood', 'calm temperament', 'even-tempered'], field: 'chronicAngerIrritability', positive: false },
      
      { patterns: ['argues constantly', 'defiant', 'oppositional', 'fights everything', 'won\'t follow rules', 'refuses to listen'], field: 'argumentativeDefiantBehavior', positive: true },
      { patterns: ['compliant', 'doesn\'t argue', 'cooperative', 'follows rules', 'listens well'], field: 'argumentativeDefiantBehavior', positive: false },
      
      // === SOCIAL COMMUNICATION ===
      { patterns: ['doesn\'t make eye contact', 'avoids eye contact', 'won\'t look at me', 'looks away'], field: 'poorEyeContact', positive: true },
      { patterns: ['good eye contact', 'looks at me', 'maintains eye contact'], field: 'poorEyeContact', positive: false },
      
      { patterns: ['doesn\'t share', 'won\'t share toys', 'possessive', 'hoards things'], field: 'failureToShareEnjoyment', positive: true },
      { patterns: ['shares well', 'likes to share', 'generous with toys'], field: 'failureToShareEnjoyment', positive: false },
      
      // === SENSORY PROCESSING ===
      { patterns: ['sensitive to noise', 'covers ears', 'hates loud sounds', 'bothered by noise'], field: 'auditoryHypersensitivity', positive: true },
      { patterns: ['not bothered by noise', 'handles loud sounds', 'enjoys music'], field: 'auditoryHypersensitivity', positive: false },
      
      { patterns: ['picky eater', 'won\'t try new foods', 'texture issues', 'gags on food'], field: 'sensoryFoodAversions', positive: true },
      { patterns: ['eats everything', 'not picky', 'tries new foods'], field: 'sensoryFoodAversions', positive: false }
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

  // Get child context for AI responses - ALWAYS include existing profiles
  async getChildContext(userId: string): Promise<string> {
    const profiles = await localStorage.getChildProfiles(userId);
    
    if (profiles.length === 0) {
      return ""; // Return empty string so Senali doesn't mention "new conversation"
    }
    
    let context = `IMPORTANT FAMILY CONTEXT - Remember these family members from previous conversations:\n\n**CRITICAL: These family members are real and exist. Use their names when talking. Ask about them specifically. Never act like this is a new conversation or ask for their names again.**\n\n`;
    
    for (let index = 0; index < profiles.length; index++) {
      const profile = profiles[index];
      const relationshipType = profile.relationshipToUser === 'child' ? 'Child' : 
                              profile.relationshipToUser === 'spouse' ? 'Spouse' : 
                              profile.relationshipToUser === 'self' ? 'User' : 'Family Member';
      
      context += `${index + 1}. ${profile.childName} (${relationshipType}):\n`;
      
      if (profile.age) context += `   Age: ${profile.age}\n`;
      if (profile.height) context += `   Height: ${profile.height}\n`;
      if (profile.gender && profile.gender !== 'prefer_not_to_say') context += `   Gender: ${profile.gender}\n`;
      if (profile.workInfo) context += `   Work: ${profile.workInfo}\n`;
      
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
    
    context += `\n\n**CRITICAL: These family members are real and exist. Use their names when talking. Ask about them specifically. Never act like this is a new conversation or ask for their names again.**`;
    
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