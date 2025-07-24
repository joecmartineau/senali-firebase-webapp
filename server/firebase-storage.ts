import { adminDb } from './firebase-admin';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  Timestamp 
} from 'firebase-admin/firestore';
import type { 
  User, 
  InsertMessage, 
  Message, 
  InsertDailyTip, 
  DailyTip, 
  InsertTipInteraction, 
  TipInteraction,
  InsertChildProfile,
  ChildProfile,
  InsertSymptomChecklist,
  SymptomChecklist
} from '@shared/schema';

export interface IFirebaseStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: any): Promise<User>;

  // Message methods
  createMessage(insertMessage: InsertMessage): Promise<Message>;
  getUserMessages(userId: string, limit?: number): Promise<Message[]>;

  // Daily tip methods
  createDailyTip(insertTip: InsertDailyTip): Promise<DailyTip>;
  getTodaysTip(): Promise<DailyTip | undefined>;
  getRecentTips(limit?: number): Promise<DailyTip[]>;

  // Tip interaction methods
  createTipInteraction(insertInteraction: InsertTipInteraction): Promise<TipInteraction>;
  getUserTipInteraction(userId: string, tipId: string): Promise<TipInteraction | undefined>;

  // Child profile methods
  createChildProfile(insertProfile: InsertChildProfile): Promise<ChildProfile>;
  getChildProfile(userId: string, childName: string): Promise<ChildProfile | undefined>;
  getUserChildProfiles(userId: string): Promise<ChildProfile[]>;
  updateChildProfile(profileId: string, updates: Partial<ChildProfile>): Promise<void>;

  // Symptom checklist methods
  createSymptomChecklist(insertSymptoms: InsertSymptomChecklist): Promise<SymptomChecklist>;
  getSymptomChecklist(childId: string): Promise<SymptomChecklist | undefined>;
  updateSymptomChecklist(childId: string, updates: Partial<SymptomChecklist>): Promise<void>;
}

