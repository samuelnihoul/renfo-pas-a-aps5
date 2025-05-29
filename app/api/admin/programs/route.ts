import { NextResponse } from "next/server"
import { db } from "@/db"
import { programs, routines } from "@/db/schema"
import { eq } from "drizzle-orm"

type ProgramDay = {
  dayNumber: number
  routineId: number
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, duration, days } = body

    if (!name) {
      return NextResponse.json({ error: "Le nom du programme est requis" }, { status: 400 })
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
          duration: duration || null,
          createdAt: new Date(),
        })
        .returning()

      // Associer les routines existantes au programme
      for (const day of days as ProgramDay[]) {
        // Vérifier que la routine existe
        const routine = await db.query.routines.findFirst({
          where: eq(routines.id, day.routineId)
        });

        if (!routine) {
          throw new Error(`Routine avec l'ID ${day.routineId} non trouvée`);
        }

        // Mettre à jour la routine avec l'ID du programme et le numéro du jour
        await db
          .update(routines)
          .set({
            programId: newProgram.id,
            dayNumber: day.dayNumber,
            updatedAt: new Date(),
          })
          .where(eq(routines.id, day.routineId));
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
