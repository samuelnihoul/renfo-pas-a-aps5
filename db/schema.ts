import { relations } from "drizzle-orm"
import { pgTable, serial, varchar, text, timestamp, integer, date, decimal, unique } from "drizzle-orm/pg-core"

// Table des utilisateurs
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
})

// Table des exercices
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  muscleGroup: varchar("muscle_group", { length: 100 }).notNull(),
  difficulty: varchar("difficulty", { length: 50 }).notNull(),
  videoUrl: varchar("video_url", { length: 255 }),
  instructions: text("instructions"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

// Table des programmes
export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  difficulty: varchar("difficulty", { length: 50 }).notNull(),
  duration: varchar("duration", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

// Table des jours de programme
export const programDays = pgTable(
  "program_days",
  {
    id: serial("id").primaryKey(),
    programId: integer("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    dayNumber: integer("day_number").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    focus: varchar("focus", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => {
    return {
      programDayUnique: unique().on(table.programId, table.dayNumber),
    }
  },
)

// Table associant les exercices aux jours
export const dayExercises = pgTable(
  "day_exercises",
  {
    id: serial("id").primaryKey(),
    dayId: integer("day_id")
      .notNull()
      .references(() => programDays.id, { onDelete: "cascade" }),
    exerciseId: integer("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    sets: integer("sets").notNull(),
    reps: varchar("reps", { length: 50 }).notNull(),
    restTime: varchar("rest_time", { length: 50 }),
    orderIndex: integer("order_index").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => {
    return {
      dayExerciseUnique: unique().on(table.dayId, table.exerciseId, table.orderIndex),
    }
  },
)

// Table pour suivre la progression des utilisateurs
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  exerciseId: integer("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "cascade" }),
  programDayId: integer("program_day_id").references(() => programDays.id, { onDelete: "set null" }),
  date: date("date").notNull().defaultNow(),
  setsCompleted: integer("sets_completed").notNull(),
  repsCompleted: varchar("reps_completed", { length: 255 }).notNull(),
  weight: decimal("weight", { precision: 6, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

// Table des favoris
export const favorites = pgTable(
  "favorites",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    exerciseId: integer("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => {
    return {
      favoriteUnique: unique().on(table.userId, table.exerciseId),
    }
  },
)

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
  favorites: many(favorites),
}))

export const exercisesRelations = relations(exercises, ({ many }) => ({
  dayExercises: many(dayExercises),
  userProgress: many(userProgress),
  favorites: many(favorites),
}))

export const programsRelations = relations(programs, ({ many }) => ({
  days: many(programDays),
}))

export const programDaysRelations = relations(programDays, ({ one, many }) => ({
  program: one(programs, {
    fields: [programDays.programId],
    references: [programs.id],
  }),
  exercises: many(dayExercises),
  userProgress: many(userProgress),
}))

export const dayExercisesRelations = relations(dayExercises, ({ one }) => ({
  day: one(programDays, {
    fields: [dayExercises.dayId],
    references: [programDays.id],
  }),
  exercise: one(exercises, {
    fields: [dayExercises.exerciseId],
    references: [exercises.id],
  }),
}))

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  exercise: one(exercises, {
    fields: [userProgress.exerciseId],
    references: [exercises.id],
  }),
  programDay: one(programDays, {
    fields: [userProgress.programDayId],
    references: [programDays.id],
  }),
}))

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  exercise: one(exercises, {
    fields: [favorites.exerciseId],
    references: [exercises.id],
  }),
}))
