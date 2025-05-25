import { NextResponse } from "next/server"
import { db } from "@/db"
import { routines } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { programId, dayNumber, name, focus } = body

    // Validation
    if (!programId || !dayNumber || !name) {
      return NextResponse.json(
        { error: "Missing required fields: programId, dayNumber, name" },
        { status: 400 }
      )
    }

    // Check if a routine with the same programId and dayNumber already exists
    const existingRoutine = await db.query.routines.findMany({
      where: (routines) => 
        eq(routines.programId, programId) && 
        eq(routines.dayNumber, dayNumber),
      limit: 1
    })

    if (existingRoutine.length > 0) {
      return NextResponse.json(
        { error: "A routine with this program ID and day number already exists" },
        { status: 409 }
      )
    }

    // Create the routine
    const result = await db.insert(routines).values({
      programId,
      dayNumber,
      name,
      focus: focus || null,
    }).returning()

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating routine:", error)
    return NextResponse.json({ error: "Failed to create routine" }, { status: 500 })
  }
}
