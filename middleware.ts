import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

export async function middleware(req: NextRequest) {
  const session = await auth()
  const { pathname } = req.nextUrl

  // Protected routes
  const protectedRoutes = ['/dashboard', '/api/client', '/api/therapist']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Auth routes (redirect if already authenticated)
  const authRoutes = ['/auth/signin', '/auth/signup']
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // If accessing protected route without session, redirect to signin
  if (isProtectedRoute && !session) {
    const signInUrl = new URL('/auth/signin', req.url)
    return NextResponse.redirect(signInUrl)
  }

  // If accessing auth route with session, redirect to dashboard
  if (isAuthRoute && session) {
    const dashboardUrl = new URL('/dashboard', req.url)
    return NextResponse.redirect(dashboardUrl)
  }

  // Role-based access control
  if (session && pathname.startsWith('/dashboard')) {
    const userRole = session.user?.role

    // Client routes
    if (pathname.startsWith('/dashboard/client') && userRole !== 'CLIENT') {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    // Therapist routes
    if (pathname.startsWith('/dashboard/therapist') && userRole !== 'THERAPIST') {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    // Admin routes
    if (pathname.startsWith('/dashboard/admin') && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/client/:path*',
    '/api/therapist/:path*',
    '/auth/:path*'
  ]
}
