import { Router } from 'express';
import { assessmentProcessor } from '../services/assessment-processor';

const router = Router();

// Get assessment summary for a specific child
router.get('/child/:childName/summary', async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const { childName } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const summary = await assessmentProcessor.getAssessmentSummary(userId, childName);
    
    if (!summary) {
      return res.status(404).json({ error: 'Child profile not found' });
    }

    res.json(summary);
  } catch (error) {
    console.error('Assessment summary error:', error);
    res.status(500).json({ error: 'Failed to get assessment summary' });
  }
});

// Generate assessment insights based on collected data
router.get('/child/:childName/insights', async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const { childName } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const summary = await assessmentProcessor.getAssessmentSummary(userId, childName);
    
    if (!summary) {
      return res.status(404).json({ error: 'Child profile not found' });
    }

    // Generate insights based on assessment data
    const insights = generateAssessmentInsights(summary);
    
    res.json(insights);
  } catch (error) {
    console.error('Assessment insights error:', error);
    res.status(500).json({ error: 'Failed to generate assessment insights' });
  }
});

// Helper function to generate insights from assessment data
function generateAssessmentInsights(summary: any) {
  const insights = {
    adhd: {
      inattentionScore: 0,
      hyperactivityScore: 0,
      likelihood: 'insufficient_data',
      keyIndicators: [] as string[],
      recommendations: [] as string[]
    },
    autism: {
      socialCommunicationConcerns: 0,
      restrictedBehaviorsConcerns: 0,
      likelihood: 'insufficient_data',
      keyIndicators: [] as string[],
      recommendations: [] as string[]
    },
    odd: {
      totalScore: 0,
      likelihood: 'insufficient_data',
      keyIndicators: [] as string[],
      recommendations: [] as string[]
    },
    generalRecommendations: [] as string[]
  };

  if (summary.adhd) {
    // Calculate ADHD scores
    const inattentionSymptoms = [
      summary.adhd.failsToPayAttention,
      summary.adhd.difficultyMaintainingAttention,
      summary.adhd.doesNotListenWhenSpokenTo,
      summary.adhd.doesNotFollowInstructions,
      summary.adhd.difficultyOrganizingTasks,
      summary.adhd.avoidsTasksRequiringMentalEffort,
      summary.adhd.losesThings,
      summary.adhd.easilyDistracted,
      summary.adhd.forgetfulInDailyActivities
    ];

    const hyperactivitySymptoms = [
      summary.adhd.fidgetsWithHandsOrFeet,
      summary.adhd.leavesSeatsInClassroom,
      summary.adhd.runsOrClimbsExcessively,
      summary.adhd.difficultyPlayingQuietly,
      summary.adhd.onTheGoOrDrivenByMotor,
      summary.adhd.talksExcessively,
      summary.adhd.blurtsOutAnswers,
      summary.adhd.difficultyWaitingTurn,
      summary.adhd.interruptsOrIntrudes
    ];

    insights.adhd.inattentionScore = countSymptoms(inattentionSymptoms, ['often', 'very_often']);
    insights.adhd.hyperactivityScore = countSymptoms(hyperactivitySymptoms, ['often', 'very_often']);

    // Determine ADHD likelihood
    if (insights.adhd.inattentionScore >= 6 || insights.adhd.hyperactivityScore >= 6) {
      insights.adhd.likelihood = 'high';
      insights.adhd.recommendations.push('Consider professional ADHD evaluation');
      insights.adhd.recommendations.push('Discuss findings with pediatrician or child psychologist');
    } else if (insights.adhd.inattentionScore >= 4 || insights.adhd.hyperactivityScore >= 4) {
      insights.adhd.likelihood = 'moderate';
      insights.adhd.recommendations.push('Monitor symptoms and consider evaluation if they persist');
    } else if (insights.adhd.inattentionScore > 0 || insights.adhd.hyperactivityScore > 0) {
      insights.adhd.likelihood = 'low';
    }
  }

  if (summary.autism) {
    // Calculate autism concerns
    const socialCommunicationAreas = [
      summary.autism.socialEmotionalReciprocity,
      summary.autism.nonverbalCommunication,
      summary.autism.developingMaintainingRelationships
    ];

    const restrictedBehaviorAreas = [
      summary.autism.stereotypedRepetitiveMotor,
      summary.autism.insistenceOnSameness,
      summary.autism.restrictedFixatedInterests,
      summary.autism.sensoryReactivity
    ];

    insights.autism.socialCommunicationConcerns = countSymptoms(socialCommunicationAreas, ['mild', 'moderate', 'severe']);
    insights.autism.restrictedBehaviorsConcerns = countSymptoms(restrictedBehaviorAreas, ['mild', 'moderate', 'severe']);

    // Determine autism likelihood (all 3 social + 2 of 4 restricted behaviors needed)
    if (insights.autism.socialCommunicationConcerns === 3 && insights.autism.restrictedBehaviorsConcerns >= 2) {
      insights.autism.likelihood = 'high';
      insights.autism.recommendations.push('Consider professional autism evaluation');
      insights.autism.recommendations.push('Contact developmental pediatrician or autism specialist');
    } else if (insights.autism.socialCommunicationConcerns >= 2 || insights.autism.restrictedBehaviorsConcerns >= 2) {
      insights.autism.likelihood = 'moderate';
      insights.autism.recommendations.push('Monitor development and consider evaluation');
    }
  }

  if (summary.odd) {
    // Calculate ODD score
    const oddSymptoms = [
      summary.odd.oftenLosesTemper,
      summary.odd.touchyOrEasilyAnnoyed,
      summary.odd.angryAndResentful,
      summary.odd.arguesWithAuthority,
      summary.odd.activelyDefiesRules,
      summary.odd.deliberatelyAnnoys,
      summary.odd.blamesOthers,
      summary.odd.spitefulOrVindictive
    ];

    insights.odd.totalScore = countSymptoms(oddSymptoms, ['often', 'very_often']);

    if (insights.odd.totalScore >= 4) {
      insights.odd.likelihood = 'high';
      insights.odd.recommendations.push('Consider professional evaluation for oppositional defiant disorder');
    } else if (insights.odd.totalScore >= 2) {
      insights.odd.likelihood = 'moderate';
      insights.odd.recommendations.push('Monitor behavioral patterns');
    }
  }

  // General recommendations
  insights.generalRecommendations.push('Keep detailed records of behaviors and symptoms');
  insights.generalRecommendations.push('Share these observations with healthcare providers');
  insights.generalRecommendations.push('Consider behavioral strategies and environmental modifications');

  return insights;
}

// Helper function to count symptoms at certain severity levels
function countSymptoms(symptoms: (string | null)[], targetLevels: string[]): number {
  return symptoms.filter(symptom => 
    symptom && targetLevels.includes(symptom)
  ).length;
}

export default router;