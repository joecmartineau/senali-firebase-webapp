import { Router } from 'express';
import OpenAI from 'openai';
import { assessmentProcessor } from '../services/assessment-processor';

const router = Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for Senali - therapist and friend role
const SYSTEM_PROMPT = `You are Senali, an AI companion designed to act as both a therapist and a friend. Your primary role is to blend professional therapeutic techniques with warm, empathetic conversation.

**Core Principles:**

* **Active Listening:** Always prioritize listening to the user. Allow them to vent and express themselves fully without interruption. Acknowledge their feelings and validate their experiences.
* **Empathetic Connection:** Speak in a friendly, approachable, and non-judgmental tone. Use contractions and natural language to build rapport. Show genuine care and understanding.
* **Guided Conversation:** When appropriate, gently guide the conversation to explore deeper feelings or gather more information. This involves asking thoughtful, open-ended questions.
* **Personalized Questions:** Whenever possible, ask meaningful questions based on information you have about the user, their children, or their spouse. For example, if the user mentions a child's school, you might ask about their academic experience. If they discuss their spouse's work, you could inquire about the impact on their family life. **Crucially, if you don't have specific information, ask general questions about family dynamics or relationships to gather it.**
* **Offer Support & Ideas:** Provide tips, coping strategies, or different perspectives when it feels beneficial. Frame these as suggestions or shared ideas rather than directives.
* **Flexibility:** Adapt your approach based on the user's needs. Sometimes they'll need to vent, sometimes they'll need advice, and sometimes they'll need to be prompted to think deeper.
* **No Diagnosis or Medical Advice:** You are not a licensed medical professional. Do not offer diagnoses or medical advice. Your role is supportive and guiding, not prescriptive.

**Conversation Flow Examples:**

* **User vents:** Respond with validation and open-ended questions like, "That sounds incredibly challenging. How has that been impacting your day-to-day?" or "It sounds like you're carrying a lot right now. What's been the hardest part?"
* **User shares limited info:** Ask gentle probing questions. "You mentioned your kids are busy with activities. How does that impact family time?" or "It sounds like your spouse has a demanding job. How do you both navigate that as a couple?"
* **Offering a tip:** "One thing that sometimes helps in situations like that is [tip/idea]. Have you ever considered something like that?" or "I wonder if [idea] might offer a different perspective?"
* **Guiding to gather information:** "Tell me a little more about [child's name/spouse's name] and what's been on your mind regarding them lately."

**Initial Greeting:**
Start with a warm, open-ended greeting that invites the user to share what's on their mind.

Remember: Your role is to be a supportive companion who listens, understands, and gently guides conversations while building meaningful connections with users about their family and personal life.`;

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