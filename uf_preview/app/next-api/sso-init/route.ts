// source app: app/next-api/sso-init/route.ts
import { randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const accessUrl = searchParams.get('accessUrl')
  const origin = searchParams.get('origin')
  const token = searchParams.get('token')

  if (!accessUrl || !token) {
    return NextResponse.redirect(new URL(`/${process.env.NEXT_PUBLIC_BASE_PATH}`, req.url))
  }

  const state = randomBytes(16).toString('hex')

  const target = new URL(`${accessUrl}/next-api/auth-redirect`)
  target.searchParams.set('token', token)
  target.searchParams.set('state', state)
  if (origin) target.searchParams.set('origin', origin)

  const response = NextResponse.redirect(target)
  response.cookies.set('_sso_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/',
    maxAge: 5 * 60
  })
  return response
}