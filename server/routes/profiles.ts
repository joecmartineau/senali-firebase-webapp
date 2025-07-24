import { Router } from 'express';
import { db } from '../db';
import { childProfiles, symptomChecklists } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

// Get all child profiles for the authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const profiles = await db.select()
      .from(childProfiles)
      .where(eq(childProfiles.userId, userId))
      .orderBy(childProfiles.createdAt);

    // Get symptom checklists for each profile
    const profilesWithSymptoms = await Promise.all(
      profiles.map(async (profile) => {
        const [symptoms] = await db.select()
          .from(symptomChecklists)
          .where(eq(symptomChecklists.childId, profile.id));
        
        return {
          ...profile,
          symptoms: symptoms || null
        };
      })
    );

    res.json({ profiles: profilesWithSymptoms });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// Get specific child profile with symptoms
router.get('/:childName', async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const { childName } = req.params;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const [profile] = await db.select()
      .from(childProfiles)
      .where(and(
        eq(childProfiles.userId, userId),
        eq(childProfiles.childName, childName)
      ));

    if (!profile) {
      return res.status(404).json({ error: 'Child profile not found' });
    }

    // Get symptom checklist
    const [symptoms] = await db.select()
      .from(symptomChecklists)
      .where(eq(symptomChecklists.childId, profile.id));

    res.json({ 
      profile: {
        ...profile,
        symptoms: symptoms || null
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update child profile
router.patch('/:childName', async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const { childName } = req.params;
    const updates = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Find the profile
    const [profile] = await db.select()
      .from(childProfiles)
      .where(and(
        eq(childProfiles.userId, userId),
        eq(childProfiles.childName, childName)
      ));

    if (!profile) {
      return res.status(404).json({ error: 'Child profile not found' });
    }

    // Update the profile
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    await db.update(childProfiles)
      .set(updateData)
      .where(eq(childProfiles.id, profile.id));

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update symptom checklist
router.patch('/:childName/symptoms', async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const { childName } = req.params;
    const symptomUpdates = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Find the profile
    const [profile] = await db.select()
      .from(childProfiles)
      .where(and(
        eq(childProfiles.userId, userId),
        eq(childProfiles.childName, childName)
      ));

    if (!profile) {
      return res.status(404).json({ error: 'Child profile not found' });
    }

    // Update symptoms
    const updateData = {
      ...symptomUpdates,
      lastUpdated: new Date()
    };

    // Check if symptom checklist exists
    const [existingSymptoms] = await db.select()
      .from(symptomChecklists)
      .where(eq(symptomChecklists.childId, profile.id));

    if (existingSymptoms) {
      // Update existing
      await db.update(symptomChecklists)
        .set(updateData)
        .where(eq(symptomChecklists.childId, profile.id));
    } else {
      // Create new
      await db.insert(symptomChecklists)
        .values({
          childId: profile.id,
          ...updateData
        });
    }

    res.json({ message: 'Symptoms updated successfully' });
  } catch (error) {
    console.error('Error updating symptoms:', error);
    res.status(500).json({ error: 'Failed to update symptoms' });
  }
});

export default router;