import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    // Protected routes
    const isProtected = pathname.startsWith('/admin')

    if (isProtected) {
      // Use default NextAuth token reading with production-safe options
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.session-token'
          : 'next-auth.session-token'
      })

      // If user is not authenticated, redirect to signin
      if (!token) {
        console.log('No token found, redirecting to signin')
        const signInUrl = new URL('/auth/signin', request.url)
        signInUrl.searchParams.set('callbackUrl', encodeURI(request.url))
        return NextResponse.redirect(signInUrl)
      }

      // Check if user has admin privileges
      const isAdmin = Boolean(token.isAdmin)
      console.log('Token found:', {
        email: token.email,
        isAdmin: token.isAdmin,
        hasAdminFlag: 'isAdmin' in token
      })

      if (!isAdmin) {
        console.log('User is not admin, redirecting to home')
        const homeUrl = new URL('/', request.url)
        homeUrl.searchParams.set('error', 'unauthorized')
        return NextResponse.redirect(homeUrl)
      }

      console.log('Admin access granted')
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    // On error, redirect to signin to avoid breaking the app
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }
}

export const config = {
  // Only run middleware on admin routes
  matcher: ['/admin/:path*'],
}
