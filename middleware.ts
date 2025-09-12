import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    // Protected routes
    const isProtected = pathname.startsWith('/admin')

    if (isProtected) {
      // Use default NextAuth token reading (without custom cookie name)
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
      })

      // If user is not authenticated, redirect to signin
      if (!token) {
        const signInUrl = new URL('/auth/signin', request.url)
        signInUrl.searchParams.set('callbackUrl', encodeURI(request.url))
        return NextResponse.redirect(signInUrl)
      }

      // Check if user has admin privileges
      const isAdmin = Boolean(token.isAdmin)
      if (!isAdmin) {
        const homeUrl = new URL('/', request.url)
        homeUrl.searchParams.set('error', 'unauthorized')
        return NextResponse.redirect(homeUrl)
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
  // Only run middleware on admin routes
  matcher: ['/admin/:path*'],
}
