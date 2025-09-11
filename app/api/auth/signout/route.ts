import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Clear the NextAuth session cookie we configured (auth-token)
    const response = NextResponse.json({ message: "Déconnexion réussie" })
    response.headers.append(
      "Set-Cookie",
      [
        // Invalidate the auth-token cookie
        `auth-token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}`,
      ].join("\n")
    )
    return response
  } catch (error) {
    console.error("Error signing out:", error)
    return NextResponse.json(
      { error: "Erreur lors de la déconnexion" },
      { status: 500 }
    )
  }
}