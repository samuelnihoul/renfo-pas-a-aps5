import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authHandler } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    // Protected routes
    const isProtected = pathname.startsWith('/admin')

    if (isProtected) {
      // Get the session
      const session = await authHandler()
      // Handle case where authHandler returns a Response (for API routes)
      if (session instanceof Response) {
        return session
      }
      
      const user = session?.user

      // If user is not authenticated, redirect to signin
      if (!user) {
        console.log('No user found in session, redirecting to signin')
        const signInUrl = new URL('/auth/signin', request.url)
        signInUrl.searchParams.set('callbackUrl', encodeURI(request.url))
        return NextResponse.redirect(signInUrl)
      }

      // Check if user has admin privileges
      if (pathname.startsWith('/admin') && !user.isAdmin) {
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
