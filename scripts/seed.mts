import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { blocks, exercises, programs, routines, users } from '@/db/schema'; // Assurez-vous que le chemin est correct
// Initialisation de la connexion à la base de données
const databaseURL = process.env.DATABASE_URL
const pool = new Pool({
  connectionString: databaseURL, // Remplacez par votre chaîne de connexion
});

const db = drizzle(pool);

async function seedDatabase() {
  try {
    // Insérer des utilisateurs
    const userData: typeof users.$inferInsert[] = [
      {
        email: 'user1@example.com',
        name: 'User One',
        passwordHash: 'hashedpassword1',
        isPremium: true,
      },
      {
        email: 'user2@example.com',
        name: 'User Two',
        passwordHash: 'hashedpassword2',
        isPremium: false,
      },
    ];

    const insertedUsers = await db.insert(users).values(userData).returning();

    // Insérer des exercices
    const exerciseData: typeof exercises.$inferInsert[] = [
      {
        name: 'Squats',
        instructions: 'Pieds écartés à la largeur des épaules, descendre en gardant le dos droit',
        objectifs: 'Renforcement des quadriceps et fessiers',
        videoPublicId: null
      },
      {
        name: 'Pompes',
        instructions: 'Position planche, descendre le corps en pliant les bras',
        objectifs: 'Renforcement des pectoraux et triceps',
        videoPublicId: null
      },
    ];

    const insertedExercises = await db.insert(exercises).values(exerciseData).returning();

    // Insérer des blocs
    const blockData: typeof blocks.$inferInsert[] = [
      {
        exerciceId: [insertedExercises[0].id],
        name: 'Bloc 1',
        sets: '3 sets',
        restTime: '60s',
        focus: 'Upper Body',
      },
      {
        exerciceId: [insertedExercises[1].id],
        name: 'Bloc 2',
        sets: '4 sets',
        restTime: '45s',
        focus: 'Lower Body',
      },
    ];

    const insertedBlocks = await db.insert(blocks).values(blockData).returning();

    // Insérer des routines
    const routineData: typeof routines.$inferInsert[] = [
      {
        blockId: [insertedBlocks[0].id],
        name: 'Routine du matin',
      },
      {
        blockId: [insertedBlocks[1].id],
        name: 'Routine du soir',
      },
    ];

    const insertedRoutines = await db.insert(routines).values(routineData).returning();

    // Insérer des programmes
    const programData: typeof programs.$inferInsert[] = [
      {
        name: 'Programme Débutant',
        routineId: [insertedRoutines[0].id],
        material: 'Tapis de sol, haltères',
      },
      {
        name: 'Programme Avancé',
        routineId: [insertedRoutines[1].id],
        material: 'Tapis de sol, haltères, bande de résistance',
      },
    ];

    await db.insert(programs).values(programData);

    console.log('Base de données peuplée avec succès');
  } catch (error) {
    console.error('Erreur lors du peuplement de la base de données:', error);
  } finally {
    await pool.end();
  }
}

seedDatabase();
