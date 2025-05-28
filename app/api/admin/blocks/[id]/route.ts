/**
 * API endpoint for managing blocks (day exercises)
 * 
 * This endpoint allows administrators to delete blocks from the database.
 * It's part of the block feature audit improvements to ensure proper data management.
 */

import { NextResponse } from "next/server"
import { db } from "@/db"
import { blocks } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid block ID" },
        { status: 400 }
      )
    }

    // Delete the block
    await db.delete(blocks).where(eq(blocks.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting block:", error)
    return NextResponse.json(
      { error: "Failed to delete block" },
      { status: 500 }
    )
  }
}
