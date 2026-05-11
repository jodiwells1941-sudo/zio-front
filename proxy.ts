import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  //  Change 'auth_token' to YOUR actual cookie name
  const token = request.cookies.get('auth_token')?.value

  const isProtected = pathname.startsWith('/dashboard')
  const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up'

  // Not logged in → block dashboard access
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // Already logged in → block sign-in/sign-up access
  if (isAuthPage && token) { 
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in', '/sign-up'],
}
