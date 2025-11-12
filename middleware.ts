import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  if (!process.env.NEXTAUTH_SECRET) { 
  throw new Error('NEXTAUTH_SECRET not defined in middleware')
}
try {
    const { pathname } = request.nextUrl

    // Protected routes
    const isProtected = pathname.startsWith('/admin') || pathname.startsWith('/mediatheque')

    if (isProtected) {
      // Use default NextAuth token reading with production-safe options
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName:process.env.COOKIE_NAME
      })

      // If user is not authenticated, redirect to signin
      if (!token) {
        console.log('No token found, redirecting to signin')
        const signInUrl = new URL('/auth/signin', request.url)
        signInUrl.searchParams.set('callbackUrl', encodeURI(request.url))
        return NextResponse.redirect(signInUrl)
      }

      // For admin routes, check admin privileges
      if (pathname.startsWith('/admin')) {
        const isAdmin = Boolean(token.isAdmin)
        console.log('Admin route - checking admin privileges:', {
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
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    // On error, redirect to signin to avoid breaking the app
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }
}

export const config = {
  // Run middleware on protected routes
  matcher: ['/admin/:path*', '/mediatheque/:path*'],
}
