import { auth } from "@/lib/auth"
import { db } from "@/db"
import { userPrograms } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ hasPurchased: false })
    }

    const userProgramsList = await db
      .select()
      .from(userPrograms)
      .where(eq(userPrograms.userId, session.user.id))
      .limit(1)

    return NextResponse.json({
      hasPurchased: userProgramsList.length > 0
    })
  } catch (error) {
    console.error("Error checking purchased programs:", error)
    return NextResponse.json(
      { error: "Erreur lors de la vérification des programmes achetés" },
      { status: 500 }
    )
  }
}
