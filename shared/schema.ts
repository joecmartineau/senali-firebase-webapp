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

// Child profiles for assessment tracking
export const childProfiles = pgTable("child_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  childName: varchar("child_name").notNull(),
  dateOfBirth: timestamp("date_of_birth"),
  age: varchar("age"), // Current age as mentioned by parent
  gender: varchar("gender", { enum: ["male", "female", "other", "prefer_not_to_say"] }),
  
  // Existing diagnoses
  existingDiagnoses: text("existing_diagnoses").array(), // ["ADHD", "Autism", "Anxiety"]
  diagnosisDate: varchar("diagnosis_date"), // When diagnosed
  diagnostician: varchar("diagnostician"), // Who diagnosed them
  
  // Current challenges and strengths
  currentChallenges: text("current_challenges").array(), // ["attention", "social skills", "sensory processing"]
  currentStrengths: text("current_strengths").array(), // ["creative", "good memory", "kind"]
  
  // School and therapy information
  schoolGrade: varchar("school_grade"),
  schoolType: varchar("school_type"), // "public", "private", "homeschool", "special needs"
  hasIEP: boolean("has_iep").default(false),
  has504Plan: boolean("has_504_plan").default(false),
  currentTherapies: text("current_therapies").array(), // ["speech therapy", "occupational therapy"]
  
  // Medications and treatments
  currentMedications: text("current_medications").array(),
  allergies: text("allergies").array(),
  medicalConditions: text("medical_conditions").array(),
  
  // Behavioral and developmental notes
  sleepPatterns: text("sleep_patterns"), // Free text about sleep
  dietaryNeeds: text("dietary_needs"), // Special diets, preferences, restrictions
  sensoryNeeds: text("sensory_needs"), // Sensory processing information
  communicationStyle: text("communication_style"), // How child communicates best
  
  // Family context
  familyStructure: varchar("family_structure"), // "two_parent", "single_parent", "extended_family"
  siblings: varchar("siblings"), // Number and ages of siblings
  primaryCaregivers: text("primary_caregivers").array(), // ["mom", "dad", "grandma"]
  
  // Goals and priorities
  parentGoals: text("parent_goals").array(), // What parent wants to work on
  childGoals: text("child_goals").array(), // What child wants to work on (if applicable)
  
  // Notes and observations
  parentNotes: text("parent_notes"), // Free-form notes from parent
  senaliObservations: text("senali_observations"), // AI observations over time
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ADHD Assessment (Vanderbilt + DSM-5 based)
export const adhdAssessments = pgTable("adhd_assessments", {
  id: serial("id").primaryKey(),
  childId: serial("child_id").notNull().references(() => childProfiles.id),
  
  // Inattention symptoms (9 items)
  failsToPayAttention: varchar("fails_to_pay_attention", { enum: ["never", "occasionally", "often", "very_often"] }),
  difficultyMaintainingAttention: varchar("difficulty_maintaining_attention", { enum: ["never", "occasionally", "often", "very_often"] }),
  doesNotListenWhenSpokenTo: varchar("does_not_listen_when_spoken_to", { enum: ["never", "occasionally", "often", "very_often"] }),
  doesNotFollowInstructions: varchar("does_not_follow_instructions", { enum: ["never", "occasionally", "often", "very_often"] }),
  difficultyOrganizingTasks: varchar("difficulty_organizing_tasks", { enum: ["never", "occasionally", "often", "very_often"] }),
  avoidsTasksRequiringMentalEffort: varchar("avoids_tasks_requiring_mental_effort", { enum: ["never", "occasionally", "often", "very_often"] }),
  losesThings: varchar("loses_things", { enum: ["never", "occasionally", "often", "very_often"] }),
  easilyDistracted: varchar("easily_distracted", { enum: ["never", "occasionally", "often", "very_often"] }),
  forgetfulInDailyActivities: varchar("forgetful_in_daily_activities", { enum: ["never", "occasionally", "often", "very_often"] }),
  
  // Hyperactivity/Impulsivity symptoms (9 items)
  fidgetsWithHandsOrFeet: varchar("fidgets_with_hands_or_feet", { enum: ["never", "occasionally", "often", "very_often"] }),
  leavesSeatsInClassroom: varchar("leaves_seats_in_classroom", { enum: ["never", "occasionally", "often", "very_often"] }),
  runsOrClimbsExcessively: varchar("runs_or_climbs_excessively", { enum: ["never", "occasionally", "often", "very_often"] }),
  difficultyPlayingQuietly: varchar("difficulty_playing_quietly", { enum: ["never", "occasionally", "often", "very_often"] }),
  onTheGoOrDrivenByMotor: varchar("on_the_go_or_driven_by_motor", { enum: ["never", "occasionally", "often", "very_often"] }),
  talksExcessively: varchar("talks_excessively", { enum: ["never", "occasionally", "often", "very_often"] }),
  blurtsOutAnswers: varchar("blurts_out_answers", { enum: ["never", "occasionally", "often", "very_often"] }),
  difficultyWaitingTurn: varchar("difficulty_waiting_turn", { enum: ["never", "occasionally", "often", "very_often"] }),
  interruptsOrIntrudes: varchar("interrupts_or_intrudes", { enum: ["never", "occasionally", "often", "very_often"] }),
  
  // Performance areas
  academicPerformance: varchar("academic_performance", { enum: ["excellent", "above_average", "average", "somewhat_of_a_problem", "problematic"] }),
  relationshipWithPeers: varchar("relationship_with_peers", { enum: ["excellent", "above_average", "average", "somewhat_of_a_problem", "problematic"] }),
  followingDirections: varchar("following_directions", { enum: ["excellent", "above_average", "average", "somewhat_of_a_problem", "problematic"] }),
  disruptingClass: varchar("disrupting_class", { enum: ["excellent", "above_average", "average", "somewhat_of_a_problem", "problematic"] }),
  assignmentCompletion: varchar("assignment_completion", { enum: ["excellent", "above_average", "average", "somewhat_of_a_problem", "problematic"] }),
  
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Autism Assessment (based on DSM-5 + ADOS/ADI-R elements)
export const autismAssessments = pgTable("autism_assessments", {
  id: serial("id").primaryKey(),
  childId: serial("child_id").notNull().references(() => childProfiles.id),
  
  // Social Communication deficits (Criterion A - all 3 required)
  socialEmotionalReciprocity: varchar("social_emotional_reciprocity", { enum: ["not_present", "mild", "moderate", "severe"] }),
  nonverbalCommunication: varchar("nonverbal_communication", { enum: ["not_present", "mild", "moderate", "severe"] }),
  developingMaintainingRelationships: varchar("developing_maintaining_relationships", { enum: ["not_present", "mild", "moderate", "severe"] }),
  
  // Restricted/Repetitive behaviors (Criterion B - 2 of 4 required)
  stereotypedRepetitiveMotor: varchar("stereotyped_repetitive_motor", { enum: ["not_present", "mild", "moderate", "severe"] }),
  insistenceOnSameness: varchar("insistence_on_sameness", { enum: ["not_present", "mild", "moderate", "severe"] }),
  restrictedFixatedInterests: varchar("restricted_fixated_interests", { enum: ["not_present", "mild", "moderate", "severe"] }),
  sensoryReactivity: varchar("sensory_reactivity", { enum: ["not_present", "mild", "moderate", "severe"] }),
  
  // Development timing
  earlyDevelopmentConcerns: boolean("early_development_concerns"),
  ageOfFirstConcerns: varchar("age_of_first_concerns"),
  languageDevelopment: varchar("language_development", { enum: ["typical", "delayed", "atypical", "regression"] }),
  socialMilestones: varchar("social_milestones", { enum: ["typical", "delayed", "atypical", "regression"] }),
  
  // Severity level
  severityLevel: varchar("severity_level", { enum: ["requiring_support", "requiring_substantial_support", "requiring_very_substantial_support"] }),
  
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// ODD Assessment (based on DSM-5 criteria)
export const oddAssessments = pgTable("odd_assessments", {
  id: serial("id").primaryKey(),
  childId: serial("child_id").notNull().references(() => childProfiles.id),
  
  // Angry/Irritable Mood
  oftenLosesTemper: varchar("often_loses_temper", { enum: ["never", "sometimes", "often", "very_often"] }),
  touchyOrEasilyAnnoyed: varchar("touchy_or_easily_annoyed", { enum: ["never", "sometimes", "often", "very_often"] }),
  angryAndResentful: varchar("angry_and_resentful", { enum: ["never", "sometimes", "often", "very_often"] }),
  
  // Argumentative/Defiant Behavior
  arguesWithAuthority: varchar("argues_with_authority", { enum: ["never", "sometimes", "often", "very_often"] }),
  activelyDefiesRules: varchar("actively_defies_rules", { enum: ["never", "sometimes", "often", "very_often"] }),
  deliberatelyAnnoys: varchar("deliberately_annoys", { enum: ["never", "sometimes", "often", "very_often"] }),
  blamesOthers: varchar("blames_others", { enum: ["never", "sometimes", "often", "very_often"] }),
  
  // Vindictiveness
  spitefulOrVindictive: varchar("spiteful_or_vindictive", { enum: ["never", "sometimes", "often", "very_often"] }),
  
  // Duration and settings
  durationMonths: varchar("duration_months"),
  settingsAffected: varchar("settings_affected", { enum: ["one", "two", "three_or_more"] }),
  severityLevel: varchar("severity_level", { enum: ["mild", "moderate", "severe"] }),
  
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  messages: many(messages),
  tipInteractions: many(tipInteractions),
  childProfiles: many(childProfiles),
}));

export const childProfilesRelations = relations(childProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [childProfiles.userId],
    references: [users.id],
  }),
  adhdAssessment: one(adhdAssessments),
  autismAssessment: one(autismAssessments),
  oddAssessment: one(oddAssessments),
}));

