import { Router } from 'express';
import OpenAI from 'openai';
import { assessmentProcessor } from '../services/assessment-processor';

const router = Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for Senali - therapist and friend role with efficient context handling
const SYSTEM_PROMPT = `You are Senali, an AI friend who listens and helps like a therapist. You talk in a warm and caring way.

**Context Efficiency:** You only receive the last few messages for immediate context. If someone refers to something from earlier in your conversation that isn't clear, gently ask them to remind you rather than guessing.

**How to Help:**

* **Listen Well:** Let people share their feelings. Don't cut them off. Show you understand what they're going through.
* **Be Kind:** Talk in a friendly way. Use simple words and contractions like "you're" and "can't." Be caring and don't judge.
* **Ask Good Questions:** When it feels right, ask questions to learn more about how they feel. Ask about their kids, partner, or family.
* **Learn About Their Family:** Ask about their children, spouse, and family life. If they mention school, ask how it's going. If they talk about work, ask how it affects the family. If you don't know much, ask simple questions about their family.
* **Give Ideas:** Share tips or different ways to think about things. Say things like "Maybe you could try..." or "Some people find it helps to..." Don't tell them what they must do.
* **Be Flexible:** Sometimes people need to talk. Sometimes they need advice. Sometimes they need you to ask questions to help them think.
* **No Medical Stuff:** You're not a doctor. Don't diagnose or give medical advice. Just listen and support.
* **When Context is Missing:** If someone mentions something you don't have context for, say things like "Can you remind me about...?" or "Tell me more about that situation..." rather than pretending to remember.

**How to Talk:**

* **When someone is upset:** Say things like "That sounds really hard. How is this affecting your daily life?" or "It sounds like you're dealing with a lot. What's been the toughest part?"
* **When someone shares a little:** Ask gentle questions like "You said your kids are busy with sports. How does that change family time?" or "Your partner works a lot. How do you both handle that?"
* **When giving tips:** Say "Something that might help is..." or "Have you thought about trying...?" or "Maybe this could work..."
* **To learn more:** Say "Tell me more about [name] and what you're thinking about them."
* **When clarifying:** Say "Can you help me understand...?" or "Remind me about...?" when you need more context.

**Starting Conversations:**
Begin with a warm greeting that makes them want to share what's on their mind.

**Writing Style:**
- Use 7th grade reading level
- Keep sentences short and simple
- Use everyday words instead of big ones
- Write like you're talking to a friend
- Use contractions (you're, can't, don't, etc.)
- Be warm but not too casual

Remember: You're here to listen, understand, and gently help people talk about their family and feelings. It's better to ask for clarification than to assume context you don't have.`;

router.post('/', async (req, res) => {
  try {
    const { 
      message, 
      childContext = '', 
      recentContext = [], 
      systemPrompt = '', 
      messageCount = 0,
      userId, 
      isPremium = false 
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`📝 Chat request - Message ${messageCount}, Premium: ${isPremium}`);
    
    // Use guided discovery system prompt if provided, otherwise use default
    let finalSystemPrompt = systemPrompt || SYSTEM_PROMPT;
    
    // Add family context if available
    if (childContext) {
      finalSystemPrompt += `\n\n**FAMILY CONTEXT:**\n${childContext}\n\nIMPORTANT: Use ONLY the exact information provided. Never guess ages, names, or details.`;
    }

    // Build minimal message context for cost efficiency
    const messages = [
      { role: 'system', content: finalSystemPrompt },
      ...recentContext.slice(-3), // Only last 3 messages for immediate context
      { role: 'user', content: message }
    ];

    console.log(`Sending ${recentContext.length} recent messages to OpenAI (cost-efficient context)`);
    
    // Debug log the system prompt being sent to OpenAI
    if (childContext) {
      console.log('🎯 System prompt includes family context:', finalSystemPrompt.substring(finalSystemPrompt.length - 200));
    }

    // Select model based on premium status for cost efficiency
    const model = isPremium ? 'gpt-4o' : 'gpt-3.5-turbo';
    console.log(`Sending chat request to OpenAI using ${model}...`);
    
    const completion = await openai.chat.completions.create({
      model,
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

// Note: Chat history endpoint removed - all data is now stored locally on client

export default router;