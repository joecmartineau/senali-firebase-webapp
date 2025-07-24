// Local IndexedDB storage for all user data
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  userId: string;
}

interface ChildProfile {
  id: string;
  userId: string;
  childName: string;
  age?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  existingDiagnoses?: string[];
  currentChallenges?: string[];
  currentStrengths?: string[];
  schoolGrade?: string;
  schoolType?: string;
  hasIEP?: boolean;
  has504Plan?: boolean;
  currentTherapies?: string[];
  currentMedications?: string[];
  parentGoals?: string[];
  sensoryNeeds?: string;
  communicationStyle?: string;
  familyStructure?: string;
  siblings?: string;
  parentNotes?: string;
  senaliObservations?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SymptomChecklist {
  id: string;
  childId: string;
  
  // Attention & Focus
  difficultyPayingAttention?: boolean;
  easilyDistracted?: boolean;
  difficultyFinishingTasks?: boolean;
  forgetfulInDailyActivities?: boolean;
  losesThingsFrequently?: boolean;
  avoidsTasksRequiringMentalEffort?: boolean;
  difficultyListeningWhenSpokenTo?: boolean;
  difficultyFollowingInstructions?: boolean;
  difficultyOrganizingTasks?: boolean;
  
  // Hyperactivity & Impulsivity
  fidgetsOrSquirms?: boolean;
  difficultyStayingSeated?: boolean;
  excessiveRunningOrClimbing?: boolean;
  difficultyPlayingQuietly?: boolean;
  talksExcessively?: boolean;
  blurtsOutAnswers?: boolean;
  difficultyWaitingTurn?: boolean;
  interruptsOrIntrudes?: boolean;
  
  // Social Communication
  socialEmotionalReciprocity?: boolean;
  nonverbalCommunication?: boolean;
  developingMaintainingRelationships?: boolean;
  
  // Restricted Interests & Repetitive Behaviors
  restrictedFixatedInterests?: boolean;
  insistenceOnSameness?: boolean;
  stereotypedRepetitiveMotor?: boolean;
  
  // Sensory Processing
  sensoryReactivity?: boolean;
  
  // Emotional Regulation
  frequentMeltdowns?: boolean;
  chronicAngerIrritability?: boolean;
  argumentativeDefiantBehavior?: boolean;
  
  lastUpdated: Date;
}

interface UserProfile {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  preferences?: {
    notifications?: boolean;
    dataSharing?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

class LocalStorage {
  private dbName = 'SenaliDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('messages')) {
          const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
          messageStore.createIndex('userId', 'userId', { unique: false });
          messageStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('childProfiles')) {
          const profileStore = db.createObjectStore('childProfiles', { keyPath: 'id' });
          profileStore.createIndex('userId', 'userId', { unique: false });
          profileStore.createIndex('childName', 'childName', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('symptomChecklists')) {
          const symptomStore = db.createObjectStore('symptomChecklists', { keyPath: 'id' });
          symptomStore.createIndex('childId', 'childId', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('userProfiles')) {
          db.createObjectStore('userProfiles', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('dailyTips')) {
          const tipStore = db.createObjectStore('dailyTips', { keyPath: 'id' });
          tipStore.createIndex('date', 'date', { unique: false });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // Message methods
  async saveMessage(message: Omit<Message, 'id'>): Promise<Message> {
    const db = await this.ensureDB();
    const messageWithId: Message = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['messages'], 'readwrite');
      const store = transaction.objectStore('messages');
      const request = store.add(messageWithId);
      
      request.onsuccess = () => resolve(messageWithId);
      request.onerror = () => reject(request.error);
    });
  }

  async getMessages(userId: string, limit = 200): Promise<Message[]> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['messages'], 'readonly');
      const store = transaction.objectStore('messages');
      const index = store.index('userId');
      const request = index.getAll(userId);
      
