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
  // Extract potential names from the message
  const namePatterns = [
    /my (?:son|daughter|child|kid|boy|girl) (\w+)/gi,
    /(\w+) is (?:my |our )?(?:\d+|in|at)/gi,
    /(\w+) (?:goes to|attends|is in)/gi,
    /my (?:wife|husband|spouse|partner) (\w+)/gi,
    /I'm (\w+)/gi,
    /call me (\w+)/gi
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

  // Child patterns
  const childPatterns = [
    /my (?:son|daughter|child|kid|boy|girl) (\w+).*?(?:is |'s )?(\d+)/gi,
    /(\w+) is (?:my )?(?:\d+|(\d+) years? old)/gi
  ];

  // Spouse patterns
  const spousePatterns = [
    /my (?:wife|husband|spouse|partner) (\w+)/gi,
    /(\w+) (?:is my|and I|my husband|my wife)/gi
  ];

  // Self patterns
  const selfPatterns = [
    /I'm (\w+)/gi,
    /call me (\w+)/gi
  ];

  // Extract children
  for (const pattern of childPatterns) {
    let match;
    while ((match = pattern.exec(message)) !== null) {
      const name = match[1];
      const age = match[2] ? parseInt(match[2]) : undefined;
      if (name && name.length > 2) {
        members.push({ name, age, relationship: 'child' });
      }
    }
  }

  // Extract spouse
  for (const pattern of spousePatterns) {
    let match;
    while ((match = pattern.exec(message)) !== null) {
      const name = match[1];
      if (name && name.length > 2) {
        members.push({ name, relationship: 'spouse' });
      }
    }
  }

  // Extract self
  for (const pattern of selfPatterns) {
    let match;
    while ((match = pattern.exec(message)) !== null) {
      const name = match[1];
      if (name && name.length > 2) {
        members.push({ name, relationship: 'self' });
      }
    }
  }

  return members;
};