import {onRequest} from 'firebase-functions/v2/https';
import {setGlobalOptions} from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import OpenAI from 'openai';
import cors from 'cors';

// Set global options for all functions
setGlobalOptions({maxInstances: 10});

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

// Initialize CORS
const corsHandler = cors({ origin: true });

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to verify admin access
async function verifyAdmin(request: any): Promise<boolean> {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    return decodedToken.email === 'joecmartineau@gmail.com';
  } catch (error) {
    console.error('Admin verification error:', error);
    return false;
  }
}

// Helper function to sanitize input
function sanitizeForPrompt(input: string | number | null | undefined): string {
  if (!input && input !== 0) return '';
  const stringInput = String(input);
  return stringInput
    .replace(/[`${}]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 2000);
}

// System prompt for Senali - parenting coach and friend role with efficient context handling
const SYSTEM_PROMPT = `You are Senali, an AI friend who listens and helps like a parenting coach. You talk in a warm and caring way.

**Context Efficiency:** You only receive the last few messages for immediate context. If someone refers to something from earlier in your conversation that isn't clear, gently ask them to remind you rather than guessing.

**MANDATORY - MENTION DIAGNOSTIC RESULTS:** When you see "🤖 AI DIAGNOSTIC ANALYSIS" in family information, YOU MUST tell the user about the results in your first response:

REQUIRED PHRASES:
- 🔴 HIGH PROBABILITY: "Based on your questionnaire responses, you most likely have [condition]"
- 🟡 MODERATE PROBABILITY: "Your assessment suggests you might have [condition]" 
- 🟢 LOW PROBABILITY: "There's a lower possibility you have [condition]"

EXAMPLE: If you see "🔴 HIGH: Inattentive ADHD" you MUST say: "Based on your questionnaire responses, you most likely have Inattentive ADHD. This could explain challenges with focus and attention..."

You're sharing screening results, not medical diagnoses. Always mention professional evaluation is recommended.

**How to Help:**

* **Listen Well:** Let people share their feelings. Don't cut them off. Show you understand what they're going through.
* **Be Kind:** Talk in a friendly way. Use simple words and contractions like "you're" and "can't." Be caring and don't judge.
* **Ask Good Questions:** When it feels right, ask questions to learn more about how they feel. Ask about their kids, partner, or family.
* **Learn About Their Family:** Ask about their children, spouse, and family life. If they mention school, ask how it's going. If they talk about work, ask how it affects the family. If you don't know much, ask simple questions about their family.
* **Give Ideas:** Share tips or different ways to think about things. Say things like "Maybe you could try..." or "Some people find it helps to..." Don't tell them what they must do.
* **Be Flexible:** Sometimes people need to talk. Sometimes they need advice. Sometimes they need you to ask questions to help them think.
* **Share Assessment Results:** When family context shows diagnostic probabilities, tell users what the assessment found and provide targeted strategies.
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

// Chat endpoint - enhanced version with credit management and admin support
export const chat = onRequest(async (request: any, response: any) => {
  return corsHandler(request, response, async () => {
    try {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { message, familyContext, userUid, conversationSummary, recentMessages, isQuestionnaire, diagnosticAnalysis } = request.body;

      if (!message) {
        response.status(400).json({ error: 'Message is required' });
        return;
      }

      console.log(`Chat request from userUid: ${userUid}`);

      // Get user for admin check and credit management
      let user = null;
      let isAdmin = false;
      
      if (userUid) {
        try {
          const userDoc = await db.collection('users').doc(userUid).get();
          
          if (!userDoc.exists) {
            // Check if this could be admin accessing via Firebase auth
            const adminDoc = await db.collection('users').where('email', '==', 'joecmartineau@gmail.com').limit(1).get();
            if (!adminDoc.empty) {
              user = { id: adminDoc.docs[0].id, ...adminDoc.docs[0].data() };
              isAdmin = true;
              console.log('Admin user detected via fallback lookup - unlimited access');
            } else {
              return response.status(404).json({ error: 'User not found' });
            }
          } else {
            user = { id: userDoc.id, ...userDoc.data() } as any;
            isAdmin = (user as any).email === 'joecmartineau@gmail.com';
          }
          
          // Only check credits for non-admin users
          if (!isAdmin && (user as any).credits <= 0) {
            return response.status(403).json({ 
              error: 'No credits remaining',
              message: 'You have no credits left. Please upgrade to continue chatting.' 
            });
          }
          
          console.log(`User ${(user as any)?.email || userUid} has ${(user as any)?.credits || 'unlimited'} credits before chat${isAdmin ? ' (ADMIN - unlimited access)' : ''}`);
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }

      // Build system prompt with family context and diagnostic awareness
      let systemPrompt: string;
      
      if (isAdmin) {
        systemPrompt = `You are Senali, an AI assistant with full capabilities. You can discuss any topic without restrictions. Be helpful, informative, and conversational. You have access to GPT-4o and can provide detailed, comprehensive responses on any subject the user wants to explore.`;
      } else {
        systemPrompt = SYSTEM_PROMPT;
      }

      // Add family context - now supports both string format (with diagnostics) and legacy array format
      if (familyContext) {
        if (typeof familyContext === 'string') {
          // New format: comprehensive family context string with diagnostic results
          systemPrompt += `\n\n${familyContext}`;
          console.log('📋 Using comprehensive family context with diagnostic results');
        } else if (Array.isArray(familyContext) && familyContext.length > 0) {
          // Legacy format: array of family members (fallback)
          systemPrompt += `\n\nFamily Context:\n`;
          familyContext.forEach((member: any) => {
            systemPrompt += `- ${sanitizeForPrompt(member.name)} (${sanitizeForPrompt(member.relationship)})`;
            if (member.age) systemPrompt += `, age ${sanitizeForPrompt(member.age)}`;
            if (member.medicalDiagnoses) systemPrompt += `, diagnoses: ${sanitizeForPrompt(member.medicalDiagnoses)}`;
            systemPrompt += `\n`;
          });
          console.log('📋 Using legacy family context format (no diagnostics)');
        }
      }

      // Add conversation summary if available
      if (conversationSummary) {
        systemPrompt += `\n\nPrevious Conversation Summary:\n${sanitizeForPrompt(conversationSummary)}`;
      }

      // Handle diagnostic analysis with specialized system prompt
      let messages: any[];
      let modelToUse: string;
      let maxTokens: number;
      let temperature: number;
      let responseFormat: any = undefined;

      if (diagnosticAnalysis) {
        // Use specialized diagnostic system prompt for AI-powered diagnosis
        const diagnosticSystemPrompt = `You are a clinical assessment AI that analyzes symptom questionnaire data to determine probable diagnoses based on DSM-5 criteria. You provide structured diagnostic probability assessments for screening purposes only.

IMPORTANT: You are providing screening assessments, not formal diagnoses. All results should include disclaimers about professional evaluation.

Your task is to:
1. Analyze symptom patterns using established diagnostic criteria
2. Calculate probability levels based on symptom clusters and severity
3. Provide specific condition names with confidence levels
4. Give clear reasoning for each probable diagnosis
5. Recommend appropriate next steps for families

For ADHD: Use DSM-5 criteria requiring 6+ symptoms in inattentive OR hyperactive-impulsive categories for children, 5+ for adults
For Autism: Use DSM-5 criteria requiring deficits in social communication AND restricted/repetitive behaviors
For other conditions: Apply appropriate clinical thresholds

Probability Levels:
- HIGH (80-100%): Strong symptom cluster match, meets most criteria
- MODERATE (50-79%): Some criteria met, requires further evaluation  
- LOW (20-49%): Few criteria met, monitoring recommended

Always respond with properly formatted JSON containing diagnoses array, summary, and overall assessment. Include confidence percentages and specific recommendations.`;

        messages = [
          { role: 'system', content: diagnosticSystemPrompt },
          { role: 'user', content: message }
        ];
        modelToUse = 'gpt-4o';
        maxTokens = 1500;
        temperature = 0.2; // Lower temperature for more consistent diagnostic analysis
        responseFormat = { type: "json_object" };
        
        console.log('Processing diagnostic analysis request with GPT-4o');
      } else {
        // Regular chat conversation
        messages = [{ role: 'system', content: systemPrompt }];
        
        // Add recent messages for immediate context (last 10 messages)
        if (recentMessages && recentMessages.length > 0) {
          const contextMessages = recentMessages.slice(0, -1);
          messages.push(...contextMessages);
        }
        
        // Add the current user message
        messages.push({ role: 'user', content: message });

        // Handle questionnaire analysis differently
        modelToUse = isQuestionnaire ? 'gpt-4o' : (isAdmin ? 'gpt-4o' : 'gpt-3.5-turbo');
        maxTokens = isQuestionnaire ? 1000 : (isAdmin ? 1000 : 500);
        temperature = isQuestionnaire ? 0.3 : (isAdmin ? 0.8 : 0.7);
        responseFormat = isQuestionnaire ? { type: "json_object" } : undefined;
      }
      
      const completion = await openai.chat.completions.create({
        model: modelToUse,
        messages: messages,
        max_tokens: maxTokens,
        temperature: temperature,
        response_format: responseFormat
      });

      const aiResponse = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response right now.";

      console.log('OpenAI response received');

      // Deduct credit for non-admin users
      let updatedCredits = (user as any)?.credits;
      if (user && !isAdmin) {
        const newCredits = Math.max(0, (user as any).credits - 1);
        await db.collection('users').doc((user as any).id).update({
          credits: newCredits,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        updatedCredits = newCredits;
        console.log(`Credit deducted: ${(user as any).email} now has ${newCredits} credits`);
      }
      
      response.json({ 
        response: aiResponse,
        creditsRemaining: isAdmin ? 999999 : updatedCredits
      });

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
export const generateTip = onRequest(async (request: any, response: any) => {
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

// Firebase Auth Sign-in endpoint
export const firebaseSignin = onRequest(async (request: any, response: any) => {
  return corsHandler(request, response, async () => {
    try {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { uid, email, displayName, photoURL } = request.body;

      if (!uid || !email) {
        response.status(400).json({ error: 'UID and email are required' });
        return;
      }

      // Check if user exists in Firestore
      let userDoc = await db.collection('users').doc(uid).get();
      
      if (!userDoc.exists) {
        // Create new user with default credits
        await db.collection('users').doc(uid).set({
          email,
          displayName: displayName || email.split('@')[0],
          profileImageUrl: photoURL || null,
          credits: 25, // Default starting credits
          subscription: 'free',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        userDoc = await db.collection('users').doc(uid).get();
        console.log(`New user created: ${email} with 25 credits`);
      } else {
        // Update existing user's last sign-in
        await db.collection('users').doc(uid).update({
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Existing user signed in: ${email}`);
      }

      const userData = userDoc.data();
      response.json({
        user: {
          uid,
          email: userData?.email || email,
          displayName: userData?.displayName || displayName,
          credits: userData?.credits || 25,
          subscription: userData?.subscription || 'free'
        }
      });

    } catch (error) {
      console.error('Firebase signin error:', error);
      response.status(500).json({ error: 'Failed to sign in user' });
    }
  });
});

// Get subscription status
export const getSubscriptionStatus = onRequest(async (request: any, response: any) => {
  return corsHandler(request, response, async () => {
    try {
      if (request.method !== 'GET') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const uid = request.url?.split('/').pop();
      if (!uid) {
        response.status(400).json({ error: 'User ID is required' });
        return;
      }

      const userDoc = await db.collection('users').doc(uid).get();
      if (!userDoc.exists) {
        response.status(404).json({ error: 'User not found' });
        return;
      }

      const userData = userDoc.data();
      response.json({
        credits: userData?.credits || 0,
        subscription: userData?.subscription || 'free',
        subscriptionStatus: userData?.subscription === 'premium' ? 'active' : 'trial'
      });

    } catch (error) {
      console.error('Get subscription status error:', error);
      response.status(500).json({ error: 'Failed to get subscription status' });
    }
  });
});

// Admin: Get all users
export const adminGetUsers = onRequest(async (request: any, response: any) => {
  return corsHandler(request, response, async () => {
    try {
      if (request.method !== 'GET') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const isAdmin = await verifyAdmin(request);
      if (!isAdmin) {
        response.status(403).json({ error: 'Access denied' });
        return;
      }

      console.log('Admin: Fetching all users...');
      
      // Get users from Firestore
      const usersSnapshot = await db.collection('users').get();
      const users = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          email: data.email || '',
          displayName: data.displayName || data.email?.split('@')[0] || 'Unknown',
          photoURL: data.profileImageUrl || null,
          createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
          lastSignIn: data.updatedAt?.toDate()?.toISOString() || data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
          credits: data.credits || 25,
          subscriptionStatus: data.subscription === 'premium' ? 'premium' : 'free'
        };
      });

      console.log(`Found ${users.length} users`);
      response.json({ users, totalCount: users.length });

    } catch (error) {
      console.error('Error fetching users:', error);
      response.status(500).json({ error: 'Failed to fetch users' });
    }
  });
});

// Admin: Adjust user credits
export const adminAdjustCredits = onRequest(async (request: any, response: any) => {
  return corsHandler(request, response, async () => {
    try {
      if (request.method !== 'PATCH') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const isAdmin = await verifyAdmin(request);
      if (!isAdmin) {
        response.status(403).json({ error: 'Access denied' });
        return;
      }

      const uid = request.url?.split('/')[4]; // Extract UID from URL path
      const { adjustment, setAbsolute } = request.body;

      if (typeof adjustment !== 'number') {
        response.status(400).json({ error: 'Invalid adjustment value' });
        return;
      }

      console.log(`Admin: ${setAbsolute ? 'Setting' : 'Adjusting'} credits for user ${uid} ${setAbsolute ? 'to' : 'by'} ${adjustment}`);

      // Get current user first
      const userDoc = await db.collection('users').doc(uid).get();
      if (!userDoc.exists) {
        response.status(404).json({ error: 'User not found' });
        return;
      }

      const userData = userDoc.data();
      const currentCredits = userData?.credits || 25;
      
      // Either set absolute value or adjust relative to current
      const newCredits = setAbsolute ? Math.max(0, adjustment) : Math.max(0, currentCredits + adjustment);

      console.log(`Credits change: ${currentCredits} → ${newCredits} (${setAbsolute ? 'absolute' : 'relative'})`);

      // Update in Firestore
      await db.collection('users').doc(uid).update({
        credits: newCredits,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      const updatedDoc = await db.collection('users').doc(uid).get();
      const updatedData = updatedDoc.data();

      console.log(`Credits updated: ${updatedData?.email} now has ${updatedData?.credits} credits`);

      // Return formatted user data
      const responseUser = {
        uid: uid,
        email: updatedData?.email || '',
        displayName: updatedData?.displayName || updatedData?.email?.split('@')[0] || 'Unknown',
        photoURL: updatedData?.profileImageUrl || null,
        createdAt: updatedData?.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        lastSignIn: updatedData?.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
        credits: updatedData?.credits || 0,
        subscriptionStatus: updatedData?.subscription === 'premium' ? 'active' : 'trial'
      };

      response.json(responseUser);

    } catch (error) {
      console.error('Error adjusting credits:', error);
      response.status(500).json({ error: 'Failed to adjust credits' });
    }
  });
});