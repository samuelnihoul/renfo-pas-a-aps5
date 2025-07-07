import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
    try {
        const { email, password, name } = await request.json()

        if (!email || !password || !name) {
            return NextResponse.json({ error: "Email, mot de passe et nom sont requis" }, { status: 400 })
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)

        if (existingUser.length > 0) {
            return NextResponse.json({ error: "Un utilisateur avec cet email existe déjà" }, { status: 409 })
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 12)

        // Créer l'utilisateur
        const newUser = await db.insert(users).values({
            id: uuidv4(),
            email,
            name,
            passwordHash: hashedPassword,
            isPremium: false,
            isAdmin: false,
        }).returning()

        return NextResponse.json({
            message: "Utilisateur créé avec succès",
            user: {
                id: newUser[0].id,
                email: newUser[0].email,
                name: newUser[0].name,
            }
        })
    } catch (error) {
        console.error("Error creating user:", error)
        return NextResponse.json({ error: "Erreur lors de la création de l'utilisateur" }, { status: 500 })
    }
} 