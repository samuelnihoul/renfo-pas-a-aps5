import { NextResponse } from "next/server"
import { db } from "@/db"
import { blocks } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const awaitedParams = await params
  try {
    const id = Number.parseInt(awaitedParams.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const block = await db.query.blocks.findFirst({
      where: eq(blocks.id, id),
    })

    if (!block) {
      return NextResponse.json({ error: "Block not found" }, { status: 404 })
    }

    return NextResponse.json(block)
  } catch (error) {
    console.error("Error fetching block:", error)
    return NextResponse.json({ error: "Failed to fetch block" }, { status: 500 })
  }
}