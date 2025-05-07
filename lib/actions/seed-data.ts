"use server"

import { db } from "@/db"
import { exercises, programs, programDays, dayExercises } from "@/db/schema"

export async function seedDatabase() {
  try {
    // Vérifier si des données existent déjà
    const existingExercises = await db.select().from(exercises).limit(1)

    if (existingExercises.length > 0) {
      return { success: true, message: "La base de données contient déjà des données." }
    }

    // Ajouter des exercices
    const exercisesData = [
      {
        name: "Squat",
        description:
          "Position debout, pieds écartés à la largeur des épaules. Descendez comme pour vous asseoir, puis remontez.",
        muscleGroup: "Jambes",
        difficulty: "Débutant",
        videoUrl: "/placeholder.svg?height=400&width=600",
        instructions:
          "Gardez le dos droit, respirez correctement (expirez pendant l'effort), et contrôlez le mouvement dans les deux phases.",
      },
      {
        name: "Fentes",
        description:
          "Faites un grand pas en avant, fléchissez les genoux jusqu'à ce que la cuisse avant soit parallèle au sol.",
        muscleGroup: "Jambes",
        difficulty: "Débutant",
        videoUrl: "/placeholder.svg?height=400&width=600",
        instructions: "Gardez le torse droit et assurez-vous que le genou avant ne dépasse pas les orteils.",
      },
      {
        name: "Développé couché",
        description: "Allongé sur un banc, poussez la barre vers le haut en étendant les bras.",
        muscleGroup: "Poitrine",
        difficulty: "Intermédiaire",
        videoUrl: "/placeholder.svg?height=400&width=600",
        instructions: "Gardez les pieds au sol et les épaules bien plaquées contre le banc.",
      },
      {
        name: "Tirage vertical",
        description: "Tirez la barre vers le bas en ramenant les coudes vers le sol.",
        muscleGroup: "Dos",
        difficulty: "Intermédiaire",
        videoUrl: "/placeholder.svg?height=400&width=600",
        instructions: "Gardez le dos droit et évitez de balancer le corps pendant le mouvement.",
      },
      {
        name: "Curl biceps",
        description: "Fléchissez les coudes pour amener les haltères vers les épaules.",
        muscleGroup: "Bras",
        difficulty: "Débutant",
        videoUrl: "/placeholder.svg?height=400&width=600",
        instructions: "Gardez les coudes près du corps et évitez de balancer le corps.",
      },
      {
        name: "Crunch",
        description: "Allongé sur le dos, genoux fléchis, soulevez les épaules du sol en contractant les abdominaux.",
        muscleGroup: "Abdominaux",
        difficulty: "Débutant",
        videoUrl: "/placeholder.svg?height=400&width=600",
        instructions: "Concentrez-vous sur la contraction des abdominaux et expirez pendant l'effort.",
      },
      {
        name: "Planche",
        description: "En appui sur les avant-bras et les orteils, maintenez le corps en ligne droite.",
        muscleGroup: "Abdominaux",
        difficulty: "Débutant",
        videoUrl: "/placeholder.svg?height=400&width=600",
        instructions: "Gardez les abdominaux contractés et évitez de cambrer le dos ou de lever les fesses.",
      },
      {
        name: "Développé épaules",
        description: "Assis ou debout, poussez les haltères au-dessus de la tête.",
        muscleGroup: "Épaules",
        difficulty: "Intermédiaire",
        videoUrl: "/placeholder.svg?height=400&width=600",
        instructions: "Gardez le dos droit et évitez de cambrer excessivement le bas du dos.",
      },
    ]

    // Insérer les exercices
    const insertedExercises = await db.insert(exercises).values(exercisesData).returning()

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
    ]

    // Insérer les programmes
    const insertedPrograms = await db.insert(programs).values(programsData).returning()

    // Créer des jours de programme
    const programDaysData = [
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
    ]

    // Insérer les jours de programme
    const insertedProgramDays = await db.insert(programDays).values(programDaysData).returning()

    // Associer des exercices aux jours
    const dayExercisesData = [
      // Jour 1 - Programme Complet
      {
        dayId: insertedProgramDays[0].id,
        exerciseId: insertedExercises[0].id, // Squat
        sets: 4,
        reps: "10-12",
        restTime: "90 sec",
        orderIndex: 1,
      },
      {
        dayId: insertedProgramDays[0].id,
        exerciseId: insertedExercises[1].id, // Fentes
        sets: 3,
        reps: "12 (par jambe)",
        restTime: "60 sec",
        orderIndex: 2,
      },
      {
        dayId: insertedProgramDays[0].id,
        exerciseId: insertedExercises[5].id, // Crunch
        sets: 3,
        reps: "15-20",
        restTime: "45 sec",
        orderIndex: 3,
      },
      {
        dayId: insertedProgramDays[0].id,
        exerciseId: insertedExercises[6].id, // Planche
        sets: 3,
        reps: "30-45 sec",
        restTime: "45 sec",
        orderIndex: 4,
      },

      // Jour 2 - Programme Complet
      {
        dayId: insertedProgramDays[1].id,
        exerciseId: insertedExercises[2].id, // Développé couché
        sets: 4,
        reps: "8-10",
        restTime: "90 sec",
        orderIndex: 1,
      },
      {
        dayId: insertedProgramDays[1].id,
        exerciseId: insertedExercises[7].id, // Développé épaules
        sets: 3,
        reps: "10-12",
        restTime: "60 sec",
        orderIndex: 2,
      },

      // Jour 3 - Programme Complet
      {
        dayId: insertedProgramDays[2].id,
        exerciseId: insertedExercises[3].id, // Tirage vertical
        sets: 4,
        reps: "8-10",
        restTime: "90 sec",
        orderIndex: 1,
      },
      {
        dayId: insertedProgramDays[2].id,
        exerciseId: insertedExercises[4].id, // Curl biceps
        sets: 3,
        reps: "10-12",
        restTime: "60 sec",
        orderIndex: 2,
      },

      // Jour 4 - Programme Complet
      {
        dayId: insertedProgramDays[3].id,
        exerciseId: insertedExercises[0].id, // Squat
        sets: 3,
        reps: "12-15",
        restTime: "60 sec",
        orderIndex: 1,
      },
      {
        dayId: insertedProgramDays[3].id,
        exerciseId: insertedExercises[2].id, // Développé couché
        sets: 3,
        reps: "12-15",
        restTime: "60 sec",
        orderIndex: 2,
      },
      {
        dayId: insertedProgramDays[3].id,
        exerciseId: insertedExercises[3].id, // Tirage vertical
        sets: 3,
        reps: "12-15",
        restTime: "60 sec",
        orderIndex: 3,
      },

      // Jour 1 - Débutant Total
      {
        dayId: insertedProgramDays[4].id,
        exerciseId: insertedExercises[2].id, // Développé couché
        sets: 3,
        reps: "10-12",
        restTime: "60 sec",
        orderIndex: 1,
      },
      {
        dayId: insertedProgramDays[4].id,
        exerciseId: insertedExercises[4].id, // Curl biceps
        sets: 3,
        reps: "12-15",
        restTime: "45 sec",
        orderIndex: 2,
      },
      {
        dayId: insertedProgramDays[4].id,
        exerciseId: insertedExercises[7].id, // Développé épaules
        sets: 3,
        reps: "10-12",
        restTime: "60 sec",
        orderIndex: 3,
      },

      // Jour 2 - Débutant Total
      {
        dayId: insertedProgramDays[5].id,
        exerciseId: insertedExercises[0].id, // Squat
        sets: 3,
        reps: "12-15",
        restTime: "60 sec",
        orderIndex: 1,
      },
      {
        dayId: insertedProgramDays[5].id,
        exerciseId: insertedExercises[1].id, // Fentes
        sets: 2,
        reps: "10 (par jambe)",
        restTime: "45 sec",
        orderIndex: 2,
      },

      // Jour 3 - Débutant Total
      {
        dayId: insertedProgramDays[6].id,
        exerciseId: insertedExercises[5].id, // Crunch
        sets: 3,
        reps: "15-20",
        restTime: "30 sec",
        orderIndex: 1,
      },
      {
        dayId: insertedProgramDays[6].id,
        exerciseId: insertedExercises[6].id, // Planche
        sets: 3,
        reps: "20-30 sec",
        restTime: "30 sec",
        orderIndex: 2,
      },
      {
        dayId: insertedProgramDays[6].id,
        exerciseId: insertedExercises[2].id, // Développé couché
        sets: 3,
        reps: "10-12",
        restTime: "60 sec",
        orderIndex: 3,
      },
    ]

    // Insérer les exercices des jours
    await db.insert(dayExercises).values(dayExercisesData)

    return { success: true, message: "Base de données initialisée avec succès!" }
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la base de données:", error)
    return { success: false, message: "Erreur lors de l'initialisation de la base de données." }
  }
}
