// Real diagnostic criteria based on DSM-5 and validated assessment tools
// Written at 7th grade reading level for accessibility

export interface DiagnosticQuestion {
  id: string;
  text: string;
  category: 'adhd_inattentive' | 'adhd_hyperactive' | 'autism_social' | 'autism_repetitive' | 'anxiety' | 'depression';
  weight: number; // How important this question is for diagnosis
}

export interface DiagnosticResult {
  condition: string;
  probability: 'low' | 'moderate' | 'high';
  description: string;
  recommendedActions: string[];
}

// ADHD Inattentive Questions (DSM-5 based)
export const adhdInattentiveQuestions: DiagnosticQuestion[] = [
  {
    id: 'adhd_1',
    text: 'Often makes careless mistakes in schoolwork or other activities',
    category: 'adhd_inattentive',
    weight: 1
  },
  {
    id: 'adhd_2', 
    text: 'Often has trouble keeping attention on tasks or play',
    category: 'adhd_inattentive',
    weight: 1
  },
  {
    id: 'adhd_3',
    text: 'Often does not seem to listen when spoken to directly',
    category: 'adhd_inattentive',
    weight: 1
  },
  {
    id: 'adhd_4',
    text: 'Often does not follow through on instructions and fails to finish work',
    category: 'adhd_inattentive',
    weight: 1
  },
  {
    id: 'adhd_5',
    text: 'Often has trouble organizing tasks and activities',
    category: 'adhd_inattentive',
    weight: 1
  },
  {
    id: 'adhd_6',
    text: 'Often avoids or dislikes tasks that require mental effort',
    category: 'adhd_inattentive',
    weight: 1
  },
  {
    id: 'adhd_7',
    text: 'Often loses things needed for tasks (toys, pencils, books)',
    category: 'adhd_inattentive',
    weight: 1
  },
  {
    id: 'adhd_8',
    text: 'Is often easily distracted by outside things',
    category: 'adhd_inattentive',
    weight: 1
  },
  {
    id: 'adhd_9',
    text: 'Is often forgetful in daily activities',
    category: 'adhd_inattentive',
    weight: 1
  }
];

// ADHD Hyperactive-Impulsive Questions (DSM-5 based)
export const adhdHyperactiveQuestions: DiagnosticQuestion[] = [
  {
    id: 'adhd_h1',
    text: 'Often fidgets with hands or feet or squirms in seat',
    category: 'adhd_hyperactive',
    weight: 1
  },
  {
    id: 'adhd_h2',
    text: 'Often leaves seat when staying seated is expected',
    category: 'adhd_hyperactive',
    weight: 1
  },
  {
    id: 'adhd_h3',
    text: 'Often runs or climbs too much when it is not appropriate',
    category: 'adhd_hyperactive',
    weight: 1
  },
  {
    id: 'adhd_h4',
    text: 'Often has trouble playing or doing activities quietly',
    category: 'adhd_hyperactive',
    weight: 1
  },
  {
    id: 'adhd_h5',
    text: 'Is often "on the go" or acts as if "driven by a motor"',
    category: 'adhd_hyperactive',
    weight: 1
  },
  {
    id: 'adhd_h6',
    text: 'Often talks too much',
    category: 'adhd_hyperactive',
    weight: 1
  },
  {
    id: 'adhd_h7',
    text: 'Often blurts out answers before questions are finished',
    category: 'adhd_hyperactive',
    weight: 1
  },
  {
    id: 'adhd_h8',
    text: 'Often has trouble waiting for their turn',
    category: 'adhd_hyperactive',
    weight: 1
  },
  {
    id: 'adhd_h9',
    text: 'Often interrupts or intrudes on others',
    category: 'adhd_hyperactive',
    weight: 1
  }
];

// Autism Social Communication Questions (DSM-5 based)
export const autismSocialQuestions: DiagnosticQuestion[] = [
  {
    id: 'autism_s1',
    text: 'Has trouble with back-and-forth conversation',
    category: 'autism_social',
    weight: 1
  },
  {
    id: 'autism_s2',
    text: 'Has trouble sharing emotions or interests with others',
    category: 'autism_social',
    weight: 1
  },
  {
    id: 'autism_s3',
    text: 'Has trouble with nonverbal communication like eye contact or gestures',
    category: 'autism_social',
    weight: 1
  },
  {
    id: 'autism_s4',
    text: 'Has trouble making and keeping friendships',
    category: 'autism_social',
    weight: 1
  },
  {
    id: 'autism_s5',
    text: 'Has trouble understanding social situations',
    category: 'autism_social',
    weight: 1
  }
];

