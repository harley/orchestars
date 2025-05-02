import { NextRequest, NextResponse } from 'next/server'
import { isAdminOrSuperAdminOrEventAdmin } from '@/access/isAdminOrSuperAdmin'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload()
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const result = await payload.login({
      collection: 'users',
      data: {
        email,
        password,
      },
    })

    if (!result.user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (!isAdminOrSuperAdminOrEventAdmin({ req: { user: result?.user } })) {
      return NextResponse.json(
        { error: 'Unauthorized access. Only event admins can access the check-in app.' },
        { status: 403 },
      )
    }

    const cookieStore = await cookies()
    cookieStore.set('payload-token', result.token as string, {
      maxAge: 60 * 60 * 24 * 1, // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })

    return NextResponse.json({
      token: result.token,
      user: result.user,
    })
  } catch (err) {
    const error = err as Error

    console.error('Error while logging in', error)

    return NextResponse.json(
      {
        error: 'Authentication failed',
        details: error.message,
      },
      { status: 500 },
    )
  }
}
