import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Clear the default NextAuth session cookie
    const response = NextResponse.json({ message: "Déconnexion réussie" })
    response.headers.append(
      "Set-Cookie",
      [
        // Invalidate the default NextAuth session cookie
        `next-auth.session-token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}`,
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