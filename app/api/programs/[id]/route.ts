import { NextResponse } from "next/server"
import { db } from "@/db"
import { programs, blocks, exercises } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: Request, { params }: { params: { id: string; dayId: string } }) {
  const paramsAwaited = await params
  try {
    const id = Number.parseInt(paramsAwaited.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid day ID" }, { status: 400 })
    }

    // Récupérer l'ID de l'utilisateur depuis les headers ou la session
    // TODO: Implémenter la récupération de l'utilisateur connecté
    const userId = 1 // Temporaire, à remplacer par l'utilisateur connecté

    // Vérifier l'accès au programme
    const accessResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/programs/access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, programId: id, dayNumber: 1 }) // dayNumber à adapter selon le contexte
    })

    if (!accessResponse.ok) {
      return NextResponse.json({ error: "Erreur lors de la vérification d'accès" }, { status: 500 })
    }

    const accessData = await accessResponse.json()
    if (!accessData.hasAccess) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    // Récupérer les blocs du jour
    const blockList = await db.select().from(programs).where(eq(programs.id, id))

    // Récupérer les détails des exercices associés à chaque bloc
    const result = await Promise.all(
      blockList.map(async (block) => {
        const exerciseDetails = await db
          .select()
          .from(programs)
          .where(eq(programs.id, id))
          .limit(1)

        return {
          ...block,
          exercise: exerciseDetails[0],
        }
      }),
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching day exercises:", error)
    return NextResponse.json({ error: "Failed to fetch day exercises" }, { status: 500 })
  }
}
