import { NextResponse } from 'next/server'

export const COOKIE_PREFIX = [
  process.env.NEXT_PUBLIC_TENANT_CODE,
  process.env.NEXT_PUBLIC_APPGROUPCODE,
  process.env.NEXT_PUBLIC_APPCODE,
]
  .filter(Boolean)
  .join('_')
  .toLowerCase()

export const FULL_BASE_PATH = process.env.NEXT_PUBLIC_DFS_PATH
  ? `/${process.env.NEXT_PUBLIC_DFS_PATH}`
  : ''

const authCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
  path: FULL_BASE_PATH,
})

export function setTokenCookie(response: NextResponse, token: string) {
  response.cookies.set(`${COOKIE_PREFIX}_token`, token, {
    ...authCookieOptions(),
    maxAge: 60 * 60 * 8,
  })
}

export function clearAuthCookies(response: NextResponse) {
  const expired = { ...authCookieOptions(), maxAge: 0 }
  response.cookies.set(`${COOKIE_PREFIX}_token`, '', expired)
  response.cookies.set(`${COOKIE_PREFIX}_oauth_state`, '', expired)
  response.cookies.set(`${COOKIE_PREFIX}_pkce_verifier`, '', expired)
  response.cookies.set(`${COOKIE_PREFIX}_app_tenant`, '', expired)
  response.cookies.set(`${COOKIE_PREFIX}_app_tenant_id`, '', expired)
}
