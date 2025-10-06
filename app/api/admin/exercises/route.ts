import { NextResponse } from "next/server"
import { db } from "@/db"
import { exercises } from "@/db/schema"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, objectifs, instructions, videoUrl, videoPublicId, short, muscleGroup } = body

    if (!name) {
      return NextResponse.json({ error: "Le nom de l'exercice est requis" }, { status: 400 })
    }

    // Create a proper Date object for createdAt
    const now = new Date()

    const newExercise = await db
      .insert(exercises)
      .values({
        name,
        instructions: instructions || null,
        videoPublicId: videoPublicId || null,
        short: short || null,
        objectifs: objectifs || null,
        muscleGroup: muscleGroup || null,
        createdAt: now, // Use the Date object directly
      })
      .returning()

    return NextResponse.json(newExercise[0])
  } catch (error) {
    console.error("Error creating exercise:", error)
    return NextResponse.json({ error: "Erreur lors de la création de l'exercice" }, { status: 500 })
  }
}
