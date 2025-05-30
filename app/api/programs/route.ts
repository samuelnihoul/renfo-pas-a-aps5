import { NextResponse } from "next/server"
import { db } from "@/db"
import { programs, routines } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    // Récupérer tous les programmes
    const programsList = await db.select().from(programs)



    return NextResponse.json(programsList)
  } catch (error) {
    console.error("Error fetching programs:", error)
    return NextResponse.json({ error: "Failed to fetch programs" }, { status: 500 })
  }
}
