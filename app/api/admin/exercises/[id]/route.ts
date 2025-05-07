import { NextResponse } from "next/server"
import { db } from "@/db"
import { exercises } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 })
    }

    // Vérifier si l'exercice existe
    const existingExercise = await db.select().from(exercises).where(eq(exercises.id, id)).limit(1)

    if (!existingExercise.length) {
      return NextResponse.json({ error: "Exercice non trouvé" }, { status: 404 })
    }

    // Supprimer l'exercice
    await db.delete(exercises).where(eq(exercises.id, id))

    return NextResponse.json({ success: true, message: "Exercice supprimé avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression de l'exercice:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression de l'exercice" }, { status: 500 })
  }
}

// Ajoutons aussi la route GET pour récupérer un exercice spécifique
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 })
    }

    const exercise = await db.select().from(exercises).where(eq(exercises.id, id)).limit(1)

    if (!exercise.length) {
      return NextResponse.json({ error: "Exercice non trouvé" }, { status: 404 })
    }

    return NextResponse.json(exercise[0])
  } catch (error) {
    console.error("Erreur lors de la récupération de l'exercice:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération de l'exercice" }, { status: 500 })
  }
}

// Et la route PUT pour mettre à jour un exercice
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 })
    }

    const body = await request.json()
    const { name, description, muscleGroup, difficulty, instructions, videoUrl } = body

    if (!name) {
      return NextResponse.json({ error: "Le nom de l'exercice est requis" }, { status: 400 })
    }

    if (!muscleGroup) {
      return NextResponse.json({ error: "Le groupe musculaire est requis" }, { status: 400 })
    }

    if (!difficulty) {
      return NextResponse.json({ error: "La difficulté est requise" }, { status: 400 })
    }

    const updatedExercise = await db
      .update(exercises)
      .set({
        name,
        description: description || null,
        muscleGroup,
        difficulty,
        instructions: instructions || null,
        videoUrl: videoUrl || null,
      })
      .where(eq(exercises.id, id))
      .returning()

    if (!updatedExercise.length) {
      return NextResponse.json({ error: "Exercice non trouvé" }, { status: 404 })
    }

    return NextResponse.json(updatedExercise[0])
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'exercice:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour de l'exercice" }, { status: 500 })
  }
}
