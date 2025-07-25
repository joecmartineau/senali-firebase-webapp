// Real diagnostic criteria based on DSM-5 and validated assessment tools
// Written at 7th grade reading level for accessibility

export interface DiagnosticQuestion {
  id: string;
  text: string;
  category: 'adhd_inattentive' | 'adhd_hyperactive' | 'autism_social' | 'autism_repetitive' | 'anxiety' | 'sensory' | 'executive_function';
  weight: number; // How important this question is for diagnosis
}

export interface DiagnosticResult {
  condition: string;
  probability: 'low' | 'moderate' | 'high';
  description: string;
  recommendedActions: string[];
}

// ADHD Attention Questions (written at 7th grade reading level)
export const adhdInattentiveQuestions: DiagnosticQuestion[] = [
  {
    id: 'adhd_1',
    text: 'Makes silly mistakes on homework or tests because they rush through it',
    category: 'adhd_inattentive',
    weight: 1
  },
  {
    id: 'adhd_2', 
    text: 'Has a hard time paying attention to schoolwork, games, or activities',
    category: 'adhd_inattentive',
    weight: 1
  },
  {
    id: 'adhd_3',
    text: 'Seems like they are not listening when you talk directly to them',
    category: 'adhd_inattentive',
    weight: 1
  },
  {
    id: 'adhd_4',
    text: 'Starts homework or chores but does not finish them',
    category: 'adhd_inattentive',
    weight: 1
  },
  {
    id: 'adhd_5',
    text: 'Has trouble keeping their room, backpack, or desk organized',
    category: 'adhd_inattentive',
    weight: 1
  },
  {
    id: 'adhd_6',
    text: 'Avoids or complains about homework or tasks that need thinking',
    category: 'adhd_inattentive',
    weight: 1
  },
  {
    id: 'adhd_7',
    text: 'Loses important things like homework, pencils, toys, or books',
    category: 'adhd_inattentive',
    weight: 1
  },
  {
    id: 'adhd_8',
    text: 'Gets distracted easily by sounds, people, or things around them',
    category: 'adhd_inattentive',
    weight: 1
  },
  {
    id: 'adhd_9',
    text: 'Forgets to do daily things like brushing teeth or bringing lunch',
    category: 'adhd_inattentive',
    weight: 1
  }
];

// ADHD Hyperactivity Questions (written at 7th grade reading level)
export const adhdHyperactiveQuestions: DiagnosticQuestion[] = [
  {
    id: 'adhd_h1',
    text: 'Fidgets with their hands or feet, or wiggles around in their chair',
    category: 'adhd_hyperactive',
    weight: 1
  },
  {
    id: 'adhd_h2',
    text: 'Gets up from their seat when they should stay sitting',
    category: 'adhd_hyperactive',
    weight: 1
  },
  {
    id: 'adhd_h3',
    text: 'Runs around or climbs on things when they should not',
    category: 'adhd_hyperactive',
    weight: 1
  },
  {
    id: 'adhd_h4',
    text: 'Has trouble playing games or doing fun activities quietly',
    category: 'adhd_hyperactive',
    weight: 1
  },
  {
    id: 'adhd_h5',
    text: 'Always seems to be moving or acts like they have lots of energy',
    category: 'adhd_hyperactive',
    weight: 1
  },
  {
    id: 'adhd_h6',
    text: 'Talks a lot more than other kids their age',
    category: 'adhd_hyperactive',
    weight: 1
  },
  {
    id: 'adhd_h7',
    text: 'Gives answers before you finish asking the question',
    category: 'adhd_hyperactive',
    weight: 1
  },
  {
    id: 'adhd_h8',
    text: 'Has trouble waiting in line or waiting for their turn',
    category: 'adhd_hyperactive',
    weight: 1
  },
  {
    id: 'adhd_h9',
    text: 'Interrupts others when they are talking or playing',
    category: 'adhd_hyperactive',
    weight: 1
  }
];

