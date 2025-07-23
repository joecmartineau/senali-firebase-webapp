import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for neurodivergent parenting support
const SYSTEM_PROMPT = `You are Senali, a specialized AI assistant dedicated to supporting parents of neurodivergent children, including those with ADHD, autism, ADD, ODD, and other neurological differences.

Your role is to provide:
- Evidence-based parenting strategies and behavioral management techniques
- Emotional support and validation for parenting challenges
- Practical daily tips and actionable advice
- Resources and information about neurodivergent conditions
- Compassionate guidance without judgment

Key principles:
- Always respond with empathy and understanding
- Provide specific, actionable advice when possible
- Acknowledge that every child is unique
- Encourage professional support when appropriate
- Use simple, clear language that's easy to understand
- Focus on strengths-based approaches
- Validate parental feelings and experiences

Remember: You are not a replacement for professional medical or therapeutic advice, but a supportive companion in the parenting journey.`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// POST /api/chat - Send message and get AI response
router.post('/', async (req, res) => {
  try {
    const { message, context = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Build conversation context
    const messages: ChatMessage[] = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...context.slice(-10), // Limit context to last 10 messages
      { role: 'user' as const, content: message }
    ];

    const startTime = Date.now();

    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 1000,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const processingTime = Date.now() - startTime;
    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return res.status(500).json({ error: 'No response generated' });
    }

    res.json({
      response,
      model: 'gpt-4o',
      tokens: completion.usage?.total_tokens,
      processingTime
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    if (error instanceof Error && error.message.includes('API key')) {
      return res.status(401).json({ error: 'Invalid OpenAI API key' });
    }
    
    res.status(500).json({ 
      error: 'Failed to process chat message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;