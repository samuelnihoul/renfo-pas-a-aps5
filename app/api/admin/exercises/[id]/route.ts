//admin/exercices/[id]/route
import { NextResponse } from "next/server"
import { db } from "@/db"
import { exercises } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const awaitedParams = await params
  try {
    const id = Number.parseInt(awaitedParams.id)

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



// Et la route PUT pour mettre à jour un exercice
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const awaitedParams = await params
  try {
    const id = Number.parseInt(awaitedParams.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 })
    }

    const body = await request.json()
    const { name, objectifs, instructions, videoPublicId, short, muscleGroup } = body

    if (!name) {
      return NextResponse.json({ error: "Le nom de l'exercice est requis" }, { status: 400 })
    }

    const updatedExercise = await db
      .update(exercises)
      .set({
        name,
        instructions: instructions || null,
        videoPublicId: videoPublicId || null,
        short: short || null,
        objectifs: objectifs || null,
        muscleGroup: muscleGroup || null,
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
