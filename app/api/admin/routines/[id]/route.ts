import { NextResponse } from "next/server"
import { db } from "@/db"
import { routines } from "@/db/schema"
import { eq } from "drizzle-orm"
import {notEqual} from "node:assert";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid routine ID" }, { status: 400 })
    }

    // Récupérer la routine
    const routine = await db.query.routines.findFirst({
      where: eq(routines.id, id)
    })

    if (!routine) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 })
    }

    return NextResponse.json(routine)
  } catch (error) {
    console.error("Error fetching routine:", error)
    return NextResponse.json({ error: "Failed to fetch routine" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid routine ID" }, { status: 400 })
    }

    const body = await request.json()
    const { programId, dayNumber, name, focus } = body

    // Validation
    if (!programId || !dayNumber || !name) {
      return NextResponse.json(
        { error: "Missing required fields: programId, dayNumber, name" },
        { status: 400 }
      )
    }

    // Check if the routine exists
    const existingRoutine = await db.query.routines.findFirst({
      where: eq(routines.id, id)
    })

    if (!existingRoutine) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 })
    }

    // Update the routine
    const result = await db
      .update(routines)
      .set({
        programId,
        dayNumber,
        name,
        focus: focus || null,
      })
      .where(eq(routines.id, id))
      .returning()

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating routine:", error)
    return NextResponse.json({ error: "Failed to update routine" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid routine ID" }, { status: 400 })
    }

    // Check if the routine exists
    const existingRoutine = await db.query.routines.findFirst({
      where: eq(routines.id, id)
    })

    if (!existingRoutine) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 })
    }

    // Delete the routine
    await db.delete(routines).where(eq(routines.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting routine:", error)
    return NextResponse.json({ error: "Failed to delete routine" }, { status: 500 })
  }
}
