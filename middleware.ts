import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protected routes
  const isProtected = pathname.startsWith('/admin')

  if (isProtected) {
    // Read token from our custom session cookie name used in auth config
    const token = await getToken({ req: request, cookieName: 'auth-token' })

    // If user is not authenticated, redirect to signin
    if (!token) {
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', encodeURI(request.url))
      return NextResponse.redirect(signInUrl)
    }

    // Check if user has admin privileges
    if (pathname.startsWith('/admin') && !token.isAdmin) {
      const homeUrl = new URL('/', request.url)
      homeUrl.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(homeUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  // Only run middleware on admin routes
  matcher: ['/admin/:path*'],
}
