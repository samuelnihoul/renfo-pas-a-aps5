import { NextResponse } from "next/server"
import { signOut } from "next-auth/react"

export async function POST() {
  try {
    // This will remove the session cookie
    await signOut({ redirect: false })
    
    return NextResponse.json({ message: "Déconnexion réussie" })
  } catch (error) {
    console.error("Error signing out:", error)
    return NextResponse.json(
      { error: "Erreur lors de la déconnexion" }, 
      { status: 500 }
    )
  }
} 