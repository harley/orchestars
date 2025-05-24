import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { cookies } from 'next/headers'
import { verifyPassword } from '@/utilities/password'
import { jwtSign } from '@/utilities/jwt'
import { JWT_USER_EXPIRATION, JWT_USER_SECRET } from '@/config/jwt'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload()
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Find user by email
    const userRes = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
      select: { id: true, email: true, hash: true, salt: true },
      showHiddenFields: true,
    })
    const user = userRes.docs[0]
    if (!user || !user.salt || !user.hash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Verify password
    const valid = await verifyPassword(password, user.salt, user.hash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Generate JWT (payloadcms uses user id and email)
    const token = await jwtSign({
      fieldsToSign: { id: user.id, email: user.email },
      secret: JWT_USER_SECRET,
      tokenExpiration: JWT_USER_EXPIRATION,
    })

    const cookieStore = await cookies()
    cookieStore.set('authToken', token.token, {
      expires: token.exp * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    return NextResponse.json({ user: { id: user.id, email: user.email } })
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
