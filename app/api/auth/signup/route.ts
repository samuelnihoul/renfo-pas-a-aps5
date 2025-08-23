import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm/expressions"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    // Input validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, mot de passe et nom sont requis" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        id: uuidv4(),
        email,
        name,
        passwordHash: hashedPassword,
        isPremium: false,
        isAdmin: false,
        emailVerified: new Date(),
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        isPremium: users.isPremium,
        isAdmin: users.isAdmin,
      })

    return NextResponse.json({
      message: "Inscription réussie",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        isPremium: newUser.isPremium,
        isAdmin: newUser.isAdmin,
      },
    })
  } catch (error) {
    console.error("Error during signup:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 }
    )
  }
} 