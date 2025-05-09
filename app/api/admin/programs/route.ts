import { NextResponse } from "next/server"
import { db } from "@/db"
import { programs, programDays, dayExercises } from "@/db/schema"

type ProgramDay = {
  dayNumber: number
  name: string
  focus: string
  exercises: {
    exerciseId: number
    sets: number
    reps: string
    restTime: string
    orderIndex: number
  }[]
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, difficulty, duration, days } = body

    if (!name) {
      return NextResponse.json({ error: "Le nom du programme est requis" }, { status: 400 })
    }

    // Validation supplémentaire
    if (!difficulty) {
      return NextResponse.json({ error: "La difficulté est requise" }, { status: 400 })
    }

    // Vérifier qu'il y a au moins un jour d'entraînement
    if (!days || !Array.isArray(days) || days.length === 0) {
      return NextResponse.json(
        { error: "Au moins un jour d'entraînement est requis" },
        { status: 400 }
      )
    }    // Créer le programme sans utiliser de transaction (non supporté par neon-http)
    try {
      // Créer le programme
      const [newProgram] = await db
        .insert(programs)
        .values({
          name,
          description: description || null,
          difficulty,
          duration: duration || null,
          createdAt: new Date(),
        })
        .returning()

      // Créer les jours de programme
      for (const day of days as ProgramDay[]) {
        // Créer le jour
        const [newDay] = await db
          .insert(programDays)
          .values({
            programId: newProgram.id,
            dayNumber: day.dayNumber,
            name: day.name,
            focus: day.focus || null,
            createdAt: new Date(),
          })
          .returning()

        // Créer les exercices associés à ce jour
        if (day.exercises && day.exercises.length > 0) {
          const exercisesValues = day.exercises.map((exercise) => ({
            dayId: newDay.id,
            exerciseId: exercise.exerciseId,
            sets: exercise.sets,
            reps: exercise.reps,
            restTime: exercise.restTime || null,
            orderIndex: exercise.orderIndex,
            createdAt: new Date(),
          }))

          await db.insert(dayExercises).values(exercisesValues)
        }
      }

      return NextResponse.json({
        ...newProgram,
        message: "Programme créé avec succès"
      })
    } catch (innerError) {
      // Si une erreur se produit lors de la création, on la remonte
      console.error("Error in program creation process:", innerError)
      throw innerError
    }
  } catch (error) {
    console.error("Error creating program:", error)
    return NextResponse.json({ error: "Erreur lors de la création du programme" }, { status: 500 })
  }
}
