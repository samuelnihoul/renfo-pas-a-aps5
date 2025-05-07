import { NextResponse } from "next/server"
import { db } from "@/db"
import { dayExercises, exercises } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: Request, { params }: { params: { id: string; dayId: string } }) {
  try {
    const dayId = Number.parseInt(params.dayId)

    if (isNaN(dayId)) {
      return NextResponse.json({ error: "Invalid day ID" }, { status: 400 })
    }

    // Récupérer les exercices du jour
    const dayExercisesList = await db.select().from(dayExercises).where(eq(dayExercises.dayId, dayId))

    // Récupérer les détails des exercices
    const result = await Promise.all(
      dayExercisesList.map(async (dayExercise) => {
        const exerciseDetails = await db
          .select()
          .from(exercises)
          .where(eq(exercises.id, dayExercise.exerciseId))
          .limit(1)

        return {
          ...dayExercise,
          exercise: exerciseDetails[0],
        }
      }),
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching day exercises:", error)
    return NextResponse.json({ error: "Failed to fetch day exercises" }, { status: 500 })
  }
}
