import { NextResponse } from "next/server"
import { db } from "@/db"
import { exercises } from "@/db/schema"
import { eq } from "drizzle-orm"
import { deleteVideo } from "@/lib/file-storage"

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

    // Si l'exercice a une vidéo, la supprimer
    if (existingExercise[0].videoPublicId) {
      try {
        await deleteVideo(existingExercise[0].videoPublicId);
      } catch (deleteError) {
        console.error("Erreur lors de la suppression de la vidéo:", deleteError);
        // Continuer malgré l'erreur de suppression de la vidéo
      }
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
    const { name, description, instructions, videoUrl, videoPublicId } = body

    if (!name) {
      return NextResponse.json({ error: "Le nom de l'exercice est requis" }, { status: 400 })
    }

    const updatedExercise = await db
      .update(exercises)
      .set({
        name,
        instructions: instructions || null,
        videoUrl: videoUrl || null,
        videoPublicId: videoPublicId || null,
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
