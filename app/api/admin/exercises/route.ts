import { NextResponse } from "next/server"
import { db } from "@/db"
import { exercises } from "@/db/schema"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, instructions, videoUrl, videoPublicId } = body

    if (!name) {
      return NextResponse.json({ error: "Le nom de l'exercice est requis" }, { status: 400 })
    }

    // Create a proper Date object for createdAt
    const now = new Date()

    const newExercise = await db
      .insert(exercises)
      .values({
        name,
        description: description || null,
        instructions: instructions || null,
        videoUrl: videoUrl || null,
        videoPublicId: videoPublicId || null,
        createdAt: now, // Use the Date object directly
      })
      .returning()

    return NextResponse.json(newExercise[0])
  } catch (error) {
    console.error("Error creating exercise:", error)
    return NextResponse.json({ error: "Erreur lors de la création de l'exercice" }, { status: 500 })
  }
}
