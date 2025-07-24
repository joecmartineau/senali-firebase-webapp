// Guided family discovery system for the first 10 messages
// Focuses on learning family member names, ages, and relationships

export interface FamilyDiscoveryState {
  messageCount: number;
  discoveredMembers: Array<{
    name: string;
    age?: number;
    relationship: 'self' | 'spouse' | 'child' | 'other';
    discovered: boolean;
  }>;
  isDiscoveryComplete: boolean;
}

export const getFamilyDiscoveryPrompt = (messageCount: number, existingProfiles: any[]): string => {
  const basePrompt = `You are Senali, a warm and empathetic AI companion specializing in family support. Your primary goal for the first 10 messages is to discover who is in the user's immediate family.

CRITICAL GUIDELINES:
- Use 7th grade reading level language with contractions (I'll, you're, that's, etc.)
- Ask ONE simple question at a time
- Be naturally conversational and warm
- Focus ONLY on family member discovery for messages 1-10
- Create profiles automatically as you learn names

DISCOVERY PRIORITIES (Messages 1-10):
1. Who they are (parent/caregiver role)
2. Names and ages of children
3. Spouse/partner name and basic info
4. Any other family members living with them

CURRENT STATUS: Message ${messageCount}/10 for family discovery`;

  if (messageCount === 1) {
    return `${basePrompt}

START WITH: "Hi! I'm Senali, and I'm here to support you and your family. I'd love to get to know your family better. Can you tell me a bit about yourself - are you a parent or caregiver?"`;
  }

  if (messageCount <= 3) {
    return `${basePrompt}

FOCUS: Learn about their children first - this is usually the primary concern.
- Ask for children's names and ages
- Use warm, encouraging language
- Example: "That's wonderful! Can you tell me your children's names and how old they are?"`;
  }

  if (messageCount <= 6) {
    return `${basePrompt}

FOCUS: Learn about spouse/partner and household members
- Ask about their spouse/partner
- Keep it simple and respectful
- Example: "Do you have a spouse or partner who helps with the kids?"`;
  }

  if (messageCount <= 10) {
    return `${basePrompt}

FOCUS: Complete the family picture
- Ask about any other family members in the household
- Confirm ages and relationships
- Prepare to transition to assessment guidance
- Example: "Anyone else living with you that I should know about? Grandparents, other relatives?"`;
  }

  // After message 10, transition to assessment guidance
  return `${basePrompt}

FAMILY DISCOVERY COMPLETE! Now guide them to complete assessments:

"Great! I've got a good picture of your family. I see you have [family summary]. 

To give you the best support, I'd love for you to fill out some quick assessments for each family member. These are based on real diagnostic tools and will help me understand everyone's unique needs.

Click the 'Family' button to see everyone's profiles and start the assessments. They only take a few minutes and will help me give you much better advice!"

Then continue with normal therapeutic conversation while encouraging assessment completion.`;
};

export const shouldCreateProfile = (message: string, existingNames: string[]): boolean => {
  // Check for explicit profile creation requests
  const explicitPatterns = [
    /create (?:a )?profile for (\w+)/gi,
    /add (\w+) to (?:the )?family/gi,
    /make (?:a )?profile for (\w+)/gi
  ];

  for (const pattern of explicitPatterns) {
    let match;
    while ((match = pattern.exec(message)) !== null) {
      const name = match[1];
      if (name && name.length > 2 && !existingNames.includes(name)) {
        return true;
      }
    }
  }

  // Extract potential names from family context (only in first 10 messages)
  const namePatterns = [
    /my (?:son|daughter|child|kid|boy|girl) (?:is )?(\w+)/gi,
    /(\w+) is my (?:son|daughter|child|kid|boy|girl)/gi,
    /my (?:wife|husband|spouse|partner) (?:is )?(\w+)/gi,
    /(\w+) is my (?:wife|husband|spouse|partner)/gi,
    /I'm (\w+)/gi,
    /call me (\w+)/gi,
    /my name is (\w+)/gi
  ];

  for (const pattern of namePatterns) {
    let match;
    while ((match = pattern.exec(message)) !== null) {
      const name = match[1];
      if (name && name.length > 2 && !existingNames.includes(name)) {
        return true;
      }
    }
  }

  return false;
};

