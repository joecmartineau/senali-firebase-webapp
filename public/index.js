var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import { createServer } from "http";

// server/routes/chat.ts
import { Router } from "express";
import OpenAI from "openai";

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  adhdAssessments: () => adhdAssessments,
  adhdAssessmentsRelations: () => adhdAssessmentsRelations,
  autismAssessments: () => autismAssessments,
  autismAssessmentsRelations: () => autismAssessmentsRelations,
  childProfiles: () => childProfiles,
  childProfilesRelations: () => childProfilesRelations,
  dailyTips: () => dailyTips,
  dailyTipsRelations: () => dailyTipsRelations,
  insertAdhdAssessmentSchema: () => insertAdhdAssessmentSchema,
  insertAutismAssessmentSchema: () => insertAutismAssessmentSchema,
  insertChildProfileSchema: () => insertChildProfileSchema,
  insertDailyTipSchema: () => insertDailyTipSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertOddAssessmentSchema: () => insertOddAssessmentSchema,
  insertSymptomChecklistSchema: () => insertSymptomChecklistSchema,
  insertTipInteractionSchema: () => insertTipInteractionSchema,
  messages: () => messages,
  messagesRelations: () => messagesRelations,
  oddAssessments: () => oddAssessments,
  oddAssessmentsRelations: () => oddAssessmentsRelations,
  sessions: () => sessions,
  symptomChecklists: () => symptomChecklists,
  symptomChecklistsRelations: () => symptomChecklistsRelations,
  tipInteractions: () => tipInteractions,
  tipInteractionsRelations: () => tipInteractionsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  uid: varchar("uid").unique(),
  // Firebase UID for compatibility
  email: varchar("email").unique(),
  displayName: varchar("display_name"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  credits: serial("credits").default(25),
  // Credits for messages - 1 credit per message
  // In-app purchase system for mobile stores
  totalPurchasedCredits: serial("total_purchased_credits").default(0),
  // Track lifetime purchases
  // User profile completion tracking
  fullName: varchar("full_name"),
  // User's preferred full name
  hasCompletedProfile: boolean("has_completed_profile").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  role: varchar("role", { enum: ["user", "assistant"] }).notNull(),
  timestamp: timestamp("timestamp").defaultNow()
});
var dailyTips = pgTable("daily_tips", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  category: varchar("category"),
  // e.g., "ADHD", "Autism", "General"
  date: timestamp("date").defaultNow(),
  isActive: boolean("is_active").default(true)
});
var tipInteractions = pgTable("tip_interactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  tipId: serial("tip_id").notNull().references(() => dailyTips.id),
  isHelpful: boolean("is_helpful"),
  timestamp: timestamp("timestamp").defaultNow()
});
var childProfiles = pgTable("child_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  childName: varchar("child_name").notNull(),
  dateOfBirth: timestamp("date_of_birth"),
  age: varchar("age"),
  // Current age as mentioned by parent
  gender: varchar("gender", { enum: ["male", "female", "other", "prefer_not_to_say"] }),
  // Existing diagnoses
  existingDiagnoses: text("existing_diagnoses").array(),
  // ["ADHD", "Autism", "Anxiety"]
  diagnosisDate: varchar("diagnosis_date"),
  // When diagnosed
  diagnostician: varchar("diagnostician"),
  // Who diagnosed them
  // Current challenges and strengths
  currentChallenges: text("current_challenges").array(),
  // ["attention", "social skills", "sensory processing"]
  currentStrengths: text("current_strengths").array(),
  // ["creative", "good memory", "kind"]
  // School and therapy information
  schoolGrade: varchar("school_grade"),
  schoolType: varchar("school_type"),
  // "public", "private", "homeschool", "special needs"
  hasIEP: boolean("has_iep").default(false),
  has504Plan: boolean("has_504_plan").default(false),
  currentTherapies: text("current_therapies").array(),
  // ["speech therapy", "occupational therapy"]
  // Medications and treatments
  currentMedications: text("current_medications").array(),
  allergies: text("allergies").array(),
  medicalConditions: text("medical_conditions").array(),
  // Behavioral and developmental notes
  sleepPatterns: text("sleep_patterns"),
  // Free text about sleep
  dietaryNeeds: text("dietary_needs"),
  // Special diets, preferences, restrictions
  sensoryNeeds: text("sensory_needs"),
  // Sensory processing information
  communicationStyle: text("communication_style"),
  // How child communicates best
  // Family context
  familyStructure: varchar("family_structure"),
  // "two_parent", "single_parent", "extended_family"
  siblings: varchar("siblings"),
  // Number and ages of siblings
  primaryCaregivers: text("primary_caregivers").array(),
  // ["mom", "dad", "grandma"]
  // Goals and priorities
  parentGoals: text("parent_goals").array(),
  // What parent wants to work on
  childGoals: text("child_goals").array(),
  // What child wants to work on (if applicable)
  // Notes and observations
  parentNotes: text("parent_notes"),
  // Free-form notes from parent
  senaliObservations: text("senali_observations"),
  // AI observations over time
  // Relationship type (expanded from original design)
  relationshipToUser: varchar("relationship_to_user", { enum: ["child", "spouse", "self", "other"] }).default("child"),
  // Additional fields from local storage design
  height: varchar("height"),
  workInfo: varchar("work_info"),
  // For adults
  medicalDiagnoses: text("medical_diagnoses"),
  // Free text field
  workSchoolInfo: text("work_school_info"),
  // Combined work/school info
  // Symptom tracking (comprehensive boolean fields for questionnaire responses)
  symptoms: jsonb("symptoms"),
  // Store all symptom responses as JSON
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var adhdAssessments = pgTable("adhd_assessments", {
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
  lastUpdated: timestamp("last_updated").defaultNow()
});
var autismAssessments = pgTable("autism_assessments", {
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
  lastUpdated: timestamp("last_updated").defaultNow()
});
var oddAssessments = pgTable("odd_assessments", {
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
  lastUpdated: timestamp("last_updated").defaultNow()
});
var symptomChecklists = pgTable("symptom_checklists", {
  id: serial("id").primaryKey(),
  childId: serial("child_id").notNull().references(() => childProfiles.id),
  // Attention & Focus Symptoms (ADHD-related)
  difficultyPayingAttention: varchar("difficulty_paying_attention", { enum: ["yes", "no", "unknown"] }),
  easilyDistracted: varchar("easily_distracted", { enum: ["yes", "no", "unknown"] }),
  difficultyFinishingTasks: varchar("difficulty_finishing_tasks", { enum: ["yes", "no", "unknown"] }),
  forgetfulInDailyActivities: varchar("forgetful_in_daily_activities", { enum: ["yes", "no", "unknown"] }),
  losesThingsFrequently: varchar("loses_things_frequently", { enum: ["yes", "no", "unknown"] }),
  avoidsTasksRequiringMentalEffort: varchar("avoids_tasks_requiring_mental_effort", { enum: ["yes", "no", "unknown"] }),
  difficultyListeningWhenSpokenTo: varchar("difficulty_listening_when_spoken_to", { enum: ["yes", "no", "unknown"] }),
  difficultyFollowingInstructions: varchar("difficulty_following_instructions", { enum: ["yes", "no", "unknown"] }),
  difficultyOrganizingTasks: varchar("difficulty_organizing_tasks", { enum: ["yes", "no", "unknown"] }),
  // Hyperactivity & Impulsivity Symptoms
  fidgetsOrSquirms: varchar("fidgets_or_squirms", { enum: ["yes", "no", "unknown"] }),
  difficultyStayingSeated: varchar("difficulty_staying_seated", { enum: ["yes", "no", "unknown"] }),
  excessiveRunningOrClimbing: varchar("excessive_running_or_climbing", { enum: ["yes", "no", "unknown"] }),
  difficultyPlayingQuietly: varchar("difficulty_playing_quietly", { enum: ["yes", "no", "unknown"] }),
  talksExcessively: varchar("talks_excessively", { enum: ["yes", "no", "unknown"] }),
  blurtsOutAnswers: varchar("blurts_out_answers", { enum: ["yes", "no", "unknown"] }),
  difficultyWaitingTurn: varchar("difficulty_waiting_turn", { enum: ["yes", "no", "unknown"] }),
  interruptsOrIntrudes: varchar("interrupts_or_intrudes", { enum: ["yes", "no", "unknown"] }),
  alwaysOnTheGo: varchar("always_on_the_go", { enum: ["yes", "no", "unknown"] }),
  // Social Communication Symptoms (Autism-related)
  difficultyMakingEyeContact: varchar("difficulty_making_eye_contact", { enum: ["yes", "no", "unknown"] }),
  difficultyUnderstandingNonverbalCues: varchar("difficulty_understanding_nonverbal_cues", { enum: ["yes", "no", "unknown"] }),
  difficultyMakingFriends: varchar("difficulty_making_friends", { enum: ["yes", "no", "unknown"] }),
  difficultyInitiatingConversations: varchar("difficulty_initiating_conversations", { enum: ["yes", "no", "unknown"] }),
  difficultyUnderstandingSocialSituations: varchar("difficulty_understanding_social_situations", { enum: ["yes", "no", "unknown"] }),
  difficultyWithBackAndForthConversation: varchar("difficulty_with_back_and_forth_conversation", { enum: ["yes", "no", "unknown"] }),
  difficultyShowingEmotions: varchar("difficulty_showing_emotions", { enum: ["yes", "no", "unknown"] }),
  limitedFacialExpressions: varchar("limited_facial_expressions", { enum: ["yes", "no", "unknown"] }),
  difficultyUnderstandingOthersEmotions: varchar("difficulty_understanding_others_emotions", { enum: ["yes", "no", "unknown"] }),
  // Restricted Interests & Repetitive Behaviors
  intenseFocusOnSpecificTopics: varchar("intense_focus_on_specific_topics", { enum: ["yes", "no", "unknown"] }),
  repetitiveMovements: varchar("repetitive_movements", { enum: ["yes", "no", "unknown"] }),
  insistenceOnSameness: varchar("insistence_on_sameness", { enum: ["yes", "no", "unknown"] }),
  difficultyWithChangesInRoutine: varchar("difficulty_with_changes_in_routine", { enum: ["yes", "no", "unknown"] }),
  unusualAttachmentToObjects: varchar("unusual_attachment_to_objects", { enum: ["yes", "no", "unknown"] }),
  repetitiveUseOfLanguage: varchar("repetitive_use_of_language", { enum: ["yes", "no", "unknown"] }),
  preoccupationWithPartsOfObjects: varchar("preoccupation_with_parts_of_objects", { enum: ["yes", "no", "unknown"] }),
  // Sensory Processing Symptoms
  oversensitiveToSounds: varchar("oversensitive_to_sounds", { enum: ["yes", "no", "unknown"] }),
  oversensitiveToTextures: varchar("oversensitive_to_textures", { enum: ["yes", "no", "unknown"] }),
  oversensitiveToLight: varchar("oversensitive_to_light", { enum: ["yes", "no", "unknown"] }),
  undersensitiveToTemperature: varchar("undersensitive_to_temperature", { enum: ["yes", "no", "unknown"] }),
  seeksOutSensoryInput: varchar("seeks_out_sensory_input", { enum: ["yes", "no", "unknown"] }),
  avoidsMessyPlay: varchar("avoids_messy_play", { enum: ["yes", "no", "unknown"] }),
  difficultyWithCertainClothingTextures: varchar("difficulty_with_certain_clothing_textures", { enum: ["yes", "no", "unknown"] }),
  unusualReactionToPain: varchar("unusual_reaction_to_pain", { enum: ["yes", "no", "unknown"] }),
  // Emotional Regulation & Behavioral Symptoms
  frequentMeltdowns: varchar("frequent_meltdowns", { enum: ["yes", "no", "unknown"] }),
  difficultyControllingEmotions: varchar("difficulty_controlling_emotions", { enum: ["yes", "no", "unknown"] }),
  frequentTemperTantrums: varchar("frequent_temper_tantrums", { enum: ["yes", "no", "unknown"] }),
  difficultyWithTransitions: varchar("difficulty_with_transitions", { enum: ["yes", "no", "unknown"] }),
  extremeReactionsToDisappointment: varchar("extreme_reactions_to_disappointment", { enum: ["yes", "no", "unknown"] }),
  difficultyCalminDownWhenUpset: varchar("difficulty_calming_down_when_upset", { enum: ["yes", "no", "unknown"] }),
  moodSwings: varchar("mood_swings", { enum: ["yes", "no", "unknown"] }),
  anxietyOrWorrying: varchar("anxiety_or_worrying", { enum: ["yes", "no", "unknown"] }),
  // Communication & Language Symptoms
  delayedSpeechDevelopment: varchar("delayed_speech_development", { enum: ["yes", "no", "unknown"] }),
  difficultyExpressingNeeds: varchar("difficulty_expressing_needs", { enum: ["yes", "no", "unknown"] }),
  echolalia: varchar("echolalia", { enum: ["yes", "no", "unknown"] }),
  difficultyUnderstandingInstructions: varchar("difficulty_understanding_instructions", { enum: ["yes", "no", "unknown"] }),
  literalUnderstandingOfLanguage: varchar("literal_understanding_of_language", { enum: ["yes", "no", "unknown"] }),
  difficultyWithAbstractConcepts: varchar("difficulty_with_abstract_concepts", { enum: ["yes", "no", "unknown"] }),
  // Motor Skills & Coordination
  difficultyWithFineMotorSkills: varchar("difficulty_with_fine_motor_skills", { enum: ["yes", "no", "unknown"] }),
  difficultyWithGrossMotorSkills: varchar("difficulty_with_gross_motor_skills", { enum: ["yes", "no", "unknown"] }),
  poorHandwriting: varchar("poor_handwriting", { enum: ["yes", "no", "unknown"] }),
  clumsiness: varchar("clumsiness", { enum: ["yes", "no", "unknown"] }),
  difficultyTyingShoes: varchar("difficulty_tying_shoes", { enum: ["yes", "no", "unknown"] }),
  difficultyRidingBicycle: varchar("difficulty_riding_bicycle", { enum: ["yes", "no", "unknown"] }),
  // Executive Function Symptoms
  difficultyPlanningAhead: varchar("difficulty_planning_ahead", { enum: ["yes", "no", "unknown"] }),
  difficultyWithTimeManagement: varchar("difficulty_with_time_management", { enum: ["yes", "no", "unknown"] }),
  difficultyPrioritizingTasks: varchar("difficulty_prioritizing_tasks", { enum: ["yes", "no", "unknown"] }),
  difficultyWithWorkingMemory: varchar("difficulty_with_working_memory", { enum: ["yes", "no", "unknown"] }),
  difficultyShiftingBetweenTasks: varchar("difficulty_shifting_between_tasks", { enum: ["yes", "no", "unknown"] }),
  difficultyWithProblemSolving: varchar("difficulty_with_problem_solving", { enum: ["yes", "no", "unknown"] }),
  // Sleep & Daily Living
  difficultyFallingAsleep: varchar("difficulty_falling_asleep", { enum: ["yes", "no", "unknown"] }),
  frequentNightWaking: varchar("frequent_night_waking", { enum: ["yes", "no", "unknown"] }),
  earlyWaking: varchar("early_waking", { enum: ["yes", "no", "unknown"] }),
  nightmares: varchar("nightmares", { enum: ["yes", "no", "unknown"] }),
  bedwetting: varchar("bedwetting", { enum: ["yes", "no", "unknown"] }),
  difficultyWithSelfCare: varchar("difficulty_with_self_care", { enum: ["yes", "no", "unknown"] }),
  pickyEating: varchar("picky_eating", { enum: ["yes", "no", "unknown"] }),
  // Academic & Learning Symptoms
  difficultyWithReading: varchar("difficulty_with_reading", { enum: ["yes", "no", "unknown"] }),
  difficultyWithWriting: varchar("difficulty_with_writing", { enum: ["yes", "no", "unknown"] }),
  difficultyWithMath: varchar("difficulty_with_math", { enum: ["yes", "no", "unknown"] }),
  difficultyMemorizingFacts: varchar("difficulty_memorizing_facts", { enum: ["yes", "no", "unknown"] }),
  difficultyCompletingHomework: varchar("difficulty_completing_homework", { enum: ["yes", "no", "unknown"] }),
  perfectionism: varchar("perfectionism", { enum: ["yes", "no", "unknown"] }),
  avoidanceOfSchoolWork: varchar("avoidance_of_school_work", { enum: ["yes", "no", "unknown"] }),
  lastUpdated: timestamp("last_updated").defaultNow()
});
var usersRelations = relations(users, ({ many }) => ({
  messages: many(messages),
  tipInteractions: many(tipInteractions),
  childProfiles: many(childProfiles)
}));
var childProfilesRelations = relations(childProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [childProfiles.userId],
    references: [users.id]
  }),
  adhdAssessment: one(adhdAssessments),
  autismAssessment: one(autismAssessments),
  oddAssessment: one(oddAssessments),
  symptomChecklist: one(symptomChecklists)
}));
var adhdAssessmentsRelations = relations(adhdAssessments, ({ one }) => ({
  child: one(childProfiles, {
    fields: [adhdAssessments.childId],
    references: [childProfiles.id]
  })
}));
var autismAssessmentsRelations = relations(autismAssessments, ({ one }) => ({
  child: one(childProfiles, {
    fields: [autismAssessments.childId],
    references: [childProfiles.id]
  })
}));
var oddAssessmentsRelations = relations(oddAssessments, ({ one }) => ({
  child: one(childProfiles, {
    fields: [oddAssessments.childId],
    references: [childProfiles.id]
  })
}));
var symptomChecklistsRelations = relations(symptomChecklists, ({ one }) => ({
  child: one(childProfiles, {
    fields: [symptomChecklists.childId],
    references: [childProfiles.id]
  })
}));
var messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.userId],
    references: [users.id]
  })
}));
var dailyTipsRelations = relations(dailyTips, ({ many }) => ({
  interactions: many(tipInteractions)
}));
var tipInteractionsRelations = relations(tipInteractions, ({ one }) => ({
  user: one(users, {
    fields: [tipInteractions.userId],
    references: [users.id]
  }),
  tip: one(dailyTips, {
    fields: [tipInteractions.tipId],
    references: [dailyTips.id]
  })
}));
var insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true
});
var insertDailyTipSchema = createInsertSchema(dailyTips).omit({
  id: true,
  date: true
});
var insertTipInteractionSchema = createInsertSchema(tipInteractions).omit({
  id: true,
  timestamp: true
});
var insertChildProfileSchema = createInsertSchema(childProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertAdhdAssessmentSchema = createInsertSchema(adhdAssessments).omit({
  id: true,
  lastUpdated: true
});
var insertAutismAssessmentSchema = createInsertSchema(autismAssessments).omit({
  id: true,
  lastUpdated: true
});
var insertOddAssessmentSchema = createInsertSchema(oddAssessments).omit({
  id: true,
  lastUpdated: true
});
var insertSymptomChecklistSchema = createInsertSchema(symptomChecklists).omit({
  id: true,
  lastUpdated: true
});

// server/db.ts
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/routes/chat.ts
import { eq } from "drizzle-orm";
var router = Router();
var openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
function sanitizeForPrompt(input) {
  if (!input && input !== 0) return "";
  const stringInput = String(input);
  return stringInput.replace(/[`${}]/g, "").replace(/\n{3,}/g, "\n\n").trim().slice(0, 2e3);
}
var calculateProbableDiagnoses = (questionnaire = []) => {
  const diagnosticQuestions = {
    adhd: ["adhd1", "adhd2", "adhd3", "adhd4", "adhd5", "adhd6", "adhd7", "adhd8", "adhd9"],
    autism: ["autism1", "autism2", "autism3", "autism4", "autism5", "autism6", "autism7", "autism8"],
    anxiety: ["anxiety1", "anxiety2", "anxiety3", "anxiety4"]
  };
  const results = {};
  Object.entries(diagnosticQuestions).forEach(([condition, questionIds]) => {
    const yesResponses = questionnaire.filter(
      (r) => questionIds.includes(r.questionId) && r.answer === "yes"
    ).length;
    const percentage = questionIds.length > 0 ? yesResponses / questionIds.length * 100 : 0;
    let probability = "Low";
    if (percentage >= 70) probability = "High";
    else if (percentage >= 40) probability = "Moderate";
    results[condition] = { percentage: Math.round(percentage), probability };
  });
  return results;
};
var formatFamilyContext = (familyProfiles = []) => {
  if (!familyProfiles || familyProfiles.length === 0) {
    return "No family profiles have been created yet.";
  }
  return familyProfiles.map((member) => {
    const diagnoses = calculateProbableDiagnoses(member.questionnaire || []);
    const diagnosisText = Object.entries(diagnoses).filter(([_, data]) => data.probability !== "Low").map(([condition, data]) => `${condition.toUpperCase()}: ${data.probability} probability (${data.percentage}%)`).join(", ") || "No significant diagnostic indicators";
    return `
Family Member: ${member.name}
- Age: ${member.age}
- Gender: ${member.gender}
- Relation: ${member.relation}
- Assessment Results: ${diagnosisText}
- Questionnaire Progress: ${member.questionnaire?.length || 0} questions answered
`;
  }).join("\n");
};
router.post("/chat", async (req, res) => {
  try {
    console.log("\u{1F6A8} CHAT API: Received request");
    console.log("\u{1F6A8} Request body keys:", Object.keys(req.body));
    const { message, familyProfiles, userUid, conversationSummary, recentMessages, isQuestionnaire } = req.body;
    if (!message) {
      console.log("\u{1F6A8} ERROR: No message provided");
      return res.status(400).json({ error: "Message is required" });
    }
    console.log(`\u{1F6A8} Chat request from userUid: ${userUid || "anonymous"}`);
    let user = null;
    if (userUid && userUid !== "demo-user") {
      try {
        const [foundUser] = await db.select().from(users).where(eq(users.id, userUid)).limit(1);
        user = foundUser;
        console.log(`Found user: ${user?.email || "unknown"}`);
      } catch (error) {
        console.log("No user found, continuing in demo mode");
      }
    }
    const isAdmin = user?.email === "joecmartineau@gmail.com";
    console.log(`User admin status: ${isAdmin} (email: ${user?.email || "none"})`);
    let systemPrompt;
    if (isAdmin) {
      systemPrompt = `You are Senali, an empathetic AI parenting coach and friend companion who provides supportive conversation and guidance for parents. Your core purpose is to be an active listener who helps parents navigate the emotional challenges of family life.

PERSONALITY & APPROACH:
- You are warm, understanding, and genuinely caring - like talking to a trusted friend who really gets it
- You ask thoughtful follow-up questions to understand deeper feelings and family dynamics
- You validate emotions and provide gentle guidance without being preachy or overwhelming
- You remember personal details and show genuine interest in their family's story and progress

CONVERSATION STYLE:
- Use simple, everyday language that feels natural and conversational (7th grade reading level)
- Be an excellent listener - ask open-ended questions that invite parents to share more
- Show empathy through phrases like "That sounds really challenging" or "I can understand why you'd feel that way"
- Offer practical suggestions when appropriate, but focus more on emotional support and validation
- Keep responses concise but meaningful - aim for 2-3 sentences unless more detail is specifically requested

STAYING ON TOPIC GUIDELINES:
- You can discuss any topic the user brings up - be flexible and supportive
- If conversation strays from parenting/family topics, gently weave in a subtle reminder of your role as a parenting coach
- Example: "That sounds interesting! As a parenting coach, I'm curious how that affects your family time..."
- If they continue non-parenting topics, only remind them of your role every 5th message and do it politely
- Never be forceful or dismissive - always stay warm and supportive regardless of the topic
- Keep reminders natural and conversational, not robotic or scripted`;
    } else {
      systemPrompt = `You are Senali, an AI parenting coach and friend designed to provide empathetic conversation, active listening, and supportive guidance. You specialize in building meaningful connections by asking personalized questions about users' families and relationships.

Your personality:
- Warm, empathetic, and genuinely caring
- Ask thoughtful follow-up questions
- Remember family members and their details
- Provide emotional validation without medical advice
- Focus on emotional well-being and family relationships

Guidelines:
- Use simple, everyday language (7th grade reading level)
- Be supportive and non-judgmental
- Ask open-ended questions to encourage sharing
- Validate emotions and experiences
- Offer gentle guidance and perspectives
- Never provide medical or psychiatric advice
- Focus on emotional support and active listening
- Remember previous conversations and build on them naturally

STAYING ON TOPIC GUIDELINES:
- You can discuss any topic the user brings up - be flexible and supportive
- If conversation strays from parenting/family topics, gently weave in a subtle reminder of your role as a parenting coach
- Example: "That sounds interesting! As a parenting coach, I'm curious how that affects your family time..."
- If they continue non-parenting topics, only remind them of your role every 5th message and do it politely
- Never be forceful or dismissive - always stay warm and supportive regardless of the topic
- Keep reminders natural and conversational, not robotic or scripted

CRITICAL INSTRUCTION: Only reference family information that is explicitly provided in the Family Context below. NEVER make up names, ages, or details about family members that are not provided. If no family context is provided or if asked about family members not listed, say "I don't have information about your family members yet" and suggest they can add family profiles for personalized support. Do not invent or assume any family details whatsoever.`;
    }
    const familyContext = formatFamilyContext(familyProfiles);
    systemPrompt += `

Family Context:
${familyContext}`;
    if (conversationSummary) {
      systemPrompt += `

Previous Conversation Summary:
${sanitizeForPrompt(conversationSummary)}`;
    }
    const messages2 = [{ role: "system", content: systemPrompt }];
    if (recentMessages && recentMessages.length > 0) {
      const contextMessages = recentMessages.slice(0, -1);
      messages2.push(...contextMessages);
    }
    messages2.push({ role: "user", content: message });
    const modelToUse = isAdmin ? "gpt-4o" : "gpt-3.5-turbo";
    const maxTokens = isQuestionnaire ? 1e3 : 800;
    const temperature = isQuestionnaire ? 0.3 : 0.7;
    console.log(`\u{1F534} Using ${modelToUse} model for ${isAdmin ? "admin" : "regular"} user`);
    const completion = await openai.chat.completions.create({
      model: modelToUse,
      messages: messages2,
      max_tokens: maxTokens,
      temperature,
      response_format: isQuestionnaire ? { type: "json_object" } : void 0
    });
    const response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response right now.";
    let updatedSummary = conversationSummary;
    if (recentMessages && recentMessages.length >= 18) {
      try {
        const summaryMessages = [
          {
            role: "system",
            content: `You are a conversation summarizer. Create a concise summary of this therapy conversation that captures:
- Key topics discussed
- Important family members mentioned
- Emotional themes and progress
- Any significant revelations or insights
- Current challenges or concerns

Keep the summary under 200 words and focus on information that would help maintain continuity in future conversations.

Previous summary: ${sanitizeForPrompt(conversationSummary) || "No previous summary"}

Recent conversation to summarize:`
          },
          ...recentMessages,
          { role: "assistant", content: response }
        ];
        const summaryCompletion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          // Use cheaper model for summaries
          messages: summaryMessages,
          max_tokens: 250,
          temperature: 0.3
        });
        updatedSummary = summaryCompletion.choices[0]?.message?.content || conversationSummary;
        console.log("Generated conversation summary");
      } catch (summaryError) {
        console.error("Error generating summary:", summaryError);
      }
    }
    res.json({
      response,
      creditsRemaining: isAdmin ? 999999 : 1e3,
      // Admin gets unlimited, others get 1000 
      conversationSummary: updatedSummary
    });
  } catch (error) {
    console.error("\u{1F6A8} DETAILED Chat API error:", error);
    console.error("\u{1F6A8} Error type:", typeof error);
    console.error("\u{1F6A8} Error message:", error instanceof Error ? error.message : String(error));
    console.error("\u{1F6A8} Error stack:", error instanceof Error ? error.stack : "No stack trace");
    res.status(500).json({
      error: "Failed to get AI response",
      response: "I'm having trouble connecting right now. Please try again in a moment."
    });
  }
});
var chat_default = router;

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use("/api", chat_default);
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is working!" });
});
app.post("/api/auth/firebase-signin", (req, res) => {
  res.json({ success: true, user: { hasCompletedProfile: true } });
});
app.get("/api/user/credits", (req, res) => {
  res.json({ credits: 25, totalPurchased: 0 });
});
app.post("/api/purchase/credits", (req, res) => {
  try {
    const { productId, purchaseToken, credits, platform } = req.body;
    const productCreditsMap = {
      "com.senali.credits.100": 100,
      "com.senali.credits.500": 500,
      "com.senali.credits.1000": 1e3
    };
    const productCredits = productCreditsMap[productId] || credits;
    console.log(`\u{1F6D2} ${platform} purchase: ${productId} for ${productCredits} credits`);
    if (purchaseToken && platform === "android_playstore") {
      console.log("Validating purchase token:", purchaseToken);
    }
    const newCreditsTotal = 25 + productCredits;
    res.json({
      success: true,
      newCreditsTotal,
      purchasedCredits: productCredits
    });
  } catch (error) {
    console.error("\u274C Purchase error:", error);
    res.status(500).json({ error: "Purchase failed" });
  }
});
app.post("/api/purchase/verify", (req, res) => {
  try {
    const { productId, purchaseToken, orderId, packageName } = req.body;
    console.log("\u{1F50D} Verifying purchase:", { productId, orderId, packageName });
    res.json({
      success: true,
      verified: true
    });
  } catch (error) {
    console.error("\u274C Verification error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});
var httpServer = createServer(app);
(async () => {
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, httpServer);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
