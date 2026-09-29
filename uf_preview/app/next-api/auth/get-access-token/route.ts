// app/next-api/auth/get-access-token/route.ts

import { COOKIE_PREFIX, setTokenCookie } from '@/lib/cookies'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Read the existing HttpOnly authentication cookie
    const token = request.cookies.get(`${COOKIE_PREFIX}_token`)?.value

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/UF/getAccessToken`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token
            ? {
                Authorization: `Bearer ${token}`
              }
            : {})
        },
        body: JSON.stringify(body)
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to get access token' },
        { status: response.status }
      )
    }

    const data = await response.json()

    const nextResponse = NextResponse.json({
      success: true
    })

    if (data?.updatedToken) {
      setTokenCookie(nextResponse, data?.updatedToken)
    }

    return nextResponse
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
