import { NextResponse } from "next/server"
import { db } from "@/db"
import { userPrograms, programs } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export async function POST(request: Request) {
    try {
        const { userId, programId, dayNumber } = await request.json()

        if (!userId || !programId) {
            return NextResponse.json({ error: "userId et programId sont requis" }, { status: 400 })
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

        // Vérifier si c'est le programme 1 et les 2 premières semaines (14 jours)
        if (programId === 1 && dayNumber && dayNumber <= 14) {
            return NextResponse.json({ hasAccess: true, reason: "free_trial" })
        }

        // Pas d'accès
        return NextResponse.json({ hasAccess: false, reason: "not_purchased" })
    } catch (error) {
        console.error("Error checking program access:", error)
        return NextResponse.json({ error: "Erreur lors de la vérification d'accès" }, { status: 500 })
    }
} 