      request.onsuccess = () => {
        const messages = request.result
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, limit);
        resolve(messages);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Child profile methods
  async saveChildProfile(profile: Omit<ChildProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChildProfile> {
    const db = await this.ensureDB();
    
    // Check if profile exists
    const existing = await this.getChildProfile(profile.userId, profile.childName);
    
    if (existing) {
      // Update existing
      const updatedProfile: ChildProfile = {
        ...existing,
        ...profile,
        updatedAt: new Date()
      };
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['childProfiles'], 'readwrite');
        const store = transaction.objectStore('childProfiles');
        const request = store.put(updatedProfile);
        
        request.onsuccess = () => resolve(updatedProfile);
        request.onerror = () => reject(request.error);
      });
    } else {
      // Create new
      const newProfile: ChildProfile = {
        ...profile,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['childProfiles'], 'readwrite');
        const store = transaction.objectStore('childProfiles');
        const request = store.add(newProfile);
        
        request.onsuccess = () => resolve(newProfile);
        request.onerror = () => reject(request.error);
      });
    }
  }

  async getChildProfile(userId: string, childName: string): Promise<ChildProfile | undefined> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['childProfiles'], 'readonly');
      const store = transaction.objectStore('childProfiles');
      const index = store.index('userId');
      const request = index.getAll(userId);
      
      request.onsuccess = () => {
        const profile = request.result.find(p => p.childName === childName);
        resolve(profile);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getChildProfiles(userId: string): Promise<ChildProfile[]> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['childProfiles'], 'readonly');
      const store = transaction.objectStore('childProfiles');
      const index = store.index('userId');
      const request = index.getAll(userId);
      
      request.onsuccess = () => {
        const profiles = request.result.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        resolve(profiles);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Symptom checklist methods
  async saveSymptomChecklist(symptoms: Omit<SymptomChecklist, 'id' | 'lastUpdated'>): Promise<SymptomChecklist> {
    const db = await this.ensureDB();
    
    // Check if checklist exists
    const existing = await this.getSymptomChecklist(symptoms.childId);
    
    if (existing) {
      // Update existing
      const updatedSymptoms: SymptomChecklist = {
        ...existing,
        ...symptoms,
        lastUpdated: new Date()
      };
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['symptomChecklists'], 'readwrite');
        const store = transaction.objectStore('symptomChecklists');
        const request = store.put(updatedSymptoms);
        
        request.onsuccess = () => resolve(updatedSymptoms);
        request.onerror = () => reject(request.error);
      });
    } else {
      // Create new
      const newSymptoms: SymptomChecklist = {
        ...symptoms,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        lastUpdated: new Date()
      };
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['symptomChecklists'], 'readwrite');
        const store = transaction.objectStore('symptomChecklists');
        const request = store.add(newSymptoms);
        
        request.onsuccess = () => resolve(newSymptoms);
        request.onerror = () => reject(request.error);
      });
    }
  }

  async getSymptomChecklist(childId: string): Promise<SymptomChecklist | undefined> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['symptomChecklists'], 'readonly');
      const store = transaction.objectStore('symptomChecklists');
      const index = store.index('childId');
      const request = index.get(childId);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // User profile methods
  async saveUserProfile(user: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
    const db = await this.ensureDB();
    
    const userProfile: UserProfile = {
      ...user,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['userProfiles'], 'readwrite');
      const store = transaction.objectStore('userProfiles');
      const request = store.put(userProfile);
      
      request.onsuccess = () => resolve(userProfile);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['userProfiles'], 'readonly');
      const store = transaction.objectStore('userProfiles');
      const request = store.get(userId);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Daily tip methods
  async saveDailyTip(tip: { title: string; content: string; category?: string }): Promise<any> {
    const db = await this.ensureDB();
    
    const dailyTip = {
      id: Date.now().toString(),
      ...tip,
      date: new Date(),
      isActive: true
    };
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['dailyTips'], 'readwrite');
      const store = transaction.objectStore('dailyTips');
      const request = store.add(dailyTip);
      
      request.onsuccess = () => resolve(dailyTip);
      request.onerror = () => reject(request.error);
    });
  }

  async getTodaysTip(): Promise<any> {
    const db = await this.ensureDB();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['dailyTips'], 'readonly');
      const store = transaction.objectStore('dailyTips');
      const index = store.index('date');
      const request = index.getAll();
      
      request.onsuccess = () => {
        const tips = request.result.filter(tip => {
          const tipDate = new Date(tip.date);
          return tipDate >= today && tipDate < tomorrow && tip.isActive;
        });
        resolve(tips[0] || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Export/Import methods for data portability
  async exportAllData(): Promise<any> {
    const db = await this.ensureDB();
    const data: any = {};
    
    const stores = ['messages', 'childProfiles', 'symptomChecklists', 'userProfiles', 'dailyTips'];
    
    for (const storeName of stores) {
      await new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          data[storeName] = request.result;
          resolve(data);
        };
        request.onerror = () => reject(request.error);
      });
    }
    
    return data;
  }

  // Clear only chat messages, preserving all profile data
  async clearChatHistory(): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(['messages'], 'readwrite');
      const store = transaction.objectStore('messages');
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Clear all data including profiles (for complete reset)
  async clearAllData(): Promise<void> {
    const db = await this.ensureDB();
    const stores = ['messages', 'childProfiles', 'symptomChecklists', 'userProfiles', 'dailyTips'];
    
    for (const storeName of stores) {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }
}

export const localStorage = new LocalStorage();
export type { Message, ChildProfile, SymptomChecklist, UserProfile };