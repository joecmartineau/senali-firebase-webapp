import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import cors from 'cors';
import OpenAI from 'openai';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: functions.config().openai?.key || process.env.OPENAI_API_KEY,
});

// CORS configuration
const corsHandler = cors({ origin: true });

// Get all family profiles for user
export const getFamilyProfiles = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      // Get user ID from Firebase Auth token
      const idToken = req.headers.authorization?.split('Bearer ')[1];
      let userId = 'demo-user'; // Default for demo
      
      if (idToken) {
        try {
          const decodedToken = await admin.auth().verifyIdToken(idToken);
          userId = decodedToken.uid;
        } catch (authError) {
          console.log('Auth verification failed, using demo user');
        }
      }

      // Get profiles from Firestore
      const profilesSnapshot = await admin.firestore()
        .collection('familyProfiles')
        .where('userId', '==', userId)
        .get();

      const profiles = profilesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`Found ${profiles.length} profiles for user ${userId}`);
      return res.json(profiles);
    } catch (error) {
      console.error('Error getting family profiles:', error);
      return res.status(500).json({ error: 'Failed to get profiles' });
    }
  });
});

// Create family profile
export const createFamilyProfile = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      // Get user ID from Firebase Auth token
      const idToken = req.headers.authorization?.split('Bearer ')[1];
      let userId = 'demo-user'; // Default for demo
      
      if (idToken) {
        try {
          const decodedToken = await admin.auth().verifyIdToken(idToken);
          userId = decodedToken.uid;
        } catch (authError) {
          console.log('Auth verification failed, using demo user');
        }
      }

      const profileData = {
        ...req.body,
        userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // Add profile to Firestore
      const docRef = await admin.firestore()
        .collection('familyProfiles')
        .add(profileData);

      const createdProfile = await docRef.get();
      const profile = {
        id: createdProfile.id,
        ...createdProfile.data()
      };

      console.log(`Created profile for ${profileData.childName}`);
      return res.status(201).json(profile);
    } catch (error) {
      console.error('Error creating family profile:', error);
      return res.status(500).json({ error: 'Failed to create profile' });
    }
  });
});

// Delete family profile
export const deleteFamilyProfile = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    if (req.method !== 'DELETE') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const profileId = req.path.split('/').pop();
      if (!profileId) {
        return res.status(400).json({ error: 'Profile ID required' });
      }

      // Get user ID from Firebase Auth token
      const idToken = req.headers.authorization?.split('Bearer ')[1];
      let userId = 'demo-user'; // Default for demo
      
      if (idToken) {
        try {
          const decodedToken = await admin.auth().verifyIdToken(idToken);
          userId = decodedToken.uid;
        } catch (authError) {
          console.log('Auth verification failed, using demo user');
        }
      }

      // Verify ownership
      const profileDoc = await admin.firestore()
        .collection('familyProfiles')
        .doc(profileId)
        .get();

      if (!profileDoc.exists || profileDoc.data()?.userId !== userId) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      // Delete profile
      await admin.firestore()
        .collection('childProfiles')
        .doc(profileId)
        .delete();

      console.log(`Deleted profile ${profileId}`);
      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting family profile:', error);
      return res.status(500).json({ error: 'Failed to delete profile' });
    }
  });
});

// Chat function
export const chat = functions.https.onRequest((req, res) => {
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
        familyContext.forEach((member: any, index: number) => {
          contextText += `### ${index + 1}. ${member.name}\n`;
          if (member.age) contextText += `- **Age**: ${member.age}\n`;
          if (member.relationship) contextText += `- **Relationship**: ${member.relationship}\n`;
          if (member.medicalInfo) contextText += `- **Medical Info**: ${member.medicalInfo}\n`;
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
    } catch (error) {
      console.error('Chat error:', error);
      return res.status(500).json({ error: 'Failed to process chat message' });
    }
  });
});

// Firebase signin function
export const firebaseSignin = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
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
      } else {
        // Update existing user
        await admin.firestore()
          .collection('users')
          .doc(uid)
          .update({
            displayName: displayName || userDoc.data()?.displayName,
            photoURL: photoURL || userDoc.data()?.photoURL,
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
          hasCompletedProfile: updatedUser.data()?.hasCompletedProfile || false,
          fullName: updatedUser.data()?.fullName || null
        }
      });
    } catch (error) {
      console.error('Firebase signin error:', error);
      return res.status(500).json({ error: 'Failed to process signin' });
    }
  });
});