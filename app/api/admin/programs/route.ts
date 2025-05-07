import { NextResponse } from "next/server"
import { db } from "@/db"
import { programs } from "@/db/schema"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, difficulty, duration } = body

    if (!name) {
      return NextResponse.json({ error: "Le nom du programme est requis" }, { status: 400 })
    }

    // Validation supplémentaire
    if (!difficulty) {
      return NextResponse.json({ error: "La difficulté est requise" }, { status: 400 })
    }

    // Create a proper Date object for createdAt
    const now = new Date()

    const newProgram = await db
      .insert(programs)
      .values({
        name,
        description: description || null,
        difficulty,
        duration: duration || null,
        createdAt: now, // Use the Date object directly
      })
      .returning()

    return NextResponse.json(newProgram[0])
  } catch (error) {
    console.error("Error creating program:", error)
    return NextResponse.json({ error: "Erreur lors de la création du programme" }, { status: 500 })
  }
}
