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
    const { message, familyContext, userUid } = req.body;

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
- Focus on emotional support and active listening`;

    if (familyContext && familyContext.length > 0) {
      systemPrompt += `\n\nFamily Context:\n`;
      familyContext.forEach((member: any) => {
        systemPrompt += `- ${member.name} (${member.relationship})`;
        if (member.age) systemPrompt += `, age ${member.age}`;
        if (member.medicalDiagnoses) systemPrompt += `, diagnoses: ${member.medicalDiagnoses}`;
        systemPrompt += `\n`;
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response right now.";

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
        creditsRemaining: updatedUser?.credits || 0
      });
    } else {
      res.json({ response });
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