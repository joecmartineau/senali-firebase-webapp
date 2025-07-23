import {
  users,
  messages,
  dailyTips,
  tipInteractions,
  type User,
  type UpsertUser,
  type Message,
  type InsertMessage,
  type DailyTip,
  type InsertDailyTip,
  type TipInteraction,
  type InsertTipInteraction,
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
}

export const storage = new DatabaseStorage();
