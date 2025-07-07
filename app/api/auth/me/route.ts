import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request)

        if (!user) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
        }

        return NextResponse.json({ user })
    } catch (error) {
        console.error("Error getting user:", error)
        return NextResponse.json({ error: "Erreur lors de la récupération de l'utilisateur" }, { status: 500 })
    }
} 