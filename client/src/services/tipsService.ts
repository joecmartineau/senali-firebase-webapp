import { 
  collection, 
  doc, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  updateDoc,
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface DailyTip {
  id?: string;
  userId: string;
  title: string;
  content: string;
  category: 'adhd' | 'autism' | 'general' | 'behavioral' | 'educational' | 'social';
  targetAge?: string; // e.g., "3-6", "7-12", "13-18"
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: string; // e.g., "5 minutes", "15-30 minutes"
  createdAt: any;
  liked?: boolean;
  disliked?: boolean;
  bookmarked?: boolean;
  tags?: string[];
  source?: string;
  effectiveness?: number; // 1-5 rating from user feedback
}

export interface TipFeedback {
  id?: string;
  tipId: string;
  userId: string;
  rating: number; // 1-5 stars
  helpful: boolean;
  tried: boolean;
  comments?: string;
  createdAt: any;
}

class TipsService {
  private readonly tipsCollection = 'daily_tips';
  private readonly feedbackCollection = 'tip_feedback';

  // Generate daily tip for user
  async generateDailyTip(userId: string, preferences?: {
    childAge?: number;
    primaryConcerns?: string[];
    preferredCategories?: string[];
  }): Promise<DailyTip> {
    try {
      // Check if user already has a tip for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const existingTip = await this.getTodaysTip(userId);
      if (existingTip) {
        return existingTip;
      }

      // Generate new tip via API
      const tipData = await this.requestNewTip(userId, preferences);
      
      // Save to Firestore
      const tip: Omit<DailyTip, 'id'> = {
        userId,
        title: tipData.title,
        content: tipData.content,
        category: tipData.category,
        targetAge: tipData.targetAge,
        difficulty: tipData.difficulty,
        estimatedTime: tipData.estimatedTime,
        tags: tipData.tags,
        createdAt: serverTimestamp(),
        liked: false,
        disliked: false,
        bookmarked: false
      };

      const tipRef = await addDoc(collection(db, this.tipsCollection), tip);
      
      return {
        id: tipRef.id,
        ...tip
      };
    } catch (error) {
      console.error('Error generating daily tip:', error);
      throw new Error('Failed to generate daily tip. Please try again.');
    }
  }

  // Get today's tip for user
  async getTodaysTip(userId: string): Promise<DailyTip | null> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const q = query(
        collection(db, this.tipsCollection),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(today)),
        where('createdAt', '<', Timestamp.fromDate(tomorrow)),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as DailyTip;
    } catch (error) {
      console.error('Error getting today\'s tip:', error);
      return null;
    }
  }

  // Get user's tip history
  async getTipHistory(userId: string, limitCount: number = 30): Promise<DailyTip[]> {
    try {
      const q = query(
        collection(db, this.tipsCollection),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const tips: DailyTip[] = [];

      querySnapshot.forEach((doc) => {
        tips.push({
          id: doc.id,
          ...doc.data()
        } as DailyTip);
      });

      return tips;
    } catch (error) {
      console.error('Error getting tip history:', error);
      throw new Error('Failed to load tip history.');
    }
  }

  // Update tip interaction (like, dislike, bookmark)
  async updateTipInteraction(tipId: string, interaction: {
    liked?: boolean;
    disliked?: boolean;
    bookmarked?: boolean;
  }): Promise<void> {
    try {
      const tipRef = doc(db, this.tipsCollection, tipId);
      await updateDoc(tipRef, interaction);
    } catch (error) {
      console.error('Error updating tip interaction:', error);
      throw new Error('Failed to update tip interaction.');
    }
  }

  // Submit tip feedback
  async submitTipFeedback(tipId: string, userId: string, feedback: {
    rating: number;
    helpful: boolean;
    tried: boolean;
    comments?: string;
  }): Promise<void> {
    try {
      const tipFeedback: Omit<TipFeedback, 'id'> = {
        tipId,
        userId,
        rating: feedback.rating,
        helpful: feedback.helpful,
        tried: feedback.tried,
        comments: feedback.comments,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, this.feedbackCollection), tipFeedback);

      // Update tip effectiveness rating
      await this.updateTipEffectiveness(tipId, feedback.rating);
    } catch (error) {
      console.error('Error submitting tip feedback:', error);
      throw new Error('Failed to submit feedback.');
    }
  }

  // Get bookmarked tips
  async getBookmarkedTips(userId: string): Promise<DailyTip[]> {
    try {
      const q = query(
        collection(db, this.tipsCollection),
        where('userId', '==', userId),
        where('bookmarked', '==', true),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const tips: DailyTip[] = [];

      querySnapshot.forEach((doc) => {
        tips.push({
          id: doc.id,
          ...doc.data()
        } as DailyTip);
      });

      return tips;
    } catch (error) {
      console.error('Error getting bookmarked tips:', error);
      throw new Error('Failed to load bookmarked tips.');
    }
  }

  // Request new tip from API
  private async requestNewTip(userId: string, preferences?: any): Promise<{
    title: string;
    content: string;
    category: DailyTip['category'];
    targetAge?: string;
    difficulty: DailyTip['difficulty'];
    estimatedTime?: string;
    tags?: string[];
  }> {
    try {
      const response = await fetch('/api/tips/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          preferences
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate tip');
      }

      return await response.json();
    } catch (error) {
      console.error('Error requesting new tip:', error);
      throw error;
    }
  }

  // Update tip effectiveness based on user ratings
  private async updateTipEffectiveness(tipId: string, rating: number): Promise<void> {
    try {
      // Get current feedback for this tip
      const q = query(
        collection(db, this.feedbackCollection),
        where('tipId', '==', tipId)
      );

      const querySnapshot = await getDocs(q);
      let totalRating = 0;
      let count = 0;

      querySnapshot.forEach((doc) => {
        const feedback = doc.data() as TipFeedback;
        totalRating += feedback.rating;
        count++;
      });

      const averageEffectiveness = count > 0 ? totalRating / count : rating;

      // Update tip with new effectiveness rating
      const tipRef = doc(db, this.tipsCollection, tipId);
      await updateDoc(tipRef, {
        effectiveness: averageEffectiveness
      });
    } catch (error) {
      console.error('Error updating tip effectiveness:', error);
    }
  }
}

export const tipsService = new TipsService();
export default tipsService;