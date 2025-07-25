import {
  users,
  messages,
  dailyTips,
  tipInteractions,
  childProfiles,
  type User,
  type UpsertUser,
  type Message,
  type InsertMessage,
  type DailyTip,
  type InsertDailyTip,
  type TipInteraction,
  type InsertTipInteraction,
  type ChildProfile,
  type InsertChildProfile,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getUserMessages(userId: string, limit?: number): Promise<Message[]>;
  
  // Daily tips operations
  createDailyTip(tip: InsertDailyTip): Promise<DailyTip>;
  getTodaysTip(): Promise<DailyTip | undefined>;
  getRecentTips(limit?: number): Promise<DailyTip[]>;
  
  // Tip interactions
  createTipInteraction(interaction: InsertTipInteraction): Promise<TipInteraction>;
  getUserTipInteraction(userId: string, tipId: number): Promise<TipInteraction | undefined>;
  
  // Child profile operations
  createChildProfile(profile: InsertChildProfile): Promise<ChildProfile>;
  updateChildProfile(id: number, updates: Partial<InsertChildProfile>): Promise<ChildProfile>;
  getUserChildProfiles(userId: string): Promise<ChildProfile[]>;
  getChildProfile(id: number): Promise<ChildProfile | undefined>;
  deleteChildProfile(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(messageData)
      .returning();
    return message;
  }

  async getUserMessages(userId: string, limit: number = 50): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.userId, userId))
      .orderBy(desc(messages.timestamp))
      .limit(limit);
  }

  // Daily tips operations
  async createDailyTip(tipData: InsertDailyTip): Promise<DailyTip> {
    const [tip] = await db
      .insert(dailyTips)
      .values(tipData)
      .returning();
    return tip;
  }

  async getTodaysTip(): Promise<DailyTip | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [tip] = await db
      .select()
      .from(dailyTips)
      .where(
        and(
          eq(dailyTips.isActive, true),
          // Get tips created today
        )
      )
      .orderBy(desc(dailyTips.date))
      .limit(1);

    return tip;
  }

  async getRecentTips(limit: number = 10): Promise<DailyTip[]> {
    return await db
      .select()
      .from(dailyTips)
      .where(eq(dailyTips.isActive, true))
      .orderBy(desc(dailyTips.date))
      .limit(limit);
  }

  // Tip interactions
  async createTipInteraction(interactionData: InsertTipInteraction): Promise<TipInteraction> {
    const [interaction] = await db
      .insert(tipInteractions)
      .values(interactionData)
      .returning();
    return interaction;
  }

  async getUserTipInteraction(userId: string, tipId: number): Promise<TipInteraction | undefined> {
    const [interaction] = await db
      .select()
      .from(tipInteractions)
      .where(
        and(
          eq(tipInteractions.userId, userId),
          eq(tipInteractions.tipId, tipId)
        )
      );
    return interaction;
  }

  // Child profile operations
  async createChildProfile(profileData: InsertChildProfile): Promise<ChildProfile> {
    const [profile] = await db
      .insert(childProfiles)
      .values(profileData)
      .returning();
    return profile;
  }

  async updateChildProfile(id: number, updates: Partial<InsertChildProfile>): Promise<ChildProfile> {
    const [profile] = await db
      .update(childProfiles)
      .set(updates)
      .where(eq(childProfiles.id, id))
      .returning();
    return profile;
  }

  async getUserChildProfiles(userId: string): Promise<ChildProfile[]> {
    return await db
      .select()
      .from(childProfiles)
      .where(eq(childProfiles.userId, userId))
      .orderBy(childProfiles.childName);
  }

  async getChildProfile(id: number): Promise<ChildProfile | undefined> {
    const [profile] = await db
      .select()
      .from(childProfiles)
      .where(eq(childProfiles.id, id));
    return profile;
  }

  async deleteChildProfile(id: number): Promise<void> {
    await db
      .delete(childProfiles)
      .where(eq(childProfiles.id, id));
  }
}

export const storage = new DatabaseStorage();
