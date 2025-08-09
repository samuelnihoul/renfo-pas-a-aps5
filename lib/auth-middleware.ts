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

export async function requireAdmin(request: NextRequest): Promise<AuthenticatedUser> {
    const user = await requireAuth(request)
    
    if (!user.isAdmin) {
        const url = new URL('/', request.url)
        url.searchParams.set('error', 'unauthorized')
        throw new Error(JSON.stringify({
            redirect: url.toString(),
            message: 'Accès non autorisé'
        }))
    }
    
    return user
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    try {
        // Protect admin routes
        if (pathname.startsWith('/admin')) {
            await requireAdmin(request)
        }
        return NextResponse.next()
    } catch (error: any) {
        if (error.message.startsWith('{')) {
            const { redirect } = JSON.parse(error.message)
            if (redirect) {
                return NextResponse.redirect(redirect)
            }
        }
        
        // Handle other auth errors
        const url = new URL('/auth/signin', request.url)
        url.searchParams.set('callbackUrl', request.url)
        return NextResponse.redirect(url)
    }
}

export const config = {
    matcher: ['/admin/:path*'],
} 