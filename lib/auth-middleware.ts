import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const secretKey = new TextEncoder().encode(JWT_SECRET)

// Enable debug logging in development
const isDev = process.env.NODE_ENV === 'development'
const getTimestamp = () => new Date().toISOString()
const debug = (...args: any[]) => isDev && console.log(`[${getTimestamp()}] [Auth Debug]`, ...args)

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
        debug('Checking authentication token', { hasToken: !!token })

        if (!token) {
            debug('No auth token found in cookies')
            return null
        }

        debug('Verifying token...')
        const { payload } = await jwtVerify(token, secretKey, {
            algorithms: ['HS256']
        }) as { payload: AuthenticatedUser }
        debug('Token verified successfully', { userId: payload.userId, email: payload.email })
        return payload
    } catch (error) {
        debug('Token verification failed', error instanceof Error ? error.message : 'Unknown error')
        return null
    }
}

export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
    debug('requireAuth: Checking authentication')
    const user = await getAuthenticatedUser(request)

    if (!user) {
        debug('requireAuth: User not authenticated')
        throw new Error("Non authentifié")
    }

    debug('requireAuth: User authenticated', { userId: user.userId, email: user.email })
    return user
}

export async function requireAdmin(request: NextRequest): Promise<AuthenticatedUser> {
    debug('requireAdmin: Checking admin access')
    const user = await requireAuth(request)
    
    if (!user.isAdmin) {
        debug('requireAdmin: Access denied - user is not admin', { userId: user.userId })
        const url = new URL('/', request.url)
        url.searchParams.set('error', 'unauthorized')
        throw new Error(JSON.stringify({
            redirect: url.toString(),
            message: 'Accès non autorisé'
        }))
    }
    
    debug('requireAdmin: Admin access granted', { userId: user.userId, isAdmin: user.isAdmin })
    
    return user
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    debug('Middleware processing request', { path: pathname, method: request.method })

    try {
        // Protect admin routes
        if (pathname.startsWith('/admin')) {
            debug('Admin route detected, checking admin access...')
            await requireAdmin(request)
            debug('Admin access verified, proceeding...')
        }
        return NextResponse.next()
    } catch (error: any) {
        debug('Auth error:', error.message)
        
        if (error.message.startsWith('{')) {
            try {
                const { redirect, message } = JSON.parse(error.message)
                debug('Handling redirect error', { redirect, message })
                if (redirect) {
                    return NextResponse.redirect(redirect)
                }
            } catch (e) {
                debug('Error parsing error message:', e)
            }
        }
        
        // Handle other auth errors
        debug('Redirecting to signin page')
        const url = new URL('/auth/signin', request.url)
        url.searchParams.set('callbackUrl', request.url)
        return NextResponse.redirect(url)
    }
}

export const config = {
    matcher: ['/admin/:path*'],
} 