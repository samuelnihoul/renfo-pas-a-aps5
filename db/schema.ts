import { relations } from "drizzle-orm"
import { pgTable, serial, varchar, text, timestamp, integer, date, decimal, unique ,PgTableWithColumns} from "drizzle-orm/pg-core"
const timestamps={
  createdAt:timestamp('created_at',{withTimezone: true}).defaultNow(),
  updatedAt:timestamp('updated_at',{withTimezone: true}).defaultNow(),
}
// Table des programmes
export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  duration: varchar("duration", { length: 50 }),
  ...timestamps
})

// Table des utilisateurs
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  ...timestamps,
  isPremium:boolean('isPremium')
})

// Table des exercices
export const exercises:PgTableWithColumns<any> = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  videoUrl: varchar("video_url", { length: 255 }),
  videoPublicId: varchar("video_public_id", { length: 255 }),
  instructions: text("instructions"),
  tempsReps: varchar('tempsReps'),
    blockId:integer('block_id').notNull().references(()=>blocks.id,{onDelete:'cascade'}),
  ...timestamps
})


// Table des routines 
export const routines = pgTable(
  "routines",
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

// Table des blocs
export const blocks = pgTable(
  "blocks",
  {
    id: serial("id").primaryKey(),
    exerciseId: integer("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    sets: integer("sets").notNull(),
    reps: varchar("reps", { length: 50 }).notNull(),
    restTime: varchar("rest_time", { length: 50 }),
    orderIndex: integer("order_index").notNull(),
      ...timestamps
  },
  (table) => {
    return {
      dayExerciseUnique: unique("day_exercise_unique_idx").on(
        table.exerciseId,
        table.orderIndex
      ),
    }
  },
)

// Relations

export const exercisesRelations = relations(exercises, ({ many }) => ({
  blocks:many(blocks)
}))

export const programsRelations = relations(programs, ({ many }) => ({
  routines: many(routines),
}))

export const routinesRelations = relations(routines, ({ one, many }) => ({
  programs:many(programs)
}))

export const blockRelations = relations(blocks, ({many}) => ({
  exercises:many(exercises)
}))


