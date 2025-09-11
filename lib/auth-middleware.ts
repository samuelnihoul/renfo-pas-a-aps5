import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export interface AuthenticatedUser {
    userId: string
    email: string
    name: string
    isAdmin: boolean
    isPremium: boolean
}

export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
    const token = await getToken({
        req: request,
        cookieName: 'auth-token',
        secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) return null

    const userId = (token.sub as string) || (token.id as string) || ''
    const email = (token.email as string) || ''
    const name = (token.name as string) || ''
    const isAdmin = Boolean((token as any).isAdmin)
    const isPremium = Boolean((token as any).isPremium)

    return { userId, email, name, isAdmin, isPremium }
}

export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
    const user = await getAuthenticatedUser(request)
    if (!user) {
        throw new Error('Non authentifié')
    }
    return user
}

export async function requireAdmin(request: NextRequest): Promise<AuthenticatedUser> {
    const user = await requireAuth(request)
    if (!user.isAdmin) {
        throw new Error('Accès non autorisé')
    }
    return user
}


