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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseSignin = exports.chat = exports.deleteFamilyProfile = exports.createFamilyProfile = exports.getFamilyProfiles = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const cors_1 = __importDefault(require("cors"));
const openai_1 = __importDefault(require("openai"));
// Initialize Firebase Admin
admin.initializeApp();
// Initialize OpenAI
const openai = new openai_1.default({
    apiKey: ((_a = functions.config().openai) === null || _a === void 0 ? void 0 : _a.key) || process.env.OPENAI_API_KEY,
});
// CORS configuration
const corsHandler = (0, cors_1.default)({ origin: true });
// Get all family profiles for user
exports.getFamilyProfiles = functions.https.onRequest((req, res) => {
    return corsHandler(req, res, async () => {
        var _a;
        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        try {
            // Get user ID from Firebase Auth token
            const idToken = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split('Bearer ')[1];
            let userId = 'demo-user'; // Default for demo
            if (idToken) {
                try {
                    const decodedToken = await admin.auth().verifyIdToken(idToken);
                    userId = decodedToken.uid;
                }
                catch (authError) {
                    console.log('Auth verification failed, using demo user');
                }
            }
            // Get profiles from Firestore
            const profilesSnapshot = await admin.firestore()
                .collection('childProfiles')
                .where('userId', '==', userId)
                .get();
            const profiles = profilesSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            console.log(`Found ${profiles.length} profiles for user ${userId}`);
            return res.json(profiles);
        }
        catch (error) {
            console.error('Error getting family profiles:', error);
            return res.status(500).json({ error: 'Failed to get profiles' });
        }
    });
});
// Create family profile
exports.createFamilyProfile = functions.https.onRequest((req, res) => {
    return corsHandler(req, res, async () => {
        var _a;
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        try {
            // Get user ID from Firebase Auth token
            const idToken = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split('Bearer ')[1];
            let userId = 'demo-user'; // Default for demo
            if (idToken) {
                try {
                    const decodedToken = await admin.auth().verifyIdToken(idToken);
                    userId = decodedToken.uid;
                }
                catch (authError) {
                    console.log('Auth verification failed, using demo user');
                }
            }
            const profileData = Object.assign(Object.assign({}, req.body), { userId, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
            // Add profile to Firestore
            const docRef = await admin.firestore()
                .collection('childProfiles')
                .add(profileData);
            const createdProfile = await docRef.get();
            const profile = Object.assign({ id: createdProfile.id }, createdProfile.data());
            console.log(`Created profile for ${profileData.childName}`);
            return res.status(201).json(profile);
        }
        catch (error) {
            console.error('Error creating family profile:', error);
            return res.status(500).json({ error: 'Failed to create profile' });
        }
    });
});
// Delete family profile
exports.deleteFamilyProfile = functions.https.onRequest((req, res) => {
    return corsHandler(req, res, async () => {
        var _a, _b;
        if (req.method !== 'DELETE') {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        try {
            const profileId = req.path.split('/').pop();
            if (!profileId) {
                return res.status(400).json({ error: 'Profile ID required' });
            }
            // Get user ID from Firebase Auth token
            const idToken = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split('Bearer ')[1];
            let userId = 'demo-user'; // Default for demo
            if (idToken) {
                try {
                    const decodedToken = await admin.auth().verifyIdToken(idToken);
                    userId = decodedToken.uid;
                }
                catch (authError) {
                    console.log('Auth verification failed, using demo user');
                }
            }
            // Verify ownership
            const profileDoc = await admin.firestore()
                .collection('childProfiles')
                .doc(profileId)
                .get();
            if (!profileDoc.exists || ((_b = profileDoc.data()) === null || _b === void 0 ? void 0 : _b.userId) !== userId) {
                return res.status(404).json({ error: 'Profile not found' });
            }
            // Delete profile
            await admin.firestore()
                .collection('childProfiles')
                .doc(profileId)
                .delete();
            console.log(`Deleted profile ${profileId}`);
            return res.json({ success: true });
        }
        catch (error) {
            console.error('Error deleting family profile:', error);
            return res.status(500).json({ error: 'Failed to delete profile' });
        }
    });
});
// Chat function
exports.chat = functions.https.onRequest((req, res) => {
    return corsHandler(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        try {
            const { message, familyContext } = req.body;
            if (!message) {
                return res.status(400).json({ error: 'Message is required' });
            }
            // Build family context for Senali
            let contextText = '';
            if (familyContext && familyContext.length > 0) {
                contextText = `## Family Members:\n\n`;
                familyContext.forEach((member, index) => {
                    contextText += `### ${index + 1}. ${member.name}\n`;
                    if (member.age)
                        contextText += `- **Age**: ${member.age}\n`;
                    if (member.relationship)
                        contextText += `- **Relationship**: ${member.relationship}\n`;
                    if (member.medicalInfo)
                        contextText += `- **Medical Info**: ${member.medicalInfo}\n`;
                    contextText += '\n';
                });
            }
            // System prompt for Senali
            const systemPrompt = `You are Senali, an AI parenting coach and friend companion. You provide empathetic conversation, active listening, and supportive guidance for parents.

${contextText}

Key guidelines:
- Use simple, everyday language at a 7th grade reading level
- Be warm, empathetic, and supportive
- Ask thoughtful follow-up questions to learn more about the family
- Reference family details naturally in conversation
- Provide practical parenting advice and emotional support
- Never provide medical diagnoses, but offer supportive guidance

Respond naturally and conversationally to help this parent feel heard and supported.`;
            // Call OpenAI
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                temperature: 0.7,
                max_tokens: 1000
            });
            const aiResponse = completion.choices[0].message.content;
            return res.json({
                message: aiResponse,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('Chat error:', error);
            return res.status(500).json({ error: 'Failed to process chat message' });
        }
    });
});
// Firebase signin function
exports.firebaseSignin = functions.https.onRequest((req, res) => {
    return corsHandler(req, res, async () => {
        var _a, _b, _c, _d;
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        try {
            const { uid, email, displayName, photoURL } = req.body;
            if (!uid || !email) {
                return res.status(400).json({ error: 'Missing required user data' });
            }
            // Check if user exists in Firestore
            const userDoc = await admin.firestore()
                .collection('users')
                .doc(uid)
                .get();
            if (!userDoc.exists) {
                // Create new user with starting credits
                await admin.firestore()
                    .collection('users')
                    .doc(uid)
                    .set({
                    email,
                    displayName: displayName || email.split('@')[0],
                    photoURL: photoURL || null,
                    credits: 25,
                    subscription: 'free',
                    subscriptionStatus: 'inactive',
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log('Created new user:', email);
            }
            else {
                // Update existing user
                await admin.firestore()
                    .collection('users')
                    .doc(uid)
                    .update({
                    displayName: displayName || ((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.displayName),
                    photoURL: photoURL || ((_b = userDoc.data()) === null || _b === void 0 ? void 0 : _b.photoURL),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log('Updated existing user:', email);
            }
            const updatedUser = await admin.firestore()
                .collection('users')
                .doc(uid)
                .get();
            return res.json({
                success: true,
                user: {
                    uid,
                    email,
                    hasCompletedProfile: ((_c = updatedUser.data()) === null || _c === void 0 ? void 0 : _c.hasCompletedProfile) || false,
                    fullName: ((_d = updatedUser.data()) === null || _d === void 0 ? void 0 : _d.fullName) || null
                }
            });
        }
        catch (error) {
            console.error('Firebase signin error:', error);
            return res.status(500).json({ error: 'Failed to process signin' });
        }
    });
});
//# sourceMappingURL=index.js.map