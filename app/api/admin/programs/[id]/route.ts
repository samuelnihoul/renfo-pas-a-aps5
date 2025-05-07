import { NextResponse } from "next/server"
import { db } from "@/db"
import { programs } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const body = await request.json()
    const { name, description, difficulty, duration } = body

    if (!name) {
      return NextResponse.json({ error: "Le nom du programme est requis" }, { status: 400 })
    }

    const updatedProgram = await db
      .update(programs)
      .set({
        name,
        description,
        difficulty,
        duration,
      })
      .where(eq(programs.id, id))
      .returning()

    if (!updatedProgram.length) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 })
    }

    return NextResponse.json(updatedProgram[0])
  } catch (error) {
    console.error("Error updating program:", error)
    return NextResponse.json({ error: "Failed to update program" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 })
    }

    // Vérifier si le programme existe
    const existingProgram = await db.select().from(programs).where(eq(programs.id, id)).limit(1)

    if (!existingProgram.length) {
      return NextResponse.json({ error: "Programme non trouvé" }, { status: 404 })
    }

    // Supprimer le programme
    await db.delete(programs).where(eq(programs.id, id))

    return NextResponse.json({ success: true, message: "Programme supprimé avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression du programme:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression du programme" }, { status: 500 })
  }
}
