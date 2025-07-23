import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Categories for tips
const TIP_CATEGORIES = ['adhd', 'autism', 'general', 'behavioral', 'educational', 'social'] as const;
const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

// System prompt for generating daily tips
const TIP_GENERATION_PROMPT = `You are Senali, an expert in neurodivergent parenting support. Generate a practical, actionable daily tip for parents of neurodivergent children.

The tip should be:
- Evidence-based and scientifically sound
- Practical and implementable in daily life
- Specific and actionable (not vague advice)
- Appropriate for the specified age range and concerns
- Positive and strengths-focused
- Realistic for busy parents

Format your response as a JSON object with these fields:
{
  "title": "Concise, engaging title (max 50 chars)",
  "content": "Detailed explanation with specific steps (200-400 words)",
  "category": "one of: adhd, autism, general, behavioral, educational, social",
  "targetAge": "age range like '3-6', '7-12', '13-18', or 'all ages'",
  "difficulty": "one of: beginner, intermediate, advanced",
  "estimatedTime": "time estimate like '5 minutes', '15-30 minutes'",
  "tags": ["array", "of", "relevant", "keywords"]
}

Make the content warm, supportive, and practical. Include specific examples when helpful.`;

interface TipPreferences {
  childAge?: number;
  primaryConcerns?: string[];
  preferredCategories?: string[];
}

// POST /api/tips/generate - Generate a new daily tip
router.post('/generate', async (req, res) => {
  try {
    const { userId, preferences = {} } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Build context based on user preferences
    let contextPrompt = TIP_GENERATION_PROMPT;
    
    if (preferences.childAge) {
      const ageRange = getAgeRange(preferences.childAge);
      contextPrompt += `\n\nTarget age range: ${ageRange}`;
    }

    if (preferences.primaryConcerns?.length > 0) {
      contextPrompt += `\n\nPrimary concerns: ${preferences.primaryConcerns.join(', ')}`;
    }

    if (preferences.preferredCategories?.length > 0) {
      contextPrompt += `\n\nPreferred categories: ${preferences.preferredCategories.join(', ')}`;
    }

    // Generate tip using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: contextPrompt },
        { role: 'user', content: 'Generate a daily tip for neurodivergent parenting.' }
      ],
      max_tokens: 800,
      temperature: 0.8,
      response_format: { type: 'json_object' }
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      return res.status(500).json({ error: 'No tip generated' });
    }

    try {
      const tipData = JSON.parse(response);
      
      // Validate the generated tip structure
      if (!tipData.title || !tipData.content || !tipData.category) {
        throw new Error('Invalid tip structure');
      }

      // Ensure category is valid
      if (!TIP_CATEGORIES.includes(tipData.category)) {
        tipData.category = 'general';
      }

      // Ensure difficulty is valid
      if (!DIFFICULTY_LEVELS.includes(tipData.difficulty)) {
        tipData.difficulty = 'beginner';
      }

      res.json(tipData);

    } catch (parseError) {
      console.error('Failed to parse tip JSON:', parseError);
      return res.status(500).json({ error: 'Failed to parse generated tip' });
    }

  } catch (error) {
    console.error('Tip generation error:', error);
    
    if (error instanceof Error && error.message.includes('API key')) {
      return res.status(401).json({ error: 'Invalid OpenAI API key' });
    }
    
    res.status(500).json({ 
      error: 'Failed to generate tip',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper function to determine age range from child age
function getAgeRange(age: number): string {
  if (age <= 3) return '0-3';
  if (age <= 6) return '3-6';
  if (age <= 12) return '7-12';
  if (age <= 18) return '13-18';
  return 'adult';
}

// GET /api/tips/categories - Get available tip categories
router.get('/categories', (req, res) => {
  res.json({
    categories: TIP_CATEGORIES,
    difficulties: DIFFICULTY_LEVELS
  });
});

export default router;