import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
    try {
        const cookieStore = await cookies()
        cookieStore.delete("auth-token")

        return NextResponse.json({ message: "Déconnexion réussie" })
    } catch (error) {
        console.error("Error signing out:", error)
        return NextResponse.json({ error: "Erreur lors de la déconnexion" }, { status: 500 })
    }
} 