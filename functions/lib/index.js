"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAdjustCredits = exports.adminGetUsers = exports.getSubscriptionStatus = exports.firebaseSignin = exports.generateTip = exports.chat = void 0;
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
const admin = __importStar(require("firebase-admin"));
const openai_1 = __importDefault(require("openai"));
const cors_1 = __importDefault(require("cors"));
// Set global options for all functions
(0, v2_1.setGlobalOptions)({ maxInstances: 10 });
// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();
// Initialize CORS
const corsHandler = (0, cors_1.default)({ origin: true });
// Initialize OpenAI
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
// Helper function to verify admin access
async function verifyAdmin(request) {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return false;
        }
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        return decodedToken.email === 'joecmartineau@gmail.com';
    }
    catch (error) {
        console.error('Admin verification error:', error);
        return false;
    }
}
// Helper function to sanitize input
function sanitizeForPrompt(input) {
    if (!input && input !== 0)
        return '';
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
// Chat endpoint - enhanced version with credit management and admin support
exports.chat = (0, https_1.onRequest)(async (request, response) => {
    return corsHandler(request, response, async () => {
        var _a, _b;
        try {
            if (request.method !== 'POST') {
                response.status(405).json({ error: 'Method not allowed' });
                return;
            }
            const { message, familyContext, userUid, conversationSummary, recentMessages, isQuestionnaire } = request.body;
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
                            user = Object.assign({ id: adminDoc.docs[0].id }, adminDoc.docs[0].data());
                            isAdmin = true;
                            console.log('Admin user detected via fallback lookup - unlimited access');
                        }
                        else {
                            return response.status(404).json({ error: 'User not found' });
                        }
                    }
                    else {
                        user = Object.assign({ id: userDoc.id }, userDoc.data());
                        isAdmin = user.email === 'joecmartineau@gmail.com';
                    }
                    // Only check credits for non-admin users
                    if (!isAdmin && user.credits <= 0) {
                        return response.status(403).json({
                            error: 'No credits remaining',
                            message: 'You have no credits left. Please upgrade to continue chatting.'
                        });
                    }
                    console.log(`User ${(user === null || user === void 0 ? void 0 : user.email) || userUid} has ${(user === null || user === void 0 ? void 0 : user.credits) || 'unlimited'} credits before chat${isAdmin ? ' (ADMIN - unlimited access)' : ''}`);
                }
                catch (error) {
                    console.error('Error fetching user:', error);
                }
            }
            // Build system prompt with family context
            let systemPrompt;
            if (isAdmin) {
                systemPrompt = `You are Senali, an AI assistant with full capabilities. You can discuss any topic without restrictions. Be helpful, informative, and conversational. You have access to GPT-4o and can provide detailed, comprehensive responses on any subject the user wants to explore.`;
            }
            else {
                systemPrompt = SYSTEM_PROMPT;
            }
            if (familyContext && familyContext.length > 0) {
                systemPrompt += `\n\nFamily Context:\n`;
                familyContext.forEach((member) => {
                    systemPrompt += `- ${sanitizeForPrompt(member.name)} (${sanitizeForPrompt(member.relationship)})`;
                    if (member.age)
                        systemPrompt += `, age ${sanitizeForPrompt(member.age)}`;
                    if (member.medicalDiagnoses)
                        systemPrompt += `, diagnoses: ${sanitizeForPrompt(member.medicalDiagnoses)}`;
                    systemPrompt += `\n`;
                });
            }
            // Add conversation summary if available
            if (conversationSummary) {
                systemPrompt += `\n\nPrevious Conversation Summary:\n${sanitizeForPrompt(conversationSummary)}`;
            }
            // Build messages array with recent context
            const messages = [{ role: 'system', content: systemPrompt }];
            // Add recent messages for immediate context (last 10 messages)
            if (recentMessages && recentMessages.length > 0) {
                const contextMessages = recentMessages.slice(0, -1);
                messages.push(...contextMessages);
            }
            // Add the current user message
            messages.push({ role: 'user', content: message });
            // Handle questionnaire analysis differently
            const modelToUse = isQuestionnaire ? 'gpt-4o' : (isAdmin ? 'gpt-4o' : 'gpt-3.5-turbo');
            const maxTokens = isQuestionnaire ? 1000 : (isAdmin ? 1000 : 500);
            const temperature = isQuestionnaire ? 0.3 : (isAdmin ? 0.8 : 0.7);
            const completion = await openai.chat.completions.create({
                model: modelToUse,
                messages: messages,
                max_tokens: maxTokens,
                temperature: temperature,
                response_format: isQuestionnaire ? { type: "json_object" } : undefined
            });
            const aiResponse = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "I'm sorry, I couldn't generate a response right now.";
            console.log('OpenAI response received');
            // Deduct credit for non-admin users
            let updatedCredits = user === null || user === void 0 ? void 0 : user.credits;
            if (user && !isAdmin) {
                const newCredits = Math.max(0, user.credits - 1);
                await db.collection('users').doc(user.id).update({
                    credits: newCredits,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                updatedCredits = newCredits;
                console.log(`Credit deducted: ${user.email} now has ${newCredits} credits`);
            }
            response.json({
                response: aiResponse,
                creditsRemaining: isAdmin ? 999999 : updatedCredits
            });
        }
        catch (error) {
            console.error('Chat API error:', error);
            if (error.code === 'insufficient_quota') {
                response.status(429).json({
                    error: 'AI service temporarily unavailable. Please try again later.'
                });
            }
            else if (error.code === 'invalid_api_key') {
                response.status(500).json({
                    error: 'AI service configuration error. Please contact support.'
                });
            }
            else {
                response.status(500).json({
                    error: 'Failed to get AI response. Please try again.'
                });
            }
        }
    });
});
// Tips generation endpoint
exports.generateTip = (0, https_1.onRequest)(async (request, response) => {
    return corsHandler(request, response, async () => {
        var _a, _b, _c;
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
            const tipContent = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || 'Take time today to really listen to your child without offering solutions. Sometimes they just need to be heard.';
            // Parse title and content from response
            const lines = tipContent.split('\n').filter(line => line.trim());
            const title = ((_c = lines[0]) === null || _c === void 0 ? void 0 : _c.replace(/^(Title:|Tip:)/i, '').trim()) || 'Daily Parenting Reminder';
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
        }
        catch (error) {
            console.error('Tip generation error:', error);
            response.status(500).json({
                error: 'Failed to generate tip',
                details: error.message || 'Unknown error'
            });
        }
    });
});
// Helper function to determine age range from child age
function getAgeRange(age) {
    if (!age)
        return 'all ages';
    if (age <= 3)
        return '0-3';
    if (age <= 6)
        return '3-6';
    if (age <= 12)
        return '7-12';
    if (age <= 18)
        return '13-18';
    return 'adult';
}
// Firebase Auth Sign-in endpoint
exports.firebaseSignin = (0, https_1.onRequest)(async (request, response) => {
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
            }
            else {
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
                    email: (userData === null || userData === void 0 ? void 0 : userData.email) || email,
                    displayName: (userData === null || userData === void 0 ? void 0 : userData.displayName) || displayName,
                    credits: (userData === null || userData === void 0 ? void 0 : userData.credits) || 25,
                    subscription: (userData === null || userData === void 0 ? void 0 : userData.subscription) || 'free'
                }
            });
        }
        catch (error) {
            console.error('Firebase signin error:', error);
            response.status(500).json({ error: 'Failed to sign in user' });
        }
    });
});
// Get subscription status
exports.getSubscriptionStatus = (0, https_1.onRequest)(async (request, response) => {
    return corsHandler(request, response, async () => {
        var _a;
        try {
            if (request.method !== 'GET') {
                response.status(405).json({ error: 'Method not allowed' });
                return;
            }
            const uid = (_a = request.url) === null || _a === void 0 ? void 0 : _a.split('/').pop();
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
                credits: (userData === null || userData === void 0 ? void 0 : userData.credits) || 0,
                subscription: (userData === null || userData === void 0 ? void 0 : userData.subscription) || 'free',
                subscriptionStatus: (userData === null || userData === void 0 ? void 0 : userData.subscription) === 'premium' ? 'active' : 'trial'
            });
        }
        catch (error) {
            console.error('Get subscription status error:', error);
            response.status(500).json({ error: 'Failed to get subscription status' });
        }
    });
});
// Admin: Get all users
exports.adminGetUsers = (0, https_1.onRequest)(async (request, response) => {
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
                var _a, _b, _c, _d, _e, _f, _g;
                const data = doc.data();
                return {
                    uid: doc.id,
                    email: data.email || '',
                    displayName: data.displayName || ((_a = data.email) === null || _a === void 0 ? void 0 : _a.split('@')[0]) || 'Unknown',
                    photoURL: data.profileImageUrl || null,
                    createdAt: ((_c = (_b = data.createdAt) === null || _b === void 0 ? void 0 : _b.toDate()) === null || _c === void 0 ? void 0 : _c.toISOString()) || new Date().toISOString(),
                    lastSignIn: ((_e = (_d = data.updatedAt) === null || _d === void 0 ? void 0 : _d.toDate()) === null || _e === void 0 ? void 0 : _e.toISOString()) || ((_g = (_f = data.createdAt) === null || _f === void 0 ? void 0 : _f.toDate()) === null || _g === void 0 ? void 0 : _g.toISOString()) || new Date().toISOString(),
                    credits: data.credits || 25,
                    subscriptionStatus: data.subscription === 'premium' ? 'premium' : 'free'
                };
            });
            console.log(`Found ${users.length} users`);
            response.json({ users, totalCount: users.length });
        }
        catch (error) {
            console.error('Error fetching users:', error);
            response.status(500).json({ error: 'Failed to fetch users' });
        }
    });
});
// Admin: Adjust user credits
exports.adminAdjustCredits = (0, https_1.onRequest)(async (request, response) => {
    return corsHandler(request, response, async () => {
        var _a, _b, _c, _d, _e, _f;
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
            const uid = (_a = request.url) === null || _a === void 0 ? void 0 : _a.split('/')[4]; // Extract UID from URL path
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
            const currentCredits = (userData === null || userData === void 0 ? void 0 : userData.credits) || 25;
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
            console.log(`Credits updated: ${updatedData === null || updatedData === void 0 ? void 0 : updatedData.email} now has ${updatedData === null || updatedData === void 0 ? void 0 : updatedData.credits} credits`);
            // Return formatted user data
            const responseUser = {
                uid: uid,
                email: (updatedData === null || updatedData === void 0 ? void 0 : updatedData.email) || '',
                displayName: (updatedData === null || updatedData === void 0 ? void 0 : updatedData.displayName) || ((_b = updatedData === null || updatedData === void 0 ? void 0 : updatedData.email) === null || _b === void 0 ? void 0 : _b.split('@')[0]) || 'Unknown',
                photoURL: (updatedData === null || updatedData === void 0 ? void 0 : updatedData.profileImageUrl) || null,
                createdAt: ((_d = (_c = updatedData === null || updatedData === void 0 ? void 0 : updatedData.createdAt) === null || _c === void 0 ? void 0 : _c.toDate()) === null || _d === void 0 ? void 0 : _d.toISOString()) || new Date().toISOString(),
                lastSignIn: ((_f = (_e = updatedData === null || updatedData === void 0 ? void 0 : updatedData.updatedAt) === null || _e === void 0 ? void 0 : _e.toDate()) === null || _f === void 0 ? void 0 : _f.toISOString()) || new Date().toISOString(),
                credits: (updatedData === null || updatedData === void 0 ? void 0 : updatedData.credits) || 0,
                subscriptionStatus: (updatedData === null || updatedData === void 0 ? void 0 : updatedData.subscription) === 'premium' ? 'active' : 'trial'
            };
            response.json(responseUser);
        }
        catch (error) {
            console.error('Error adjusting credits:', error);
            response.status(500).json({ error: 'Failed to adjust credits' });
        }
    });
});
//# sourceMappingURL=index.js.map