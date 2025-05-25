import { NextResponse } from "next/server"
import { db } from "@/db"
import { routines, programs } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    // Récupérer toutes les routines
    const routinesList = await db.select().from(routines)

    // Pour chaque routine, récupérer les informations du programme associé
    const routinesWithPrograms = await Promise.all(
      routinesList.map(async (routine) => {
        const program = await db.select().from(programs).where(eq(programs.id, routine.programId)).limit(1)
        return {
          ...routine,
          program: program[0] || null,
        }
      }),
    )

    return NextResponse.json(routinesWithPrograms)
  } catch (error) {
    console.error("Error fetching routines:", error)
    return NextResponse.json({ error: "Failed to fetch routines" }, { status: 500 })
  }
}