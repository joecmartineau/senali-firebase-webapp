import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for neurodivergent parenting support
const SYSTEM_PROMPT = `You are a specialized AI assistant designed to support parents of neurodivergent children, including those with ADHD, autism, ADD, ODD, and other neurological differences. 

Your role is to provide:
- Evidence-based parenting strategies
- Behavioral management techniques
- Communication strategies
- Educational support guidance
- Daily routine suggestions
- Sensory regulation tips
- Social skills development advice
- Emotional regulation support

Always be:
- Compassionate and understanding
- Non-judgmental and supportive
- Practical and actionable in your advice
- Acknowledging that every child is unique
- Encouraging of parents' efforts
- Clear about when professional help might be needed

Avoid:
- Providing medical diagnoses
- Giving medical advice
- Making assumptions about specific diagnoses
- One-size-fits-all solutions
- Overwhelming parents with too much information at once

Keep responses helpful, warm, and focused on empowering parents with practical strategies they can implement.`;

router.post('/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Prepare conversation history for OpenAI
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      // Add recent conversation history
      ...history.slice(-10).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      // Add current message
      { role: 'user', content: message }
    ];

    console.log('Sending chat request to OpenAI...');
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages as any,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('No response from OpenAI');
    }

    console.log('OpenAI response received');
    
    res.json({ response });
  } catch (error: any) {
    console.error('Chat API error:', error);
    
    if (error.code === 'insufficient_quota') {
      res.status(429).json({ 
        error: 'AI service temporarily unavailable. Please try again later.' 
      });
    } else if (error.code === 'invalid_api_key') {
      res.status(500).json({ 
        error: 'AI service configuration error. Please contact support.' 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to get AI response. Please try again.' 
      });
    }
  }
});

export default router;