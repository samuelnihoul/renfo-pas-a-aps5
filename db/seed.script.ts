import { config } from 'dotenv';
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.js";

// Load environment variables from .env file
config();

// Create a PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Create the drizzle database instance
const db = drizzle(pool, { schema });

async function seedDatabase() {
    try {
        // Vérifier si des données existent déjà
        const existingExercises = await db.select().from(schema.exercises).limit(1);

        if (existingExercises.length > 0) {
            return { success: true, message: "La base de données contient déjà des données." };
        }

        // Ajouter des exercices
        const exercisesData = [
            {
                name: "Squat",
                videoUrl: "/placeholder.svg?height=400&width=600",
                instructions:
                    "Gardez le dos droit, respirez correctement (expirez pendant l'effort), et contrôlez le mouvement dans les deux phases.",
                tempsRep:'20 sec / côté',
                id:'1',
                blockId:['1','2']
            },
            {
                name: "Fentes samuel@harmonia.eco",
                videoUrl: "/placeholder.svg?height=400&width=600",
                instructions: "Gardez le torse droit et assurez-vous que le genou avant ne dépasse pas les orteils.",
                tempsRep:'30sec / c5oté',
                id:'2'
            },
            {
                name: "Fentes",
                videoUrl: "/placeholder.svg?height=400&width=600",
                instructions: "Gardez le torse droit et assurez-vous que le genou avant ne dépasse pas les orteils.",
                tempsRep:'30sec / c5oté',
                id:'3'
            }
        ];

        // Insérer les exercices
        const insertedExercises = await db.insert(schema.exercises).values(exercisesData).returning();

        // Créer des programmes
        const programsData = [
            {
                name: "Programme Complet",
                description: "Un programme complet pour développer tous les groupes musculaires",
                difficulty: "Intermédiaire",
                duration: "45-60 min",
            },
            {
                name: "Débutant Total",
                description: "Programme idéal pour les débutants souhaitant se familiariser avec la musculation",
                difficulty: "Débutant",
                duration: "30-45 min",
            },
        ];

        // Insérer les programmes
        const insertedPrograms = await db.insert(schema.programs).values(programsData).returning();

        // Créer des jours de programme
        const routinesData = [
            // Programme Complet
            {
                programId: insertedPrograms[0].id,
                dayNumber: 1,
                name: "Jour 1",
                focus: "Jambes & Abdominaux",
            },
            {
                programId: insertedPrograms[0].id,
                dayNumber: 2,
                name: "Jour 2",
                focus: "Poitrine & Épaules",
            },
            {
                programId: insertedPrograms[0].id,
                dayNumber: 3,
                name: "Jour 3",
                focus: "Dos & Bras",
            },
            {
                programId: insertedPrograms[0].id,
                dayNumber: 4,
                name: "Jour 4",
                focus: "Corps complet",
            },
            // Débutant Total
            {
                programId: insertedPrograms[1].id,
                dayNumber: 1,
                name: "Jour 1",
                focus: "Haut du corps",
            },
            {
                programId: insertedPrograms[1].id,
                dayNumber: 2,
                name: "Jour 2",
                focus: "Bas du corps",
            },
            {
                programId: insertedPrograms[1].id,
                dayNumber: 3,
                name: "Jour 3",
                focus: "Corps complet",
            },
        ];

        // Insérer les jours de programme
        const insertedroutines = await db.insert(schema.routines).values(routinesData).returning();

        // Associer des exercices aux jours
        const blockData = [
            // Jour 1 - Programme Complet
            {
                dayId: insertedroutines[0].id,
                exerciseId: insertedExercises[0].id, // Squat
                sets: 4,
                reps: "10-12",
                restTime: "90 sec",
                orderIndex: 1,
            },
            {
                dayId: insertedroutines[0].id,
                exerciseId: insertedExercises[1].id, // Fentes
                sets: 3,
                reps: "12 (par jambe)",
                restTime: "60 sec",
                orderIndex: 2,
            },
            {
                dayId: insertedroutines[0].id,
                exerciseId: insertedExercises[5].id, // Crunch
                sets: 3,
                reps: "15-20",
                restTime: "45 sec",
                orderIndex: 3,
            },
            {
                dayId: insertedroutines[0].id,
                exerciseId: insertedExercises[6].id, // Planche
                sets: 3,
                reps: "30-45 sec",
                restTime: "45 sec",
                orderIndex: 4,
            },

            // Jour 2 - Programme Complet
            {
                dayId: insertedroutines[1].id,
                exerciseId: insertedExercises[2].id, // Développé couché
                sets: 4,
                reps: "8-10",
                restTime: "90 sec",
                orderIndex: 1,
            },
            {
                dayId: insertedroutines[1].id,
                exerciseId: insertedExercises[7].id, // Développé épaules
                sets: 3,
                reps: "10-12",
                restTime: "60 sec",
                orderIndex: 2,
            },

            // Jour 3 - Programme Complet
            {
                dayId: insertedroutines[2].id,
                exerciseId: insertedExercises[3].id, // Tirage vertical
                sets: 4,
                reps: "8-10",
                restTime: "90 sec",
                orderIndex: 1,
            },
            {
                dayId: insertedroutines[2].id,
                exerciseId: insertedExercises[4].id, // Curl biceps
                sets: 3,
                reps: "10-12",
                restTime: "60 sec",
                orderIndex: 2,
            },

            // Jour 4 - Programme Complet
            {
                dayId: insertedroutines[3].id,
                exerciseId: insertedExercises[0].id, // Squat
                sets: 3,
                reps: "12-15",
                restTime: "60 sec",
                orderIndex: 1,
            },
            {
                dayId: insertedroutines[3].id,
                exerciseId: insertedExercises[2].id, // Développé couché
                sets: 3,
                reps: "12-15",
                restTime: "60 sec",
                orderIndex: 2,
            },
            {
                dayId: insertedroutines[3].id,
                exerciseId: insertedExercises[3].id, // Tirage vertical
                sets: 3,
                reps: "12-15",
                restTime: "60 sec",
                orderIndex: 3,
            },

            // Jour 1 - Débutant Total
            {
                dayId: insertedroutines[4].id,
                exerciseId: insertedExercises[2].id, // Développé couché
                sets: 3,
                reps: "10-12",
                restTime: "60 sec",
                orderIndex: 1,
            },
            {
                dayId: insertedroutines[4].id,
                exerciseId: insertedExercises[4].id, // Curl biceps
                sets: 3,
                reps: "12-15",
                restTime: "45 sec",
                orderIndex: 2,
            },
            {
                dayId: insertedroutines[4].id,
                exerciseId: insertedExercises[7].id, // Développé épaules
                sets: 3,
                reps: "10-12",
                restTime: "60 sec",
                orderIndex: 3,
            },

            // Jour 2 - Débutant Total
            {
                dayId: insertedroutines[5].id,
                exerciseId: insertedExercises[0].id, // Squat
                sets: 3,
                reps: "12-15",
                restTime: "60 sec",
                orderIndex: 1,
            },
            {
                dayId: insertedroutines[5].id,
                exerciseId: insertedExercises[1].id, // Fentes
                sets: 2,
                reps: "10 (par jambe)",
                restTime: "45 sec",
                orderIndex: 2,
            },

            // Jour 3 - Débutant Total
            {
                dayId: insertedroutines[6].id,
                exerciseId: insertedExercises[5].id, // Crunch
                sets: 3,
                reps: "15-20",
                restTime: "30 sec",
                orderIndex: 1,
            },
            {
                dayId: insertedroutines[6].id,
                exerciseId: insertedExercises[6].id, // Planche
                sets: 3,
                reps: "20-30 sec",
                restTime: "30 sec",
                orderIndex: 2,
            },
            {
                dayId: insertedroutines[6].id,
                exerciseId: insertedExercises[2].id, // Développé couché
                sets: 3,
                reps: "10-12",
                restTime: "60 sec",
                orderIndex: 3,
            },
        ];

        // Insérer les exercices des jours
        await db.insert(schema.blocks).values(blockData);

        return { success: true, message: "Base de données initialisée avec succès!" };
    } catch (error) {
        console.error("Erreur lors de l'initialisation de la base de données:", error);
        return { success: false, message: "Erreur lors de l'initialisation de la base de données." };
    }
}

// This script is used to seed the database with initial data
async function main() {
    console.log("Starting database seeding...");

    try {
        const result = await seedDatabase();

        if (result.success) {
            console.log("✅ " + result.message);
        } else {
            console.error("❌ " + result.message);
        }
    } catch (error) {
        console.error("Error seeding database:", error);
    }

    console.log("Seeding process completed");

    // Close the database connection
    await pool.end();
}

// Run the seeding function
main()
    .catch((error) => {
        console.error("Unhandled error during seeding:", error);
        process.exit(1);
    });
