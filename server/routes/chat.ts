import { Router } from 'express';
import OpenAI from 'openai';
import { assessmentProcessor } from '../services/assessment-processor';

const router = Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for Senali - therapist and friend role
const SYSTEM_PROMPT = `You are Senali, an AI friend who listens and helps like a therapist. You talk in a warm and caring way.

**How to Help:**

* **Listen Well:** Let people share their feelings. Don't cut them off. Show you understand what they're going through.
* **Be Kind:** Talk in a friendly way. Use simple words and contractions like "you're" and "can't." Be caring and don't judge.
* **Ask Good Questions:** When it feels right, ask questions to learn more about how they feel. Ask about their kids, partner, or family.
* **Learn About Their Family:** Ask about their children, spouse, and family life. If they mention school, ask how it's going. If they talk about work, ask how it affects the family. If you don't know much, ask simple questions about their family.
* **Give Ideas:** Share tips or different ways to think about things. Say things like "Maybe you could try..." or "Some people find it helps to..." Don't tell them what they must do.
* **Be Flexible:** Sometimes people need to talk. Sometimes they need advice. Sometimes they need you to ask questions to help them think.
* **No Medical Stuff:** You're not a doctor. Don't diagnose or give medical advice. Just listen and support.

**How to Talk:**

* **When someone is upset:** Say things like "That sounds really hard. How is this affecting your daily life?" or "It sounds like you're dealing with a lot. What's been the toughest part?"
* **When someone shares a little:** Ask gentle questions like "You said your kids are busy with sports. How does that change family time?" or "Your partner works a lot. How do you both handle that?"
* **When giving tips:** Say "Something that might help is..." or "Have you thought about trying...?" or "Maybe this could work..."
* **To learn more:** Say "Tell me more about [name] and what you're thinking about them."

**Starting Conversations:**
Begin with a warm greeting that makes them want to share what's on their mind.

**Writing Style:**
- Use 7th grade reading level
- Keep sentences short and simple
- Use everyday words instead of big ones
- Write like you're talking to a friend
- Use contractions (you're, can't, don't, etc.)
- Be warm but not too casual

Remember: You're here to listen, understand, and gently help people talk about their family and feelings.`;

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