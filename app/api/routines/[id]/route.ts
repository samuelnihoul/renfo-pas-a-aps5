import { NextResponse } from "next/server"
import { db } from "@/db"
import { routines, programs } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: Request, { params }: { params: { id: string } }) {
	const awaitedParams=await params
  try {
    const id = Number.parseInt(awaitedParams.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid routine ID" }, { status: 400 })
    }

    // Récupérer la routine
    const routine = await db.select().from(routines).where(eq(routines.id, id)).limit(1)

    if (routine.length === 0) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 })
    }

    return NextResponse.json(routine)
  } catch (error) {
    console.error("Error fetching routine:", error)
    return NextResponse.json({ error: "Failed to fetch routine" }, { status: 500 })
  }
}
