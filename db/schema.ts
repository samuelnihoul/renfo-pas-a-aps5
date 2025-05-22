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
  videoUrl: varchar("video_url", { length: 255 }),
  videoPublicId: varchar("video_public_id", { length: 255 }),
  instructions: text("instructions"),
  tempsReps: varchar('tempsReps'),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})


// Table des routines 
export const routines = pgTable(
  "routines",
  {
    id: serial("id").primaryKey(),
    programId: integer("program_id")
      .notNull(),
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

// Table des blocs
export const block = pgTable(
  "block",
  {
    id: serial("id").primaryKey(),
    dayId: integer("day_id")
      .notNull()
      .references(() => routines.id, { onDelete: "cascade" }),
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
      dayExerciseUnique: unique("day_exercise_unique_idx").on(
        table.dayId,
        table.exerciseId,
        table.orderIndex
      ),
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
  programDayId: integer("program_day_id").references(() => routines.id, { onDelete: "set null" }),
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
  userProgress: many(userProgress),
  favorites: many(favorites),
}))

export const programsRelations = relations(routines, ({ many }) => ({
  blocks: many(block),
}))

export const routinesRelations = relations(routines, ({ one, many }) => ({
  block: many(block),
  userProgress: many(userProgress),
}))

export const blockRelations = relations(block, ({one}) => ({
  exercise: one(exercises, {
    fields: [block.exerciseId],
    references: [exercises.id],
  })
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
  programDay: one(routines, {
    fields: [userProgress.programDayId],
    references: [routines.id],
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
