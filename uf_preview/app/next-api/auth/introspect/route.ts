// app/next-api/auth/introspect/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_PREFIX, clearAuthCookies, setTokenCookie } from '@/lib/cookies'

export async function GET(request: NextRequest) {
  const token = request.cookies.get(`${COOKIE_PREFIX}_token`)?.value
  const key = request.nextUrl.searchParams.get('key') ?? 'screen not available'

  if (!token) {
    const response = NextResponse.json({ authenticated: false, reason: 'no_token' }, { status: 401 })
    clearAuthCookies(response)
    return response
  }

  let introspectData: any
  try {
    const upstream = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/UF/introspect?key=${encodeURIComponent(key)}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    if (!upstream.ok) {
      const response = NextResponse.json({ authenticated: false, reason: 'introspect_failed' }, { status: 401 })
      clearAuthCookies(response)
      return response
    }

    introspectData = await upstream.json()
  } catch {
    const response = NextResponse.json({ authenticated: false, reason: 'network_error' }, { status: 401 })
    clearAuthCookies(response)
    return response
  }

  if (introspectData.authenticated === false) {
    const response = NextResponse.json({ authenticated: false, reason: 'not_authenticated' }, { status: 401 })
    clearAuthCookies(response)
    return response
  }

  // authenticated === true, possibly with a rotated token
  const response = NextResponse.json({ authenticated: true })

  if (introspectData.updatedToken) {
    setTokenCookie(response, introspectData.updatedToken)
  }

  return response
}