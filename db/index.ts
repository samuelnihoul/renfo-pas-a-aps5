// Import for regular PostgreSQL
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
})

// Create the drizzle database instance
export const db = drizzle(pool, { schema })

// Types pour les requêtes
export type User = typeof schema.users.$inferSelect
export type NewUser = typeof schema.users.$inferInsert

export type Exercise = typeof schema.exercises.$inferSelect
export type NewExercise = typeof schema.exercises.$inferInsert

export type Program = typeof schema.programs.$inferSelect
export type NewProgram = typeof schema.programs.$inferInsert

export type ProgramDay = typeof schema.routines.$inferSelect
export type NewProgramDay = typeof schema.routines.$inferInsert

export type DayExercise = typeof schema.blocks.$inferSelect
export type NewDayExercise = typeof schema.blocks.$inferInsert