// Autism Social Questions (written at 7th grade reading level)
export const autismSocialQuestions: DiagnosticQuestion[] = [
  {
    id: 'autism_s1',
    text: 'Has trouble having back and forth conversations with others',
    category: 'autism_social',
    weight: 1
  },
  {
    id: 'autism_s2',
    text: 'Does not share their feelings or interests with other people',
    category: 'autism_social',
    weight: 1
  },
  {
    id: 'autism_s3',
    text: 'Does not look at people when talking or use hand gestures',
    category: 'autism_social',
    weight: 1
  },
  {
    id: 'autism_s4',
    text: 'Has trouble making friends or keeping friendships',
    category: 'autism_social',
    weight: 1
  },
  {
    id: 'autism_s5',
    text: 'Does not understand social rules or what other people are thinking',
    category: 'autism_social',
    weight: 1
  },
  {
    id: 'autism_s6',
    text: 'Prefers to play alone rather than with other children',
    category: 'autism_social',
    weight: 1
  }
];

// Autism Repetitive Behavior Questions (written at 7th grade reading level)
export const autismRepetitiveQuestions: DiagnosticQuestion[] = [
  {
    id: 'autism_r1',
    text: 'Does the same movements over and over, like hand flapping or rocking',
    category: 'autism_repetitive',
    weight: 1
  },
  {
    id: 'autism_r2',
    text: 'Gets very upset if their routine or schedule changes',
    category: 'autism_repetitive',
    weight: 1
  },
  {
    id: 'autism_r3',
    text: 'Has very strong interests in unusual things (like train schedules or vacuum cleaners)',
    category: 'autism_repetitive',
    weight: 1
  },
  {
    id: 'autism_r4',
    text: 'Is very sensitive to sounds, lights, textures, or smells',
    category: 'autism_repetitive',
    weight: 1
  },
  {
    id: 'autism_r5',
    text: 'Lines up toys or objects in specific ways and gets upset if moved',
    category: 'autism_repetitive',
    weight: 1
  },
  {
    id: 'autism_r6',
    text: 'Repeats words or phrases over and over (echolalia)',
    category: 'autism_repetitive',
    weight: 1
  }
];

// Anxiety and Emotional Questions (written at 7th grade reading level)
export const anxietyQuestions: DiagnosticQuestion[] = [
  {
    id: 'anxiety_1',
    text: 'Worries a lot about things that might happen',
    category: 'anxiety',
    weight: 1
  },
  {
    id: 'anxiety_2',
    text: 'Gets very nervous about going to school or new places',
    category: 'anxiety',
    weight: 1
  },
  {
    id: 'anxiety_3',
    text: 'Has trouble sleeping because they worry too much',
    category: 'anxiety',
    weight: 1
  },
  {
    id: 'anxiety_4',
    text: 'Gets headaches or stomach aches when worried',
    category: 'anxiety',
    weight: 1
  },
  {
    id: 'anxiety_5',
    text: 'Avoids activities because they are scared something bad will happen',
    category: 'anxiety',
    weight: 1
  }
];

// Sensory Processing Questions (written at 7th grade reading level)
export const sensoryQuestions: DiagnosticQuestion[] = [
  {
    id: 'sensory_1',
    text: 'Gets upset by loud noises that do not bother other people',
    category: 'sensory',
    weight: 1
  },
  {
    id: 'sensory_2',
    text: 'Does not like certain textures of clothes or foods',
    category: 'sensory',
    weight: 1
  },
  {
    id: 'sensory_3',
    text: 'Seeks out spinning, swinging, or other movement activities',
    category: 'sensory',
    weight: 1
  },
  {
    id: 'sensory_4',
    text: 'Has trouble knowing where their body is in space (bumps into things)',
    category: 'sensory',
    weight: 1
  },
  {
    id: 'sensory_5',
    text: 'Covers ears or eyes when there are normal sounds or lights',
    category: 'sensory',
    weight: 1
  }
];

