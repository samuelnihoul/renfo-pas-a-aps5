// Modifier l'import de drizzle pour inclure le support des relations
import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"

// Utilisation de l'URL de connexion à partir des variables d'environnement
const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })

// Types pour les requêtes
export type User = typeof schema.users.$inferSelect
export type NewUser = typeof schema.users.$inferInsert

export type Exercise = typeof schema.exercises.$inferSelect
export type NewExercise = typeof schema.exercises.$inferInsert

export type Program = typeof schema.programs.$inferSelect
export type NewProgram = typeof schema.programs.$inferInsert

export type ProgramDay = typeof schema.programDays.$inferSelect
export type NewProgramDay = typeof schema.programDays.$inferInsert

export type DayExercise = typeof schema.dayExercises.$inferSelect
export type NewDayExercise = typeof schema.dayExercises.$inferInsert

export type UserProgress = typeof schema.userProgress.$inferSelect
export type NewUserProgress = typeof schema.userProgress.$inferInsert

export type Favorite = typeof schema.favorites.$inferSelect
export type NewFavorite = typeof schema.favorites.$inferInsert
