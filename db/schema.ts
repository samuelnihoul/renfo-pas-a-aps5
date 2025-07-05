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
  material: text("material").notNull(),
  ...timestamps
})

// Table des utilisateurs
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  isPremium: boolean('isPremium'),
  isAdmin: boolean("isAdmin"),
  ...timestamps
})

// Table des routines (jours d'entraînement)
export const routines = pgTable(
  "routines",
  {
    id: serial("id").primaryKey(),
    blockId: integer("block_id").array()
      .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    ...timestamps
  },
)

// Table des blocs d'exercices
export const blocks = pgTable(
  "blocks",
  {
    id: serial("id").primaryKey(),
    exerciceId: integer("exerciceId").array()
      .notNull()
    ,
    name: varchar("name").notNull(),
    sets: varchar("sets").notNull(),
    restTime: varchar("rest_time", { length: 50 }),
    focus: varchar("focus").notNull(),
    ...timestamps
  },
)

// Table des exercices
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  videoPublicId: varchar("video_url", { length: 255 }),
  instructions: text("instructions"),
  tempsReps: varchar('tempsReps'),
  ...timestamps
})

// Table de liaison pour les achats de programmes par utilisateur
export const userPrograms = pgTable("user_programs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  programId: integer("program_id").notNull(),
  purchaseDate: timestamp("purchase_date", { withTimezone: true }).defaultNow(),
  // Possibilité d'ajouter d'autres champs (ex: prix, statut, etc.)
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

