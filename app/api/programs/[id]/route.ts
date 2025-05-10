import { NextResponse } from "next/server"
import { db } from "@/db"
import { programs, programDays } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const paramsAwaited = await params
  try {
    const id = Number.parseInt(paramsAwaited.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    // Récupérer le programme
    const program = await db.select().from(programs).where(eq(programs.id, id)).limit(1)

    if (!program || program.length === 0) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 })
    }

    // Récupérer les jours du programme séparément
    const days = await db.select().from(programDays).where(eq(programDays.programId, id))

    // Combiner les résultats
    const result = {
      ...program[0],
      days: days,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching program:", error)
    return NextResponse.json({ error: "Failed to fetch program" }, { status: 500 })
  }
}
