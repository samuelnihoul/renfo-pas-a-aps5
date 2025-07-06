import { NextRequest, NextResponse } from "next/server"
import { verify } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface AuthenticatedUser {
    userId: string
    email: string
    name: string
    isAdmin: boolean
    isPremium: boolean
}

export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
    try {
        const token = request.cookies.get("auth-token")?.value

        if (!token) {
            return null
        }

        const decoded = verify(token, JWT_SECRET) as AuthenticatedUser
        return decoded
    } catch (error) {
        return null
    }
}

export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
    const user = await getAuthenticatedUser(request)

    if (!user) {
        throw new Error("Non authentifié")
    }

    return user
} 