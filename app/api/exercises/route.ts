import { NextResponse } from "next/server"
import { db } from "@/db"
import { exercises } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const muscleGroup = searchParams.get("muscleGroup")

    let exercisesList

    if (muscleGroup) {
      exercisesList = await db.query.exercises.findMany({
        where: eq(exercises.muscleGroup, muscleGroup),
      })
    } else {
      exercisesList = await db.query.exercises.findMany()
    }

    return NextResponse.json(exercisesList)
  } catch (error) {
    console.error("Error fetching exercises:", error)
    return NextResponse.json({ error: "Failed to fetch exercises" }, { status: 500 })
  }
}
