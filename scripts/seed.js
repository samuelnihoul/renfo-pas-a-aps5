var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { blocks, exercises, programs, routines, users } from './schema'; // Assurez-vous que le chemin est correct
// Initialisation de la connexion à la base de données
const pool = new Pool({
    connectionString: 'postgres://user:password@localhost:5432/dbname', // Remplacez par votre chaîne de connexion
});
const db = drizzle(pool);
function seedDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Insérer des utilisateurs
            const userData = [
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
            const insertedUsers = yield db.insert(users).values(userData).returning();
            // Insérer des exercices
            const exerciseData = [
                {
                    name: 'Push-Up',
                    videoPublicId: 'a36xs7k8iyfz4keekw48',
                    instructions: 'Faites des pompes en gardant le dos droit.',
                    tempsReps: '10 reps',
                },
                {
                    name: 'Squat',
                    videoPublicId: 'another_video_id',
                    instructions: 'Faites des squats en gardant les pieds à plat.',
                    tempsReps: '15 reps',
                },
            ];
            const insertedExercises = yield db.insert(exercises).values(exerciseData).returning();
            // Insérer des blocs
            const blockData = [
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
            const insertedBlocks = yield db.insert(blocks).values(blockData).returning();
            // Insérer des routines
            const routineData = [
                {
                    blockId: [insertedBlocks[0].id],
                    name: 'Routine du matin',
                },
                {
                    blockId: [insertedBlocks[1].id],
                    name: 'Routine du soir',
                },
            ];
            const insertedRoutines = yield db.insert(routines).values(routineData).returning();
            // Insérer des programmes
            const programData = [
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
            yield db.insert(programs).values(programData);
            console.log('Base de données peuplée avec succès');
        }
        catch (error) {
            console.error('Erreur lors du peuplement de la base de données:', error);
        }
        finally {
            yield pool.end();
        }
    });
}
seedDatabase();
