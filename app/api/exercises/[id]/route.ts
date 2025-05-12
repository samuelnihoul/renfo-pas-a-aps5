import { NextResponse } from "next/server"
import { db } from "@/db"
import { exercises } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const awaitedParams = await params
  try {
    const id = Number.parseInt(awaitedParams.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const exercise = await db.query.exercises.findFirst({
      where: eq(exercises.id, id),
    })

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 })
    }

    return NextResponse.json(exercise)
  } catch (error) {
    console.error("Error fetching exercise:", error)
    return NextResponse.json({ error: "Failed to fetch exercise" }, { status: 500 })
  }
}
