import { NextResponse } from "next/server"
import { db } from "@/db"
import { programs, programDays } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    // Récupérer tous les programmes
    const programsList = await db.select().from(programs)

    // Pour chaque programme, récupérer ses jours
    const programsWithDays = await Promise.all(
      programsList.map(async (program) => {
        const days = await db.select().from(programDays).where(eq(programDays.programId, program.id))
        return {
          ...program,
          days: days,
        }
      }),
    )

    return NextResponse.json(programsWithDays)
  } catch (error) {
    console.error("Error fetching programs:", error)
    return NextResponse.json({ error: "Failed to fetch programs" }, { status: 500 })
  }
}
