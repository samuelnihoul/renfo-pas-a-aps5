import { NextResponse } from "next/server"
import { db } from "@/db"
import { userPrograms, programs } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get("userId")

        if (!userId) {
            return NextResponse.json({ error: "userId est requis" }, { status: 400 })
        }

        // Récupérer les programmes achetés par l'utilisateur
        const purchasedPrograms = await db
            .select({
                id: userPrograms.id,
                userId: userPrograms.userId,
                programId: userPrograms.programId,
                purchaseDate: userPrograms.purchaseDate,
                program: {
                    id: programs.id,
                    name: programs.name,
                    material: programs.material,
                },
            })
            .from(userPrograms)
            .innerJoin(programs, eq(userPrograms.programId, programs.id))
            .where(eq(userPrograms.userId, Number.parseInt(userId)))

        return NextResponse.json(purchasedPrograms)
    } catch (error) {
        console.error("Error fetching purchased programs:", error)
        return NextResponse.json({ error: "Erreur lors de la récupération des programmes achetés" }, { status: 500 })
    }
} 