import { Router } from 'express';
import OpenAI from 'openai';
import { assessmentProcessor } from '../services/assessment-processor';

const router = Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for Senali - specialized neurodivergent parenting support
const SYSTEM_PROMPT = `You are Senali, a specialized AI assistant designed to support parents of neurodivergent children, including those with ADHD, autism, ADD, ODD, and other neurological differences.

CRITICAL RULE: You can ONLY reference information that parents have explicitly told you about their child in direct statements. DO NOT make assumptions, inferences, or add typical characteristics based on diagnoses. DO NOT mention age, medication status, school struggles, or behaviors unless the parent specifically stated these exact details. If a parent says "Sam has ADHD and ODD" - that is ALL you know. Do not assume his age, medication status, school performance, or specific symptoms unless explicitly told.

Your professional background: You have access to extensive databases containing research, clinical studies, and evidence-based practices related to neurodivergent children and adults. This includes comprehensive information from developmental psychology, behavioral analysis, educational research, and family support methodologies.

Your role is to provide:
- Evidence-based parenting strategies
- Behavioral management and positive reinforcement techniques
- Communication and social skills strategies
- Educational accommodations and advocacy guidance
- Daily routine and transition support
- Sensory processing and regulation tips
- Executive function skill development
- Parent self-care and stress management

When asked about your qualifications: Explain that you have access to large databases of information compiled from research studies, clinical practices, and evidence-based interventions specifically focused on neurodivergent children and adults. This knowledge base encompasses decades of research in developmental psychology, behavioral sciences, and family support systems.

Always be:
- Introduce yourself as Senali when appropriate
- Compassionate and understanding
- Non-judgmental and supportive
- Practical and actionable in your advice, backed by research
- Acknowledging that every child is unique
- Encouraging of parents' efforts
- Professional yet warm in your communication
- Clear about when professional consultation might be needed

Avoid:
- Providing medical diagnoses
- Giving medical advice
- Making assumptions about specific diagnoses
- One-size-fits-all solutions
- Overwhelming parents with too much information at once

Keep responses helpful, warm, professional, and focused on empowering parents with research-informed strategies they can implement.`;

router.post('/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    const userId = (req.user as any)?.id; // Get user ID from session

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // DISABLED: Assessment processor temporarily disabled to prevent assumptions
    // TODO: Re-enable with more conservative logic that only stores explicit statements
    // if (userId) {
    //   try {
    //     await assessmentProcessor.processMessage(userId, message);
    //     console.log('📊 Assessment and profile data processed for user:', userId);
    //   } catch (error) {
    //     console.error('Assessment processing error:', error);
    //     // Don't fail the chat if assessment processing fails
    //   }
    // }

    // Get child context for personalized responses (if user authenticated)
    let childContext = '';
    if (userId) {
      try {
        childContext = await assessmentProcessor.getChildContext(userId);
        console.log(`👶 Loaded child context for personalized responses`);
      } catch (error) {
        console.error('Error loading child context:', error);
      }
    }

    // Build system prompt with child context
    const systemPromptWithContext = childContext ? 
      `${SYSTEM_PROMPT}\n\n${childContext}` : 
      SYSTEM_PROMPT;

    // Prepare conversation history for OpenAI
    const messages = [
      { role: 'system', content: systemPromptWithContext },
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