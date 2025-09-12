import { NextResponse, NextRequest } from "next/server"
import { db } from "@/db"
import { programs, blocks, exercises } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getToken } from "next-auth/jwt"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const paramsAwaited = await params
  try {
    const id = Number.parseInt(paramsAwaited.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid day ID" }, { status: 400 })
    }

    // Récupérer l'ID de l'utilisateur depuis les headers ou la session
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }
    const userId = token.sub || token.id as string || ''
    const isAdmin = Boolean((token as any).isAdmin)
    console.log({ userId, isAdmin })

    // Si admin, accès total
    if (isAdmin) {
      // Récupérer les blocs du jour
      const blockList = await db.select().from(programs).where(eq(programs.id, id))
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
    }

    // Vérifier l'accès au programme (pour les non-admins)
    const accessResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/programs/access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, programId: id }) // dayNumber à adapter selon le contexte
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
