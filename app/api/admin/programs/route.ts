import { NextResponse } from "next/server"
import { db } from "@/db"
import { programs, routines } from "@/db/schema"
import { eq } from "drizzle-orm"


export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("body",body)
    const { name, requiredEquipment,routineIds } = body

    if (!name) {
      return NextResponse.json({ error: "Le nom du programme est requis" }, { status: 400 })
    }

    // Vérifier qu'il y a au moins un jour d'entraînement
    if (!routineIds || !Array.isArray(routineIds) || routineIds.length === 0) {
      return NextResponse.json(
        { error: "Au moins un jour d'entraînement est requis" },
        { status: 400 }
      )
    }
    try {
      // Créer le programme
      const newProgram = await db
        .insert(programs)
        .values({
          name,
          material:requiredEquipment,
          routineId:routineIds
        })
        .returning()


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
