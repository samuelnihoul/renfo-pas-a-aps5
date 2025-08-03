import { NextResponse } from "next/server"
import { db } from "@/db"
import { routines } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { blockId, orderIndex, name, equipment, sessionOutcome } = body

    // Validation
    if (!blockId || !name) {
      return NextResponse.json(
        { error: "Missing required fields: blockId, orderIndex, name" },
        { status: 400 }
      )
    }

    // Create the routine
    const result = await db.insert(routines).values({
      blockId,
      name,
      equipment: equipment || null,
      sessionOutcome: sessionOutcome || null,
    }).returning()

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating routine:", error)
    return NextResponse.json({ error: "Failed to create routine" }, { status: 500 })
  }
}
