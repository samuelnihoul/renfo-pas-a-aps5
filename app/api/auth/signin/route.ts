import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { sign } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json({ error: "Email et mot de passe sont requis" }, { status: 400 })
        }

        // Récupérer l'utilisateur
        const user = await db.select().from(users).where(eq(users.email, email)).limit(1)

        if (!user[0] || !user[0].passwordHash) {
            return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 })
        }

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user[0].passwordHash)

        if (!isPasswordValid) {
            return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 })
        }

        // Créer un token JWT
        const token = sign(
            {
                userId: user[0].id,
                email: user[0].email,
                name: user[0].name,
                isAdmin: user[0].isAdmin,
                isPremium: user[0].isPremium
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        )

        // Définir le cookie
        const cookieStore = await cookies()
        cookieStore.set("auth-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60, // 7 jours
        })

        return NextResponse.json({
            message: "Connexion réussie",
            user: {
                id: user[0].id,
                email: user[0].email,
                name: user[0].name,
                isAdmin: user[0].isAdmin,
                isPremium: user[0].isPremium,
            }
        })
    } catch (error) {
        console.error("Error signing in:", error)
        return NextResponse.json({ error: "Erreur lors de la connexion" }, { status: 500 })
    }
} 