// Autism Repetitive Behaviors Questions (DSM-5 based)
export const autismRepetitiveQuestions: DiagnosticQuestion[] = [
  {
    id: 'autism_r1',
    text: 'Has repetitive motor movements or speech',
    category: 'autism_repetitive',
    weight: 1
  },
  {
    id: 'autism_r2',
    text: 'Insists on doing things the same way every time',
    category: 'autism_repetitive',
    weight: 1
  },
  {
    id: 'autism_r3',
    text: 'Has very focused interests that seem unusual',
    category: 'autism_repetitive',
    weight: 1
  },
  {
    id: 'autism_r4',
    text: 'Is over-sensitive or under-sensitive to sounds, touch, or other senses',
    category: 'autism_repetitive',
    weight: 1
  }
];

export const allDiagnosticQuestions = [
  ...adhdInattentiveQuestions,
  ...adhdHyperactiveQuestions, 
  ...autismSocialQuestions,
  ...autismRepetitiveQuestions
];

// Calculate diagnostic probabilities based on responses
export function calculateDiagnosticProbabilities(responses: Record<string, 'yes' | 'no' | 'unsure'>): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];
  
  // ADHD Inattentive Analysis
  const inattentiveYes = adhdInattentiveQuestions.filter(q => responses[q.id] === 'yes').length;
  const inattentiveTotal = adhdInattentiveQuestions.length;
  
  if (inattentiveYes >= 6) {
    results.push({
      condition: 'ADHD (Inattentive Type)',
      probability: 'high',
      description: 'Six or more inattentive symptoms present, meeting DSM-5 criteria',
      recommendedActions: ['Consult with pediatrician or child psychologist', 'Consider educational accommodations', 'Explore behavioral strategies']
    });
  } else if (inattentiveYes >= 4) {
    results.push({
      condition: 'ADHD (Inattentive Type)',
      probability: 'moderate', 
      description: 'Some inattentive symptoms present, below diagnostic threshold',
      recommendedActions: ['Monitor symptoms over time', 'Discuss with school counselor', 'Consider organizational support']
    });
  }
  
  // ADHD Hyperactive-Impulsive Analysis
  const hyperactiveYes = adhdHyperactiveQuestions.filter(q => responses[q.id] === 'yes').length;
  
  if (hyperactiveYes >= 6) {
    results.push({
      condition: 'ADHD (Hyperactive-Impulsive Type)',
      probability: 'high',
      description: 'Six or more hyperactive-impulsive symptoms present, meeting DSM-5 criteria',
      recommendedActions: ['Consult with pediatrician or child psychologist', 'Consider behavioral interventions', 'Explore physical activity outlets']
    });
  } else if (hyperactiveYes >= 4) {
    results.push({
      condition: 'ADHD (Hyperactive-Impulsive Type)',
      probability: 'moderate',
      description: 'Some hyperactive-impulsive symptoms present, below diagnostic threshold', 
      recommendedActions: ['Monitor symptoms over time', 'Increase physical activity', 'Practice calming strategies']
    });
  }
  
  // Combined ADHD
  if (inattentiveYes >= 6 && hyperactiveYes >= 6) {
    results.push({
      condition: 'ADHD (Combined Type)',
      probability: 'high',
      description: 'Both inattentive and hyperactive-impulsive criteria met',
      recommendedActions: ['Comprehensive evaluation recommended', 'Consider multimodal treatment approach', 'School-based interventions']
    });
  }
  
  // Autism Spectrum Analysis
  const socialYes = autismSocialQuestions.filter(q => responses[q.id] === 'yes').length;
  const repetitiveYes = autismRepetitiveQuestions.filter(q => responses[q.id] === 'yes').length;
  
  if (socialYes >= 3 && repetitiveYes >= 2) {
    results.push({
      condition: 'Autism Spectrum Disorder',
      probability: 'high',
      description: 'Multiple social communication and repetitive behavior criteria met',
      recommendedActions: ['Comprehensive autism evaluation recommended', 'Early intervention services', 'Social skills support']
    });
  } else if (socialYes >= 2 || repetitiveYes >= 2) {
    results.push({
      condition: 'Autism Spectrum Disorder',
      probability: 'moderate',
      description: 'Some autism spectrum characteristics present',
      recommendedActions: ['Monitor development over time', 'Consider social skills support', 'Discuss with pediatrician']
    });
  }
  
  return results;
}