import {onRequest} from 'firebase-functions/v2/https';
import {setGlobalOptions} from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import OpenAI from 'openai';
import * as cors from 'cors';

// Set global options for all functions
setGlobalOptions({maxInstances: 10});

// Initialize Firebase Admin
admin.initializeApp();

// Initialize CORS
const corsHandler = cors({ origin: true });

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for Senali - parenting coach and friend role with efficient context handling
const SYSTEM_PROMPT = `You are Senali, an AI friend who listens and helps like a parenting coach. You talk in a warm and caring way.

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

// Chat endpoint - replaces the Express.js route
export const chat = onRequest((request, response) => {
  return corsHandler(request, response, async () => {
    try {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { message, childContext = '', recentContext = [], userId } = request.body;

      if (!message || typeof message !== 'string') {
        response.status(400).json({ error: 'Message is required' });
        return;
      }

      // Build system prompt with child context
      const systemPromptWithContext = childContext ? 
        `${SYSTEM_PROMPT}\n\n${childContext}` : 
        SYSTEM_PROMPT;

      // Use minimal context approach - only recent messages
      const messages = [
        { role: 'system', content: systemPromptWithContext },
        ...recentContext.slice(-3), // Only last 3 messages for immediate context
        { role: 'user', content: message }
      ];

      console.log(`Sending ${recentContext.length} recent messages to OpenAI (efficient context)`);
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: messages as any,
        max_tokens: 1000,
        temperature: 0.7,
      });

      const aiResponse = completion.choices[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('No response from OpenAI');
      }

      console.log('OpenAI response received');
      
      response.json({ response: aiResponse });
    } catch (error: any) {
      console.error('Chat API error:', error);
      
      if (error.code === 'insufficient_quota') {
        response.status(429).json({ 
          error: 'AI service temporarily unavailable. Please try again later.' 
        });
      } else if (error.code === 'invalid_api_key') {
        response.status(500).json({ 
          error: 'AI service configuration error. Please contact support.' 
        });
      } else {
        response.status(500).json({ 
          error: 'Failed to get AI response. Please try again.' 
        });
      }
    }
  });
});

// Tips generation endpoint
export const generateTip = onRequest((request, response) => {
  return corsHandler(request, response, async () => {
    try {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { userId, preferences = {} } = request.body;

      if (!userId) {
        response.status(400).json({ error: 'User ID is required' });
        return;
      }

      // Generate tip using OpenAI
      const tipPrompt = `Generate a supportive, practical parenting tip focused on emotional well-being and family relationships. 
      
      The tip should be:
      - Written at a 7th grade reading level
      - Warm and encouraging in tone
      - Actionable and specific
      - Focused on connection, understanding, or emotional support
      - About 2-3 sentences long
      
      Please provide a title and content for the tip.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a supportive parenting expert who gives warm, practical advice.' },
          { role: 'user', content: tipPrompt }
        ],
        max_tokens: 200,
        temperature: 0.8,
      });

      const tipContent = completion.choices[0]?.message?.content || 'Take time today to really listen to your child without offering solutions. Sometimes they just need to be heard.';
      
      // Parse title and content from response
      const lines = tipContent.split('\n').filter(line => line.trim());
      const title = lines[0]?.replace(/^(Title:|Tip:)/i, '').trim() || 'Daily Parenting Reminder';
      const content = lines.slice(1).join(' ').trim() || tipContent;

      const tipData = {
        title,
        content,
        category: 'emotional-support',
        targetAge: getAgeRange(preferences.childAge),
        difficulty: 'beginner',
        estimatedTime: '5-15 minutes',
        tags: ['parenting', 'emotional-support', 'connection']
      };

      response.json(tipData);

    } catch (error: any) {
      console.error('Tip generation error:', error);
      response.status(500).json({ 
        error: 'Failed to generate tip',
        details: error.message || 'Unknown error'
      });
    }
  });
});

// Helper function to determine age range from child age
function getAgeRange(age?: number): string {
  if (!age) return 'all ages';
  if (age <= 3) return '0-3';
  if (age <= 6) return '3-6';
  if (age <= 12) return '7-12';
  if (age <= 18) return '13-18';
  return 'adult';
}