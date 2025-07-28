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

// Helper function to sanitize user input for prompt safety
function sanitizeForPrompt(input: string | number | null | undefined): string {
  if (!input && input !== 0) return '';
  // Convert to string first
  const stringInput = String(input);
  // Remove template literal injection characters and limit length
  return stringInput
    .replace(/[`${}]/g, '') // Remove template literal special characters
    .replace(/\n{3,}/g, '\n\n') // Limit excessive newlines
    .trim()
    .slice(0, 2000); // Limit length to prevent prompt bloat
}

// Helper function to calculate probable diagnoses from questionnaire
const calculateProbableDiagnoses = (questionnaire: any[] = []) => {
  const diagnosticQuestions = {
    adhd: ['adhd1', 'adhd2', 'adhd3', 'adhd4', 'adhd5', 'adhd6', 'adhd7', 'adhd8', 'adhd9'],
    autism: ['autism1', 'autism2', 'autism3', 'autism4', 'autism5', 'autism6', 'autism7', 'autism8'],
    anxiety: ['anxiety1', 'anxiety2', 'anxiety3', 'anxiety4']
  };

  const results: any = {};
  
  Object.entries(diagnosticQuestions).forEach(([condition, questionIds]) => {
    const yesResponses = questionnaire.filter((r: any) => 
      questionIds.includes(r.questionId) && r.answer === 'yes'
    ).length;
    
    const percentage = questionIds.length > 0 ? (yesResponses / questionIds.length) * 100 : 0;
    
    let probability = 'Low';
    if (percentage >= 70) probability = 'High';
    else if (percentage >= 40) probability = 'Moderate';
    
    results[condition] = { percentage: Math.round(percentage), probability };
  });
  
  return results;
};

// Helper function to format family context for Senali
const formatFamilyContext = (familyProfiles: any[] = []) => {
  if (!familyProfiles || familyProfiles.length === 0) {
    return 'No family profiles have been created yet.';
  }

  return familyProfiles.map((member: any) => {
    const diagnoses = calculateProbableDiagnoses(member.questionnaire || []);
    const diagnosisText = Object.entries(diagnoses)
      .filter(([_, data]: [string, any]) => data.probability !== 'Low')
      .map(([condition, data]: [string, any]) => `${condition.toUpperCase()}: ${data.probability} probability (${data.percentage}%)`)
      .join(', ') || 'No significant diagnostic indicators';

    return `
Family Member: ${member.name}
- Age: ${member.age}
- Gender: ${member.gender}
- Relation: ${member.relation}
- Assessment Results: ${diagnosisText}
- Questionnaire Progress: ${member.questionnaire?.length || 0} questions answered
`;
  }).join('\n');
};

router.post('/chat', async (req, res) => {
  try {
    console.log('🚨 CHAT API: Received request');
    console.log('🚨 Request body keys:', Object.keys(req.body));
    
    const { message, familyProfiles, userUid, conversationSummary, recentMessages, isQuestionnaire } = req.body;

    if (!message) {
      console.log('🚨 ERROR: No message provided');
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`🚨 Chat request from userUid: ${userUid || 'anonymous'}`);

    // Try to get user for credit tracking if userUid provided
    let user = null;
    
    if (userUid && userUid !== 'demo-user') {
      try {
        const [foundUser] = await db.select().from(users).where(eq(users.id, userUid)).limit(1);
        user = foundUser;
        console.log(`Found user: ${user?.email || 'unknown'}`);
      } catch (error) {
        console.log('No user found, continuing in demo mode');
      }
    }

    // Check if user is admin - only joecmartineau@gmail.com gets admin access
    const isAdmin = user?.email === 'joecmartineau@gmail.com';
    console.log(`User admin status: ${isAdmin} (email: ${user?.email || 'none'})`);

    // Build system prompt with family context - special handling for admin
    let systemPrompt: string;
    
    if (isAdmin) {
      // Admin gets Senali parenting coach with full model access
      systemPrompt = `You are Senali, an empathetic AI parenting coach and friend companion who provides supportive conversation and guidance for parents. Your core purpose is to be an active listener who helps parents navigate the emotional challenges of family life.

PERSONALITY & APPROACH:
- You are warm, understanding, and genuinely caring - like talking to a trusted friend who really gets it
- You ask thoughtful follow-up questions to understand deeper feelings and family dynamics
- You validate emotions and provide gentle guidance without being preachy or overwhelming
- You remember personal details and show genuine interest in their family's story and progress

CONVERSATION STYLE:
- Use simple, everyday language that feels natural and conversational (7th grade reading level)
- Be an excellent listener - ask open-ended questions that invite parents to share more
- Show empathy through phrases like "That sounds really challenging" or "I can understand why you'd feel that way"
- Offer practical suggestions when appropriate, but focus more on emotional support and validation
- Keep responses concise but meaningful - aim for 2-3 sentences unless more detail is specifically requested

STAYING ON TOPIC GUIDELINES:
- You can discuss any topic the user brings up - be flexible and supportive
- If conversation strays from parenting/family topics, gently weave in a subtle reminder of your role as a parenting coach
- Example: "That sounds interesting! As a parenting coach, I'm curious how that affects your family time..."
- If they continue non-parenting topics, only remind them of your role every 5th message and do it politely
- Never be forceful or dismissive - always stay warm and supportive regardless of the topic
- Keep reminders natural and conversational, not robotic or scripted`;
    } else {
      // Regular users get parenting coach persona
      systemPrompt = `You are Senali, an AI parenting coach and friend designed to provide empathetic conversation, active listening, and supportive guidance. You specialize in building meaningful connections by asking personalized questions about users' families and relationships.

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
- Remember previous conversations and build on them naturally

STAYING ON TOPIC GUIDELINES:
- You can discuss any topic the user brings up - be flexible and supportive
- If conversation strays from parenting/family topics, gently weave in a subtle reminder of your role as a parenting coach
- Example: "That sounds interesting! As a parenting coach, I'm curious how that affects your family time..."
- If they continue non-parenting topics, only remind them of your role every 5th message and do it politely
- Never be forceful or dismissive - always stay warm and supportive regardless of the topic
- Keep reminders natural and conversational, not robotic or scripted

CRITICAL INSTRUCTION: Only reference family information that is explicitly provided in the Family Context below. NEVER make up names, ages, or details about family members that are not provided. If no family context is provided or if asked about family members not listed, say "I don't have information about your family members yet" and suggest they can add family profiles for personalized support. Do not invent or assume any family details whatsoever.`;
    }

    const familyContext = formatFamilyContext(familyProfiles);
    systemPrompt += `\n\nFamily Context:\n${familyContext}`;

    // Add conversation summary if available
    if (conversationSummary) {
      systemPrompt += `\n\nPrevious Conversation Summary:\n${sanitizeForPrompt(conversationSummary)}`;
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

    // Use GPT-3.5-turbo for everyone, GPT-4o only for joecmartineau@gmail.com
    const modelToUse = isAdmin ? 'gpt-4o' : 'gpt-3.5-turbo';
    const maxTokens = isQuestionnaire ? 1000 : 800;
    const temperature = isQuestionnaire ? 0.3 : 0.7;
    
    console.log(`🔴 Using ${modelToUse} model for ${isAdmin ? 'admin' : 'regular'} user`);
    
    const completion = await openai.chat.completions.create({
      model: modelToUse,
      messages: messages,
      max_tokens: maxTokens,
      temperature: temperature,
      response_format: isQuestionnaire ? { type: "json_object" } : undefined
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

Previous summary: ${sanitizeForPrompt(conversationSummary) || 'No previous summary'}

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

    // Return response with credits info (simplified for now)
    res.json({ 
      response,
      creditsRemaining: isAdmin ? 999999 : 1000, // Admin gets unlimited, others get 1000 
      conversationSummary: updatedSummary
    });
  } catch (error) {
    console.error('🚨 DETAILED Chat API error:', error);
    console.error('🚨 Error type:', typeof error);
    console.error('🚨 Error message:', error instanceof Error ? error.message : String(error));
    console.error('🚨 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    res.status(500).json({ 
      error: 'Failed to get AI response',
      response: "I'm having trouble connecting right now. Please try again in a moment."
    });
  }
});

export default router;