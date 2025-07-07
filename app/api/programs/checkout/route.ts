import { NextRequest, NextResponse } from "next/server"
import { createCheckoutSession } from "@/lib/stripe"
import { getAuthenticatedUser } from "@/lib/auth-middleware"
import { db } from "@/db"
import { programs } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request)

        if (!user) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
        }

        const { programId } = await request.json()

        if (!programId) {
            return NextResponse.json({ error: "programId est requis" }, { status: 400 })
        }

        // Récupérer les informations du programme
        const program = await db.select().from(programs).where(eq(programs.id, programId)).limit(1)

        if (!program[0]) {
            return NextResponse.json({ error: "Programme non trouvé" }, { status: 404 })
        }

        // Prix des programmes (en euros)
        const programPrices: Record<number, number> = {
            1: 29.99, // Programme 1
            2: 39.99, // Programme 2
            3: 49.99, // Programme 3
        }

        const price = programPrices[programId] || 29.99

        // Créer la session de paiement
        const session = await createCheckoutSession({
            userId: user.userId,
            programId,
            programName: program[0].name,
            price,
        })

        return NextResponse.json({ sessionId: session.id, url: session.url })
    } catch (error) {
        console.error("Error creating checkout session:", error)
        return NextResponse.json({ error: "Erreur lors de la création de la session de paiement" }, { status: 500 })
    }
} 