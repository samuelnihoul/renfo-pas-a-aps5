import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { db } from "@/db"
import { userPrograms, programs } from "@/db/schema"
import { headers } from "next/headers"
import { eq, and } from "drizzle-orm"

export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const headersList = await headers()
        const signature = headersList.get("stripe-signature")

        if (!signature) {
            return NextResponse.json({ error: "Signature manquante" }, { status: 400 })
        }

        let event

        try {
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET || ""
            )
        } catch (err) {
            console.error("Webhook signature verification failed:", err)
            return NextResponse.json({ error: "Signature invalide" }, { status: 400 })
        }

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as any

            const { userId, programId, stripeProductId } = session.metadata

            if (!userId || !programId || !stripeProductId) {
                console.error("Métadonnées manquantes dans la session Stripe")
                return NextResponse.json({ error: "Métadonnées manquantes" }, { status: 400 })
            }

            // Vérifier que le programme existe et correspond au produit Stripe
            const program = await db
                .select()
                .from(programs)
                .where(eq(programs.id, Number.parseInt(programId)))
                .limit(1)

            if (!program.length) {
                console.error("Programme non trouvé")
                return NextResponse.json({ error: "Programme non trouvé" }, { status: 404 })
            }

            if (program[0].stripeProductId !== stripeProductId) {
                console.error("L'ID du produit Stripe ne correspond pas au programme")
                return NextResponse.json({ error: "Incohérence des données du programme" }, { status: 400 })
            }

            // Vérifier si l'utilisateur a déjà acheté ce programme
            const existingPurchase = await db
                .select()
                .from(userPrograms)
                .where(
                    and(
                        eq(userPrograms.userId, userId),
                        eq(userPrograms.programId, Number.parseInt(programId))
                    )
                )

            if (existingPurchase.length > 0) {
                console.log("Programme déjà acheté par l'utilisateur")
                return NextResponse.json({ message: "Programme déjà acheté" })
            }

            // Enregistrer l'achat
            await db.insert(userPrograms).values({
                userId,
                programId: Number.parseInt(programId),
                stripeProductId,
                purchaseDate: new Date()
            })

            console.log(`Achat enregistré: Utilisateur ${userId} a acheté le programme ${programId}`)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error("Webhook error:", error)
        return NextResponse.json({ error: "Erreur webhook" }, { status: 500 })
    }
} 