export class FirebaseStorage implements IFirebaseStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    try {
      const userDoc = await getDoc(doc(adminDb, 'users', id));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
      }
      return undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const usersRef = collection(adminDb, 'users');
      const q = query(usersRef, where('email', '==', username));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() } as User;
      }
      return undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: any): Promise<User> {
    try {
      const userData = {
        ...insertUser,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      // Use the user's ID as the document ID
      await updateDoc(doc(adminDb, 'users', insertUser.id), userData, { merge: true });
      
      return { id: insertUser.id, ...userData } as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    try {
      const messageData = {
        ...insertMessage,
        timestamp: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(adminDb, 'messages'), messageData);
      
      return {
        id: docRef.id,
        ...messageData,
        timestamp: new Date()
      } as Message;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  async getUserMessages(userId: string, limit = 50): Promise<Message[]> {
    try {
      const messagesRef = collection(adminDb, 'messages');
      const q = query(
        messagesRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        firestoreLimit(limit)
      );
      
      const querySnapshot = await getDocs(q);
      const messages: Message[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        } as Message);
      });
      
      return messages;
    } catch (error) {
      console.error('Error getting user messages:', error);
      return [];
    }
  }

  // Daily tip methods
  async createDailyTip(insertTip: InsertDailyTip): Promise<DailyTip> {
    try {
      const tipData = {
        ...insertTip,
        date: Timestamp.now(),
        isActive: true
      };
      
      const docRef = await addDoc(collection(adminDb, 'dailyTips'), tipData);
      
      return {
        id: docRef.id,
        ...tipData,
        date: new Date()
      } as DailyTip;
    } catch (error) {
      console.error('Error creating daily tip:', error);
      throw error;
    }
  }

  async getTodaysTip(): Promise<DailyTip | undefined> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const tipsRef = collection(adminDb, 'dailyTips');
      const q = query(
        tipsRef,
        where('date', '>=', Timestamp.fromDate(today)),
        where('date', '<', Timestamp.fromDate(tomorrow)),
        where('isActive', '==', true),
        firestoreLimit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const tipDoc = querySnapshot.docs[0];
        const data = tipDoc.data();
        return {
          id: tipDoc.id,
          ...data,
          date: data.date?.toDate() || new Date()
        } as DailyTip;
      }
      
      return undefined;
    } catch (error) {
      console.error('Error getting today\'s tip:', error);
      return undefined;
    }
  }

  async getRecentTips(limit = 10): Promise<DailyTip[]> {
    try {
      const tipsRef = collection(adminDb, 'dailyTips');
      const q = query(
        tipsRef,
        where('isActive', '==', true),
        orderBy('date', 'desc'),
        firestoreLimit(limit)
      );
      
      const querySnapshot = await getDocs(q);
      const tips: DailyTip[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tips.push({
          id: doc.id,
          ...data,
          date: data.date?.toDate() || new Date()
        } as DailyTip);
      });
      
      return tips;
    } catch (error) {
      console.error('Error getting recent tips:', error);
      return [];
    }
  }

  // Tip interaction methods
  async createTipInteraction(insertInteraction: InsertTipInteraction): Promise<TipInteraction> {
    try {
      const interactionData = {
        ...insertInteraction,
        timestamp: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(adminDb, 'tipInteractions'), interactionData);
      
      return {
        id: docRef.id,
        ...interactionData,
        timestamp: new Date()
      } as TipInteraction;
    } catch (error) {
      console.error('Error creating tip interaction:', error);
      throw error;
    }
  }

  async getUserTipInteraction(userId: string, tipId: string): Promise<TipInteraction | undefined> {
    try {
      const interactionsRef = collection(adminDb, 'tipInteractions');
      const q = query(
        interactionsRef,
        where('userId', '==', userId),
        where('tipId', '==', tipId),
        firestoreLimit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const interactionDoc = querySnapshot.docs[0];
        const data = interactionDoc.data();
        return {
          id: interactionDoc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        } as TipInteraction;
      }
      
      return undefined;
    } catch (error) {
      console.error('Error getting user tip interaction:', error);
      return undefined;
    }
  }

  // Child profile methods
  async createChildProfile(insertProfile: InsertChildProfile): Promise<ChildProfile> {
    try {
      const profileData = {
        ...insertProfile,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(adminDb, 'childProfiles'), profileData);
      
      return {
        id: docRef.id,
        ...profileData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as ChildProfile;
    } catch (error) {
      console.error('Error creating child profile:', error);
      throw error;
    }
  }

  async getChildProfile(userId: string, childName: string): Promise<ChildProfile | undefined> {
    try {
      const profilesRef = collection(adminDb, 'childProfiles');
      const q = query(
        profilesRef,
        where('userId', '==', userId),
        where('childName', '==', childName),
        firestoreLimit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const profileDoc = querySnapshot.docs[0];
        const data = profileDoc.data();
        return {
          id: profileDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as ChildProfile;
      }
      
      return undefined;
    } catch (error) {
      console.error('Error getting child profile:', error);
      return undefined;
    }
  }

  async getUserChildProfiles(userId: string): Promise<ChildProfile[]> {
    try {
      const profilesRef = collection(adminDb, 'childProfiles');
      const q = query(
        profilesRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const profiles: ChildProfile[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        profiles.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as ChildProfile);
      });
      
      return profiles;
    } catch (error) {
      console.error('Error getting user child profiles:', error);
      return [];
    }
  }

  async updateChildProfile(profileId: string, updates: Partial<ChildProfile>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(doc(adminDb, 'childProfiles', profileId), updateData);
    } catch (error) {
      console.error('Error updating child profile:', error);
      throw error;
    }
  }

  // Symptom checklist methods
  async createSymptomChecklist(insertSymptoms: InsertSymptomChecklist): Promise<SymptomChecklist> {
    try {
      const symptomsData = {
        ...insertSymptoms,
        lastUpdated: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(adminDb, 'symptomChecklists'), symptomsData);
      
      return {
        id: docRef.id,
        ...symptomsData,
        lastUpdated: new Date()
      } as SymptomChecklist;
    } catch (error) {
      console.error('Error creating symptom checklist:', error);
      throw error;
    }
  }

  async getSymptomChecklist(childId: string): Promise<SymptomChecklist | undefined> {
    try {
      const symptomsRef = collection(adminDb, 'symptomChecklists');
      const q = query(
        symptomsRef,
        where('childId', '==', childId),
        firestoreLimit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const symptomsDoc = querySnapshot.docs[0];
        const data = symptomsDoc.data();
        return {
          id: symptomsDoc.id,
          ...data,
          lastUpdated: data.lastUpdated?.toDate() || new Date()
        } as SymptomChecklist;
      }
      
      return undefined;
    } catch (error) {
      console.error('Error getting symptom checklist:', error);
      return undefined;
    }
  }

  async updateSymptomChecklist(childId: string, updates: Partial<SymptomChecklist>): Promise<void> {
    try {
      // First find the document by childId
      const symptomsRef = collection(adminDb, 'symptomChecklists');
      const q = query(
        symptomsRef,
        where('childId', '==', childId),
        firestoreLimit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const symptomsDoc = querySnapshot.docs[0];
        const updateData = {
          ...updates,
          lastUpdated: Timestamp.now()
        };
        
        await updateDoc(doc(adminDb, 'symptomChecklists', symptomsDoc.id), updateData);
      } else {
        // Create new if doesn't exist
        await this.createSymptomChecklist({
          childId,
          ...updates
        } as InsertSymptomChecklist);
      }
    } catch (error) {
      console.error('Error updating symptom checklist:', error);
      throw error;
    }
  }
}

export const firebaseStorage = new FirebaseStorage();