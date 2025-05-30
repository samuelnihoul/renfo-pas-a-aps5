import { NextResponse } from "next/server"
import { db } from "@/db"
import { routines, programs } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    // Récupérer toutes les routines
    const routinesList = await db.select().from(routines)



    return NextResponse.json(routinesList)
  } catch (error) {
    console.error("Error fetching routines:", error)
    return NextResponse.json({ error: "Failed to fetch routines" }, { status: 500 })
  }
}