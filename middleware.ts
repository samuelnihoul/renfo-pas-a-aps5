import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protected routes
  const isProtected = pathname.startsWith('/admin')

  if (isProtected) {
    const token = await getToken({ req: request })
    
    // If user is not authenticated, redirect to signin
    if (!token) {
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', encodeURI(request.url))
      return NextResponse.redirect(signInUrl)
    }

    // You can add additional role-based checks here
    // For example, check if user is admin:
    // if (pathname.startsWith('/admin') && token.role !== 'admin') {
    //   return NextResponse.redirect(new URL('/unauthorized', request.url))
    // }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
}
