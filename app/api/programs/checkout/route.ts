import { NextRequest, NextResponse } from "next/server"
import { createCheckoutSession } from "@/lib/stripe"
import { getToken } from "next-auth/jwt"
import { db } from "@/db"
import { programs } from "@/db/schema"
import { eq } from "drizzle-orm"

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

        // Récupérer les informations du programme
        const program = await db.select().from(programs).where(eq(programs.id, programId)).limit(1)

        if (!program[0]) {
            return NextResponse.json({ error: "Programme non trouvé" }, { status: 404 })
        }

        if (!program[0].stripeProductId) {
            return NextResponse.json(
                { error: "Ce programme n'est pas encore disponible à l'achat" }, 
                { status: 400 }
            )
        }

        // Créer la session de paiement
        const session = await createCheckoutSession({
            userId: userId,
            programId,
            programName: program[0].name,
            stripeProductId: program[0].stripeProductId,
        })

        return NextResponse.json({ sessionId: session.id, url: session.url })
    } catch (error) {
        console.error("Error creating checkout session:", error)
        return NextResponse.json({ error: "Erreur lors de la création de la session de paiement" }, { status: 500 })
    }
} 