export const extractFamilyMembers = (message: string): Array<{
  name: string;
  age?: number;
  relationship: 'self' | 'spouse' | 'child' | 'other';
}> => {
  const members: Array<{
    name: string;
    age?: number;
    relationship: 'self' | 'spouse' | 'child' | 'other';
  }> = [];
  
  console.log('🔍 Starting family extraction from:', message);

  // Helper function to add member if not duplicate
  const addMember = (name: string, relationship: 'self' | 'spouse' | 'child' | 'other', age?: number) => {
    if (name && name.length > 2 && !members.some(m => m.name === name && m.relationship === relationship)) {
      const skipWords = ['and', 'or', 'also', 'but', 'the', 'are', 'is', 'who', 'old', 'years', 'year', 'have', 'kids', 'children', 'name', 'my', 'wife', 'husband'];
      if (!skipWords.includes(name.toLowerCase())) {
        members.push({ name, age, relationship });
        console.log(`✅ Added ${relationship}: ${name}${age ? ` (age ${age})` : ''}`);
      }
    }
  };

  // Helper function to extract matches from pattern
  const extractMatches = (pattern: RegExp, relationship: 'self' | 'spouse' | 'child' | 'other', ageIndex?: number) => {
    let match;
    while ((match = pattern.exec(message)) !== null) {
      if (match[1]) {
        const age = ageIndex && match[ageIndex] ? parseInt(match[ageIndex]) : undefined;
        if (!ageIndex || !age || (age > 0 && age < 100)) {
          addMember(match[1], relationship, age);
        }
      }
      if (match[2] && relationship === 'child' && !ageIndex) {
        addMember(match[2], relationship);
      }
    }
  };

  // 1. Extract self - "My name is Joe" or "I'm Joe"
  extractMatches(/my name is (\w+)/gi, 'self');
  extractMatches(/I'm (\w+)/gi, 'self');
  extractMatches(/call me (\w+)/gi, 'self');

  // 2. Extract spouse - "My wife's name is Kessi"
  extractMatches(/my (?:wife|husband|spouse|partner)(?:'s name)? is (\w+)/gi, 'spouse');
  extractMatches(/(\w+) is my (?:wife|husband|spouse|partner)/gi, 'spouse');

  // 3. Extract children with ages - "Sam is 12", "Noah is 5"
  extractMatches(/(\w+) is (\d+)/gi, 'child', 2);
  extractMatches(/(\w+) who is (\d+)/gi, 'child', 2);
  extractMatches(/(\w+),? (\d+) years? old/gi, 'child', 2);

  // 4. Extract multiple children - "Sam and Noah are boys"
  extractMatches(/(\w+) and (\w+) are (?:boys|girls|kids|children)/gi, 'child');

  // 5. Extract baby/pregnancy - "baby girl Elizabeth"
  extractMatches(/(?:baby|our) (?:girl|boy) (\w+)/gi, 'child');
  extractMatches(/(?:have|expecting) (?:a|our) (?:baby|child) (?:girl|boy) (?:named )?(\w+)/gi, 'child');

  // 6. Extract from "We have 3 kids. Sam and Noah..."
  if (message.includes('kids') || message.includes('children')) {
    extractMatches(/(?:kids|children)[^.!?]*?(\w+)(?:\s+and\s+(\w+))?/gi, 'child');
  }

  // 7. Explicit profile creation requests
  extractMatches(/create (?:a )?profile for (\w+)/gi, 'other');
  extractMatches(/add (\w+) to (?:the )?family/gi, 'other');
  extractMatches(/make (?:a )?profile for (\w+)/gi, 'other');

  console.log('🔍 Final extraction results:', members);
  return members;
};