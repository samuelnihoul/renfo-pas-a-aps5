import { NextResponse } from "next/server"
import { db } from "@/db"
import {programs, blocks, exercises } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: Request, { params }: { params: { id: string; dayId: string } }) {
  const paramsAwaited = await params
  try {
    const id = Number.parseInt(paramsAwaited.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid day ID" }, { status: 400 })
    }

    // Récupérer les blocs du jour
    const blockList = await db.select().from(programs).where(eq(programs.id, id))

    // Récupérer les détails des exercices associés à chaque bloc
    const result = await Promise.all(
      blockList.map(async (block) => {
        const exerciseDetails = await db
          .select()
          .from(programs)
          .where(eq(programs.id, id))
          .limit(1)

        return {
          ...block,
          exercise: exerciseDetails[0],
        }
      }),
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching day exercises:", error)
    return NextResponse.json({ error: "Failed to fetch day exercises" }, { status: 500 })
  }
}
