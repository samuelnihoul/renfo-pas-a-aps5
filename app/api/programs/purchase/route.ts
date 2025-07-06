import { NextResponse } from "next/server"
import { db } from "@/db"
import { userPrograms } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export async function POST(request: Request) {
    try {
        const { userId, programId } = await request.json()

        if (!userId || !programId) {
            return NextResponse.json({ error: "userId et programId sont requis" }, { status: 400 })
        }

        // Vérifier si l'utilisateur a déjà acheté ce programme
        const existingPurchase = await db
            .select()
            .from(userPrograms)
            .where(
                and(
                    eq(userPrograms.userId, userId),
                    eq(userPrograms.programId, programId)
                )
            )

        if (existingPurchase.length > 0) {
            return NextResponse.json({ error: "Programme déjà acheté" }, { status: 409 })
        }

        // Créer l'achat
        const purchase = await db.insert(userPrograms).values({
            userId,
            programId,
        }).returning()

        return NextResponse.json(purchase[0])
    } catch (error) {
        console.error("Error purchasing program:", error)
        return NextResponse.json({ error: "Erreur lors de l'achat" }, { status: 500 })
    }
} 