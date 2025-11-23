import { relations } from "drizzle-orm"
import { pgTable, serial, varchar, text, timestamp, integer, unique, boolean } from "drizzle-orm/pg-core"

// Timestamps helper for all tables
const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}

// Table des programmes
export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  routineId: integer("routine_id").array(),
  instructions: text("instructions"), // Marche à suivre et appropriation
  stripeProductId: varchar("stripe_product_id", { length: 255 }).default("-"), // Stripe Product ID for payments
  ...timestamps
})

// Table des utilisateurs (compatible Auth.js)
export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: varchar("image", { length: 255 }),
  passwordHash: varchar("password_hash", { length: 255 }),
  isPremium: boolean('isPremium').default(false),
  isAdmin: boolean("isAdmin").default(false),
  ...timestamps
})

// Tables Auth.js requises
export const accounts = pgTable("accounts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("userId", { length: 255 }).notNull(),
  type: varchar("type", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
  refresh_token: varchar("refresh_token", { length: 255 }),
  access_token: varchar("access_token", { length: 255 }),
  expires_at: integer("expires_at"),
  token_type: varchar("token_type", { length: 255 }),
  scope: varchar("scope", { length: 255 }),
  id_token: varchar("id_token", { length: 255 }),
  session_state: varchar("session_state", { length: 255 }),
})

export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  sessionToken: varchar("sessionToken", { length: 255 }).notNull().unique(),
  userId: varchar("userId", { length: 255 }).notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable("verificationToken", {
  identifier: varchar("identifier", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (vt) => ({
  compoundKey: unique().on(vt.identifier, vt.token),
}))

// Table des routines (jours d'entraînement)
export const routines = pgTable(
  "routines",
  {
    id: serial("id").primaryKey(),
    blockId: integer("block_id").array()
      .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    equipment: text("equipment"),
    instructions: text("instructions"),
    sessionOutcome: text("session_outcome"),
    ...timestamps
  },
)

// Table des blocs d'exercices
export const blocks = pgTable(
  "blocks",
  {
    id: serial("id").primaryKey(),
    exerciceId: integer("exerciceId").array().notNull(),
    exerciseNotes: text("exercise_notes").array(),
    name: varchar("name").notNull(),
    instructions: text("instructions").notNull(),
    focus: varchar("focus").notNull(),
    ...timestamps
  },
)

// Table des exercices
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  videoPublicId: varchar("video_public_id", { length: 255 }),
  thumbnailUrl: varchar("thumbnail_url", { length: 512 }),
  short: varchar("short", { length: 255 }),
  muscleGroup: varchar("muscle_group"),
  instructions: text("instructions"),
  objectifs: text("objectifs"),
  notes: text("notes").default("-"),
  ...timestamps
})

// Table de liaison pour les achats de programmes par utilisateur
export const userPrograms = pgTable("user_programs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  programId: integer("program_id").notNull(),
  stripeProductId: varchar("stripe_product_id", { length: 255 }).notNull(),
  purchaseDate: timestamp("purchase_date", { withTimezone: true }).defaultNow(),
  ...timestamps
})

export type Exercise = typeof exercises.$inferSelect
export type ExerciseAdd = typeof exercises.$inferInsert
export type Routine = typeof routines.$inferSelect
export type RoutineAdd = typeof routines.$inferInsert
export type Block = typeof blocks.$inferSelect
export type BlockAdd = typeof blocks.$inferInsert
export type Program = typeof programs.$inferSelect
export type ProgramAdd = typeof programs.$inferInsert
export type User = typeof users.$inferSelect
export type UserAdd = typeof users.$inferInsert
export type UserProgram = typeof userPrograms.$inferSelect
export type UserProgramAdd = typeof userPrograms.$inferInsert
export type Account = typeof accounts.$inferSelect
export type AccountAdd = typeof accounts.$inferInsert
export type Session = typeof sessions.$inferSelect
export type SessionAdd = typeof sessions.$inferInsert
export type VerificationToken = typeof verificationTokens.$inferSelect
export type VerificationTokenAdd = typeof verificationTokens.$inferInsert

