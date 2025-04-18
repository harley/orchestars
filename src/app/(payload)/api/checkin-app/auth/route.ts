import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { isAdminOrSuperAdminOrEventAdmin } from '@/access/isAdminOrSuperAdmin'


export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      )
    }

    const result = await payload.login({
      collection: 'admins',
      data: {
        email,
        password,
      },
    })

    if (!result.user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (!isAdminOrSuperAdminOrEventAdmin({ req: { user: result.user } })) {
      return NextResponse.json(
        { error: 'Unauthorized access. Only event admins can access the check-in app.' },
        { status: 403 },
      )
    }

    return NextResponse.json({
      token: result.token,
      user: result.user,
    })
  } catch (err) {
    const error = err as Error
    return NextResponse.json(
      {
        error: 'Authentication failed',
        details: error.message,
      },
      { status: 500 },
    )
  }
}
