import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { userPrograms, programs } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getToken } from "next-auth/jwt"

export async function GET(request: NextRequest) {
    try {
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET,cookieName:process.env.COOKIE_NAME })

        if (!token) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
        }

        const userId = token.sub || token.id as string || ''

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
                },
            })
            .from(userPrograms)
            .innerJoin(programs, eq(userPrograms.programId, programs.id))
            .where(eq(userPrograms.userId, userId))

        return NextResponse.json(purchasedPrograms)
    } catch (error) {
        console.error("Error fetching purchased programs:", error)
        return NextResponse.json({ error: "Erreur lors de la récupération des programmes achetés" }, { status: 500 })
    }
} 
