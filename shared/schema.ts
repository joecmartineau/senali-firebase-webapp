import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  role: varchar("role", { enum: ["user", "assistant"] }).notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Daily tips table
export const dailyTips = pgTable("daily_tips", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  category: varchar("category"), // e.g., "ADHD", "Autism", "General"
  date: timestamp("date").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// User interactions with tips
export const tipInteractions = pgTable("tip_interactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  tipId: serial("tip_id").notNull().references(() => dailyTips.id),
  isHelpful: boolean("is_helpful"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  messages: many(messages),
  tipInteractions: many(tipInteractions),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));

export const dailyTipsRelations = relations(dailyTips, ({ many }) => ({
  interactions: many(tipInteractions),
}));

export const tipInteractionsRelations = relations(tipInteractions, ({ one }) => ({
  user: one(users, {
    fields: [tipInteractions.userId],
    references: [users.id],
  }),
  tip: one(dailyTips, {
    fields: [tipInteractions.tipId],
    references: [dailyTips.id],
  }),
}));

// Zod schemas
export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export const insertDailyTipSchema = createInsertSchema(dailyTips).omit({
  id: true,
  date: true,
});

export const insertTipInteractionSchema = createInsertSchema(tipInteractions).omit({
  id: true,
  timestamp: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertDailyTip = z.infer<typeof insertDailyTipSchema>;
export type DailyTip = typeof dailyTips.$inferSelect;
export type InsertTipInteraction = z.infer<typeof insertTipInteractionSchema>;
export type TipInteraction = typeof tipInteractions.$inferSelect;
