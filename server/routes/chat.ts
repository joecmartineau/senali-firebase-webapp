import { Router } from 'express';
import OpenAI from 'openai';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/chat', async (req, res) => {
  try {
    const { message, familyContext, userUid, conversationSummary, recentMessages } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check user credits before processing chat
    if (userUid) {
      const [user] = await db.select().from(users).where(eq(users.id, userUid)).limit(1);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      if (user.credits <= 0) {
        return res.status(403).json({ 
          error: 'No credits remaining',
          message: 'You have no credits left. Please upgrade to continue chatting.' 
        });
      }
      
      console.log(`User ${user.email} has ${user.credits} credits before chat`);
    }

    // Build system prompt with family context
    let systemPrompt = `You are Senali, an AI therapist and friend designed to provide empathetic conversation, active listening, and supportive guidance. You specialize in building meaningful connections by asking personalized questions about users' families and relationships.

Your personality:
- Warm, empathetic, and genuinely caring
- Ask thoughtful follow-up questions
- Remember family members and their details
- Provide emotional validation without medical advice
- Focus on emotional well-being and family relationships

Guidelines:
- Use simple, everyday language (7th grade reading level)
- Be supportive and non-judgmental
- Ask open-ended questions to encourage sharing
- Validate emotions and experiences
- Offer gentle guidance and perspectives
- Never provide medical or psychiatric advice
- Focus on emotional support and active listening
- Remember previous conversations and build on them naturally`;

    if (familyContext && familyContext.length > 0) {
      systemPrompt += `\n\nFamily Context:\n`;
      familyContext.forEach((member: any) => {
        systemPrompt += `- ${member.name} (${member.relationship})`;
        if (member.age) systemPrompt += `, age ${member.age}`;
        if (member.medicalDiagnoses) systemPrompt += `, diagnoses: ${member.medicalDiagnoses}`;
        systemPrompt += `\n`;
      });
    }

    // Add conversation summary if available
    if (conversationSummary) {
      systemPrompt += `\n\nPrevious Conversation Summary:\n${conversationSummary}`;
    }

    // Build messages array with recent context
    const messages: any[] = [{ role: 'system', content: systemPrompt }];
    
    // Add recent messages for immediate context (last 10 messages)
    if (recentMessages && recentMessages.length > 0) {
      // Add recent messages but exclude the current user message (it's added separately)
      const contextMessages = recentMessages.slice(0, -1);
      messages.push(...contextMessages);
    }
    
    // Add the current user message
    messages.push({ role: 'user', content: message });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response right now.";

    // Generate conversation summary if we have enough messages (every 20 messages)
    let updatedSummary = conversationSummary;
    if (recentMessages && recentMessages.length >= 18) { // 18 + user message + ai response = 20
      try {
        const summaryMessages = [
          { 
            role: 'system', 
            content: `You are a conversation summarizer. Create a concise summary of this therapy conversation that captures:
- Key topics discussed
- Important family members mentioned
- Emotional themes and progress
- Any significant revelations or insights
- Current challenges or concerns

Keep the summary under 200 words and focus on information that would help maintain continuity in future conversations.

Previous summary: ${conversationSummary || 'No previous summary'}

Recent conversation to summarize:` 
          },
          ...recentMessages,
          { role: 'assistant', content: response }
        ];

        const summaryCompletion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo', // Use cheaper model for summaries
          messages: summaryMessages,
          max_tokens: 250,
          temperature: 0.3,
        });

        updatedSummary = summaryCompletion.choices[0]?.message?.content || conversationSummary;
        console.log('Generated conversation summary');
      } catch (summaryError) {
        console.error('Error generating summary:', summaryError);
        // Continue without summary update if it fails
      }
    }

    // Deduct 1 credit after successful chat
    if (userUid) {
      const [updatedUser] = await db.update(users)
        .set({ 
          credits: Math.max(0, (await db.select().from(users).where(eq(users.id, userUid)).limit(1))[0]?.credits - 1 || 0),
          updatedAt: new Date()
        })
        .where(eq(users.id, userUid))
        .returning();
      
      console.log(`Credit deducted. User ${updatedUser?.email} now has ${updatedUser?.credits} credits`);
      
      res.json({ 
        response,
        creditsRemaining: updatedUser?.credits || 0,
        updatedSummary: updatedSummary !== conversationSummary ? updatedSummary : undefined
      });
    } else {
      res.json({ 
        response,
        updatedSummary: updatedSummary !== conversationSummary ? updatedSummary : undefined
      });
    }
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ 
      error: 'Failed to get AI response',
      response: "I'm having trouble connecting right now. Please try again in a moment."
    });
  }
});

export default router;