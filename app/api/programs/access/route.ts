import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { userPrograms, programs } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { getToken } from "next-auth/jwt"

export async function POST(request: NextRequest) {
    try {
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

        if (!token) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
        }

        const userId = token.sub || token.id as string || ''
        const { programId } = await request.json()

        if (!programId) {
            return NextResponse.json({ error: "programId est requis" }, { status: 400 })
        }

        // Vérifier si l'utilisateur a acheté le programme
        const purchase = await db
            .select()
            .from(userPrograms)
            .where(
                and(
                    eq(userPrograms.userId, userId),
                    eq(userPrograms.programId, programId)
                )
            )

        // Si l'utilisateur a acheté le programme, il a accès
        if (purchase.length > 0) {
            return NextResponse.json({ hasAccess: true, reason: "purchased" })
        }


        // Pas d'accès
        return NextResponse.json({ hasAccess: false, reason: "not_purchased" })
    } catch (error) {
        console.error("Error checking program access:", error)
        return NextResponse.json({ error: "Erreur lors de la vérification d'accès" }, { status: 500 })
    }
} 
