// Enhanced pattern matching for extracting family information without API costs
// This handles complex natural language patterns locally

export interface ExtractionResult {
  ages: Record<string, number>;
  grades: Record<string, string>;
  schools: Record<string, string>;
  activities: Record<string, string[]>;
  diagnoses: Record<string, string[]>;
  symptoms: Record<string, Record<string, boolean>>;
  relationships: Record<string, string>;
}

export class EnhancedPatternMatcher {
  
  // Extract comprehensive family information from a single message
  extractFamilyInfo(message: string, existingNames: string[] = []): ExtractionResult {
    const result: ExtractionResult = {
      ages: {},
      grades: {},
      schools: {},
      activities: {},
      diagnoses: {},
      symptoms: {},
      relationships: {}
    };

    // Get all names mentioned (existing + new)
    const allNames = [...existingNames, ...this.extractNewNames(message)];
    
    // Process each name for comprehensive info
    for (const name of allNames) {
      this.extractPersonInfo(message, name, result);
    }

    return result;
  }

  // Extract new names not in existing list
  private extractNewNames(message: string): string[] {
    const newNames: string[] = [];
    
    // Patterns for child names
    const childPatterns = [
      /my (?:son|daughter|child|kid) (\w+)/gi,
      /(\w+) is (?:my )?(?:\d+|in|at)/gi,
      /(\w+) (?:goes to|attends|is in)/gi,
      /(\w+) (?:has|is diagnosed|struggles)/gi
    ];

    // Patterns for adult names  
    const adultPatterns = [
      /my (?:wife|husband|spouse|partner) (\w+)/gi,
      /(\w+) (?:works at|is a|teaches)/gi
    ];

    const allPatterns = [...childPatterns, ...adultPatterns];
    
    for (const pattern of allPatterns) {
      let match;
      while ((match = pattern.exec(message)) !== null) {
        const name = match[1];
        if (name && name.length > 2 && !this.isCommonWord(name)) {
          newNames.push(name);
        }
      }
    }

    return [...new Set(newNames)]; // Remove duplicates
  }

  // Extract comprehensive information for a specific person
  private extractPersonInfo(message: string, name: string, result: ExtractionResult): void {
    const lowerMessage = message.toLowerCase();
    const lowerName = name.toLowerCase();

    // Age extraction with multiple patterns
    const agePatterns = [
      new RegExp(`${name}\\s+(?:is|who is)\\s+(\\d+)\\s*(?:years?\\s*old)?`, 'i'),
      new RegExp(`${name}\\s+is\\s+(\\d+)(?=\\s*(?:and|,|\\.|$))`, 'i'),
      new RegExp(`(\\d+)\\s*year[s]?[\\s-]*old\\s+${name}`, 'i'),
      new RegExp(`${name}.*?age\\s+(\\d+)`, 'i')
    ];

    for (const pattern of agePatterns) {
      const match = message.match(pattern);
      if (match) {
        const age = parseInt(match[1]);
        if (age > 0 && age < 100) {
          result.ages[name] = age;
          break;
        }
      }
    }

    // Grade extraction
    const gradePatterns = [
      new RegExp(`${name}\\s+(?:is in|in)\\s+(\\d+)(?:st|nd|rd|th)?\\s*grade`, 'i'),
      new RegExp(`${name}\\s+(?:is a|is in)\\s+(kindergarten|pre-?k|preschool)`, 'i'),
      new RegExp(`(\\d+)(?:st|nd|rd|th)\\s+grade.*?${name}`, 'i')
    ];

    for (const pattern of gradePatterns) {
      const match = message.match(pattern);
      if (match) {
        result.grades[name] = match[1];
        break;
      }
    }

    // School extraction
    const schoolPatterns = [
      new RegExp(`${name}\\s+(?:goes to|attends|is at)\\s+([\\w\\s]+?)(?:\\s+(?:school|elementary|middle|high)|\\.|,|$)`, 'i'),
      new RegExp(`at\\s+([\\w\\s]+?)\\s+(?:school|elementary).*?${name}`, 'i')
    ];

    for (const pattern of schoolPatterns) {
      const match = message.match(pattern);
      if (match) {
        result.schools[name] = match[1].trim();
        break;
      }
    }

    // Activity extraction
    const activityPatterns = [
      new RegExp(`${name}\\s+(?:plays|does|is in|takes)\\s+([\\w\\s,]+?)(?:\\.|,|and|$)`, 'i'),
      new RegExp(`${name}.*?(?:loves|enjoys|good at)\\s+([\\w\\s,]+?)(?:\\.|,|$)`, 'i')
    ];

    for (const pattern of activityPatterns) {
      const match = message.match(pattern);
      if (match) {
        const activities = match[1].split(/,|and/).map(a => a.trim()).filter(a => a);
        if (activities.length > 0) {
          result.activities[name] = activities;
          break;
        }
      }
    }

    // Diagnosis extraction
    const diagnosisMap = {
      'adhd': ['diagnosed with adhd', 'has adhd', 'adhd diagnosis'],
      'autism': ['diagnosed with autism', 'has autism', 'on the spectrum', 'asd'],
      'anxiety': ['anxiety disorder', 'has anxiety', 'anxious'],
      'odd': ['oppositional defiant', 'odd diagnosis']
    };

    const diagnoses: string[] = [];
    for (const [condition, patterns] of Object.entries(diagnosisMap)) {
      if (patterns.some(pattern => lowerMessage.includes(pattern) && lowerMessage.includes(lowerName))) {
        diagnoses.push(condition.toUpperCase());
      }
    }
    
    if (diagnoses.length > 0) {
      result.diagnoses[name] = diagnoses;
    }

    // Relationship extraction
    if (lowerMessage.includes(`my son ${lowerName}`) || lowerMessage.includes(`${lowerName} is my son`)) {
      result.relationships[name] = 'son';
    } else if (lowerMessage.includes(`my daughter ${lowerName}`) || lowerMessage.includes(`${lowerName} is my daughter`)) {
      result.relationships[name] = 'daughter';
    } else if (lowerMessage.includes(`my husband ${lowerName}`) || lowerMessage.includes(`my wife ${lowerName}`)) {
      result.relationships[name] = 'spouse';
    }
  }

  // Check if a word is too common to be a name
  private isCommonWord(word: string): boolean {
    const commonWords = [
      'the', 'and', 'but', 'for', 'are', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use',
      'senali', 'chat', 'app', 'years', 'year', 'age', 'goes', 'school', 'grade', 'class'
    ];
    return commonWords.includes(word.toLowerCase());
  }
}

export const enhancedPatternMatcher = new EnhancedPatternMatcher();