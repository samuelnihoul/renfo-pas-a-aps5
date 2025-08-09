import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { middleware as authMiddleware } from '@/lib/auth-middleware'

export async function middleware(request: NextRequest) {
  return authMiddleware(request)
}

export const config = {
  matcher: ['/admin/:path*'],
}