export const adhdAssessmentsRelations = relations(adhdAssessments, ({ one }) => ({
  child: one(childProfiles, {
    fields: [adhdAssessments.childId],
    references: [childProfiles.id],
  }),
}));

export const autismAssessmentsRelations = relations(autismAssessments, ({ one }) => ({
  child: one(childProfiles, {
    fields: [autismAssessments.childId],
    references: [childProfiles.id],
  }),
}));

export const oddAssessmentsRelations = relations(oddAssessments, ({ one }) => ({
  child: one(childProfiles, {
    fields: [oddAssessments.childId],
    references: [childProfiles.id],
  }),
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

// Zod schemas for new tables
export const insertChildProfileSchema = createInsertSchema(childProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdhdAssessmentSchema = createInsertSchema(adhdAssessments).omit({
  id: true,
  lastUpdated: true,
});

export const insertAutismAssessmentSchema = createInsertSchema(autismAssessments).omit({
  id: true,
  lastUpdated: true,
});

export const insertOddAssessmentSchema = createInsertSchema(oddAssessments).omit({
  id: true,
  lastUpdated: true,
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

export type InsertChildProfile = z.infer<typeof insertChildProfileSchema>;
export type ChildProfile = typeof childProfiles.$inferSelect;
export type InsertAdhdAssessment = z.infer<typeof insertAdhdAssessmentSchema>;
export type AdhdAssessment = typeof adhdAssessments.$inferSelect;
export type InsertAutismAssessment = z.infer<typeof insertAutismAssessmentSchema>;
export type AutismAssessment = typeof autismAssessments.$inferSelect;
export type InsertOddAssessment = z.infer<typeof insertOddAssessmentSchema>;
export type OddAssessment = typeof oddAssessments.$inferSelect;
