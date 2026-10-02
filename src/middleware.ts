import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected paths - anything under /(dashboard) is protected
const PROTECTED = ['/dashboard', '/orders', '/catalogue', '/stock', '/billing', '/preorders', '/brand-orders', '/consumption', '/supplier-orders', '/supply-chain', '/trials', '/intelligence', '/ads', '/enquiries', '/profile', '/settings']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  // Check for auth cookie (we'll also validate via localStorage on client)
  const token = request.cookies.get('gradient365_token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|login|register).*)'],
}
