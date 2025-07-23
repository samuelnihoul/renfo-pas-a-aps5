import { NextResponse } from "next/server"
import { db } from "@/db"
import { blocks } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const awaitedParams = await params
  console.log("[API] /api/blocs/[id] called with params:", awaitedParams);
  try {
    const id = Number.parseInt(awaitedParams.id)
    console.log("[API] Parsed id:", id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const block = await db.query.blocks.findFirst({
      where: eq(blocks.id, id),
    })
    console.log("[API] Block fetched from DB:", block);

    if (!block) {
      return NextResponse.json({ error: "Block not found" }, { status: 404 })
    }

    return NextResponse.json(block)
  } catch (error) {
    console.error("[API] Error fetching block:", error)
    return NextResponse.json({ error: "Failed to fetch block" }, { status: 500 })
  }
}