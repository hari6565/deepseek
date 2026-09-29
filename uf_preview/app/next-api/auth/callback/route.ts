// app/next-api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForTokens } from '@/lib/fusionauth'
import { COOKIE_PREFIX, FULL_BASE_PATH } from '@/lib/cookies'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

   if (error) {
    // ← use APP_URL not request.url
    return NextResponse.redirect(`${APP_URL}${FULL_BASE_PATH}/?error=${error}`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${APP_URL}${FULL_BASE_PATH}/`)
  }

  // Validate state
  const storedState = request.cookies.get(`${COOKIE_PREFIX}_oauth_state`)?.value
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      `${APP_URL}${FULL_BASE_PATH}/?error=invalid_state`  // ← absolute
    )
  }
  const codeVerifier = request.cookies.get(`${COOKIE_PREFIX}_pkce_verifier`)?.value   // ← new
  if (!codeVerifier) {
    return NextResponse.redirect(`${APP_URL}${FULL_BASE_PATH}/?error=invalid_state`)
  }

  try {
    const storedAppTenantParam = request.cookies.get(`${COOKIE_PREFIX}_app_tenant`)?.value
    const storedAppTenantId = request.cookies.get(`${COOKIE_PREFIX}_app_tenant_id`)?.value
    // 1. Exchange code for tokens
    const fusionAuthTokens = await exchangeCodeForTokens(code, codeVerifier, storedAppTenantParam)
    
    
    const queryParams = new URLSearchParams();
    const app_tenant = request.cookies.get(`${COOKIE_PREFIX}_app_tenant`)?.value;
    
      if (app_tenant) {
        queryParams.append('tenant', app_tenant);
      }

    const credentialsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/UF/fusionauth-credentials?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (!credentialsResponse.ok) {
    throw new Error(
      `Failed to fetch FusionAuth registration details: ${credentialsResponse.status}`,
    );
  }

  const {
    fusionAuthBaseUrl,
  } = await credentialsResponse.json();


    // 2. Get user info
    const userInfoRes = await fetch(
      `${fusionAuthBaseUrl}/oauth2/userinfo`,
      { headers: { Authorization: `Bearer ${fusionAuthTokens.access_token}` } }
    )
    const userInfo = await userInfoRes.json()
    const username = userInfo.email ?? userInfo.preferred_username

    // 3. Call your Torus backend
    const torusRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/UF/signin`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          ufClientType: 'UFW',
          isOauthUser: true,
          fusionAuthLoginResponse: fusionAuthTokens,
          app_tenant: storedAppTenantParam ?? undefined,
          app_tenant_id: storedAppTenantId ?? undefined
        })
      }
    )

    if (!torusRes.ok) {
      const errBody = await torusRes.json().catch(() => ({}))
      return NextResponse.json({ error: errBody?.message ?? 'Authentication with Torus failed' }, { status: torusRes.status ?? 500 })
    }

    const { token, redirectToORPSelector } = await torusRes.json()

    let screenName:string = 'User Screen';
    let screenDetails: any = {
        keys:[
  {
    "screenName": "dddd",
    "screensName": "dddd-v1",
    "ufKey": "CK:CT001:FNGK:AF:FNK:UF-UFW:CATK:TGW01:AFGK:TGW004:AFK:barchart:AFVK:v1"
  }
]
    }
    screenDetails = screenDetails.keys

    if (screenName === 'User Screen') {
      screenName = 'user'
    } else if (screenName === 'Logs Screen') {
      screenName = 'logs'
    } else {
      screenDetails.forEach((screen: any) => {
        if (screenName === screen.ufKey) {
          screenName = screen.screensName
        }
      })
      screenName = screenName.split('-')[0] + '_' + screenName.split('-').at(-1)
    }
    const landingScreen = `/${screenName}`

    const destination = redirectToORPSelector
      ? `${APP_URL}${FULL_BASE_PATH}/select-context`   // ← absolute
      : `${APP_URL}${FULL_BASE_PATH}${landingScreen}`

    const response = NextResponse.redirect(destination)
    response.cookies.set(`${COOKIE_PREFIX}_token`, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: FULL_BASE_PATH,
      maxAge: 60 * 60 * 8
    })
    response.cookies.set(`${COOKIE_PREFIX}_oauth_state`, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: FULL_BASE_PATH,
      maxAge: 0
    })
    response.cookies.set(`${COOKIE_PREFIX}_pkce_verifier`, '', {   // ← new, clear verifier too
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: FULL_BASE_PATH,
      maxAge: 0
    })

    return response
  } catch (err: any) {
    console.error('Callback error:', err)
    return NextResponse.redirect(`${APP_URL}${FULL_BASE_PATH}/?error=server_error`)
  }
}
