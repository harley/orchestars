import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { verifyPassword } from '@/utilities/password'
import { signJwtToken } from '@/app/(user)/utils/auth/signJwtToken'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload()
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
    }

    // Find user by email
    const userRes = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
      select: { id: true, email: true, role: true, affiliateStatus: true, hash: true, salt: true },
      showHiddenFields: true,
    })
    const user = userRes.docs[0]
    if (!user || !user.salt || !user.hash) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    // Verify password
    const valid = await verifyPassword(password, user.salt, user.hash)
    if (!valid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    await signJwtToken({
      fieldsToSign: {
        id: user.id,
        email: user.email,
        role: user.role,
        affiliateStatus: user.affiliateStatus,
      },
    })

    return NextResponse.json({ user: { id: user.id, email: user.email } })
  } catch (err) {
    const error = err as Error
    console.error('Error while logging in', error)
    return NextResponse.json(
      {
        message: 'Authentication failed',
        details: error.message,
      },
      { status: 500 },
    )
  }
}
