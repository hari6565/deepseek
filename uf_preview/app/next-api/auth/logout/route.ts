// app/next-api/auth/logout/route.ts
import { COOKIE_PREFIX, FULL_BASE_PATH } from '@/lib/cookies';
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const token = request.cookies.get(`${COOKIE_PREFIX}_token`)?.value;

  // 1. Revoke the session server-side FIRST. This is what actually kills
  // the JWT via Redis (jwtService.revokeToken) — everything after this is
  // just FusionAuth/browser cleanup and was never enforcing anything.
  if (token) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/UF/logout`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // non-blocking — don't let a backend hiccup trap the user unable
      // to log out client-side
    }
  }

  // Fire and forget FA server-side logout
  try {
    const queryParams = new URLSearchParams();
    const app_tenant = request.cookies.get(`${COOKIE_PREFIX}_app_tenant`)?.value;
   
      if (app_tenant) {
        queryParams.append('tenant', app_tenant);
      }

    const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/UF/fusionauth-credentials?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch FusionAuth registration details: ${response.status}`,
    );
  }

  // Logout needs only the discovery fields; no secret is requested.
  const {
    tenantUniqueId,
    applicationId,
    fusionAuthBaseUrl,
  } = await response.json();

    await fetch(
      `${fusionAuthBaseUrl}/oauth2/logout?client_id=${applicationId}`,
      {
        method: 'GET',
        redirect: 'manual',
        headers: { 'X-FusionAuth-TenantId': tenantUniqueId }
      }
    )
  } catch {
    // non-blocking
  }

  // Redirect to app root — middleware will handle sending to FA login
  const response = NextResponse.redirect(
    new URL(`${process.env.NEXT_PUBLIC_APP_URL}${FULL_BASE_PATH}/`)
  )

  const cookieOptions = {
    // httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: FULL_BASE_PATH,
    maxAge: 0
  }

  // Clear all cookie name variants
  response.cookies.set(`${COOKIE_PREFIX}_token`, '', cookieOptions as any)
  response.cookies.set(`${COOKIE_PREFIX}_tp_ps`, '', cookieOptions as any)
  response.cookies.set('token', '', cookieOptions as any)
  response.cookies.set(`${COOKIE_PREFIX}_oauth_state`, '', cookieOptions as any)
  response.cookies.set(`${COOKIE_PREFIX}_app_tenant`, '', cookieOptions as any)

  return response
}