// Executive Function Questions (written at 7th grade reading level)
export const executiveFunctionQuestions: DiagnosticQuestion[] = [
  {
    id: 'exec_1',
    text: 'Has trouble switching from one activity to another',
    category: 'executive_function',
    weight: 1
  },
  {
    id: 'exec_2',
    text: 'Gets very upset when plans change unexpectedly',
    category: 'executive_function',
    weight: 1
  },
  {
    id: 'exec_3',
    text: 'Has trouble controlling their emotions when frustrated',
    category: 'executive_function',
    weight: 1
  },
  {
    id: 'exec_4',
    text: 'Needs lots of reminders to complete daily tasks',
    category: 'executive_function',
    weight: 1
  },
  {
    id: 'exec_5',
    text: 'Has trouble understanding time (always late or too early)',
    category: 'executive_function',
    weight: 1
  }
];

export const allDiagnosticQuestions = [
  ...adhdInattentiveQuestions,
  ...adhdHyperactiveQuestions, 
  ...autismSocialQuestions,
  ...autismRepetitiveQuestions,
  ...anxietyQuestions,
  ...sensoryQuestions,
  ...executiveFunctionQuestions
];

// Calculate diagnostic probabilities based on responses
export function calculateDiagnosticProbabilities(responses: Record<string, 'yes' | 'no' | 'unsure'>): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];
  
  // Count "yes" responses for each category
  const inattentiveYes = adhdInattentiveQuestions.filter(q => responses[q.id] === 'yes').length;
  const hyperactiveYes = adhdHyperactiveQuestions.filter(q => responses[q.id] === 'yes').length;
  const socialYes = autismSocialQuestions.filter(q => responses[q.id] === 'yes').length;
  const repetitiveYes = autismRepetitiveQuestions.filter(q => responses[q.id] === 'yes').length;
  const anxietyYes = anxietyQuestions.filter(q => responses[q.id] === 'yes').length;
  const sensoryYes = sensoryQuestions.filter(q => responses[q.id] === 'yes').length;
  const executiveYes = executiveFunctionQuestions.filter(q => responses[q.id] === 'yes').length;

  // ADHD Analysis (using DSM-5 criteria - 6+ symptoms needed)
  if (inattentiveYes >= 6 && hyperactiveYes >= 6) {
    results.push({
      condition: 'ADHD - Combined Type',
      probability: 'high',
      description: 'Shows both attention problems and hyperactivity. This is the most common type of ADHD.',
      recommendedActions: [
        'Talk to your child\'s doctor about ADHD testing',
        'Ask the school about support plans (IEP or 504 plan)',
        'Learn about ADHD strategies for home and school',
        'Consider joining an ADHD support group for parents'
      ]
    });
  } else if (inattentiveYes >= 6) {
    results.push({
      condition: 'ADHD - Mainly Inattentive Type',
      probability: 'high',
      description: 'Shows strong signs of attention problems. These children often seem quiet and dreamy.',
      recommendedActions: [
        'Talk to your child\'s doctor about ADHD testing',
        'Ask about classroom supports like extra time or reminders',
        'Help create organized systems at home',
        'Break big tasks into smaller steps'
      ]
    });
  } else if (hyperactiveYes >= 6) {
    results.push({
      condition: 'ADHD - Mainly Hyperactive Type',
      probability: 'high',
      description: 'Shows strong signs of hyperactivity and impulsivity. These children have trouble sitting still.',
      recommendedActions: [
        'Talk to your child\'s doctor about ADHD testing',
        'Give your child lots of chances to move and be active',
        'Practice waiting and taking turns',
        'Create clear rules and routines'
      ]
    });
  } else if (inattentiveYes >= 4 || hyperactiveYes >= 4) {
    results.push({
      condition: 'ADHD Traits',
      probability: 'moderate',
      description: 'Shows some ADHD signs but not enough for a diagnosis yet.',
      recommendedActions: [
        'Keep track of behaviors for a few months',
        'Talk to your child\'s teacher about what they see',
        'Try ADHD-friendly strategies at home',
        'Consider talking to your doctor if problems get worse'
      ]
    });
  }

  // Autism Analysis (using DSM-5 criteria)
  if (socialYes >= 3 && repetitiveYes >= 2) {
    results.push({
      condition: 'Autism Spectrum Disorder',
      probability: 'high',
      description: 'Shows signs in both social communication and repetitive behaviors, which are the main areas for autism.',
      recommendedActions: [
        'Talk to your child\'s doctor about autism testing',
        'Contact early intervention services if under 3 years old',
        'Look into speech and social skills therapy',
        'Learn about autism supports and accommodations'
      ]
    });
  } else if (socialYes >= 2 || repetitiveYes >= 2) {
    results.push({
      condition: 'Autism Spectrum Traits',
      probability: 'moderate',
      description: 'Shows some autism characteristics. More observation may be helpful.',
      recommendedActions: [
        'Watch how your child develops over the next few months',
        'Talk to your child\'s doctor about your concerns',
        'Consider social skills activities or groups',
        'Keep notes about social and communication behaviors'
      ]
    });
  }

  // Anxiety Analysis
  if (anxietyYes >= 4) {
    results.push({
      condition: 'Anxiety Disorder',
      probability: 'high',
      description: 'Shows strong signs of anxiety that may be affecting daily life and activities.',
      recommendedActions: [
        'Talk to your child\'s doctor about anxiety',
        'Learn calming strategies like deep breathing',
        'Create predictable routines to reduce worry',
        'Consider counseling or therapy for anxiety'
      ]
    });
  } else if (anxietyYes >= 2) {
    results.push({
      condition: 'Anxiety Concerns',
      probability: 'moderate',
      description: 'Shows some anxiety that may need attention and support.',
      recommendedActions: [
        'Practice relaxation techniques together',
        'Talk openly about worries and fears',
        'Keep a calm and supportive home environment',
        'Monitor if anxiety gets worse over time'
      ]
    });
  }

  // Sensory Processing Analysis
  if (sensoryYes >= 3) {
    results.push({
      condition: 'Sensory Processing Differences',
      probability: 'high',
      description: 'Shows strong signs of sensory processing challenges that may affect daily activities.',
      recommendedActions: [
        'Talk to an occupational therapist about sensory needs',
        'Create a sensory-friendly environment at home',
        'Learn about sensory breaks and calming activities',
        'Work with school to accommodate sensory needs'
      ]
    });
  } else if (sensoryYes >= 2) {
    results.push({
      condition: 'Some Sensory Sensitivities',
      probability: 'moderate',
      description: 'Shows some sensory sensitivities that may need accommodation.',
      recommendedActions: [
        'Notice what sounds, textures, or lights bother your child',
        'Make small changes to reduce sensory overload',
        'Teach your child to ask for sensory breaks',
        'Consider talking to an occupational therapist'
      ]
    });
  }

  // Executive Function Analysis
  if (executiveYes >= 4) {
    results.push({
      condition: 'Executive Function Challenges',
      probability: 'high',
      description: 'Shows significant challenges with planning, organization, and emotional control.',
      recommendedActions: [
        'Create visual schedules and reminders',
        'Break tasks into small, clear steps',
        'Teach problem-solving and coping strategies',
        'Work with school on executive function supports'
      ]
    });
  } else if (executiveYes >= 2) {
    results.push({
      condition: 'Some Executive Function Needs',
      probability: 'moderate',
      description: 'Shows some challenges with organization and planning that could use support.',
      recommendedActions: [
        'Use timers and visual reminders',
        'Practice planning and organization skills',
        'Help your child learn to recognize their emotions',
        'Create consistent routines and expectations'
      ]
    });
  }

  // If no significant patterns, provide general guidance
  if (results.length === 0) {
    results.push({
      condition: 'No Significant Concerns',
      probability: 'low',
      description: 'The questionnaire does not show strong patterns suggesting neurodevelopmental differences.',
      recommendedActions: [
        'Continue to support your child\'s development',
        'Keep communication open with teachers',
        'Trust your instincts - reach out if concerns develop',
        'Remember that every child develops at their own pace'
      ]
    });
  }

  return results;
}