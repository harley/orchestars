import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { generateSalt, hashPassword } from '@/utilities/password'
import { signJwtToken } from '@/app/(user)/utils/auth/signJwtToken'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()
    if (!token || !password) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 })
    }
    const payload = await getPayload()
    const userRes = await payload.find({
      collection: 'users',
      where: { resetPasswordToken: { equals: token } },
      limit: 1,
      select: { resetPasswordExpiration: true, resetPasswordToken: true, email: true },
      showHiddenFields: true,
    })
    const user = userRes.docs[0]
    if (
      !user ||
      !user.resetPasswordExpiration ||
      new Date(user.resetPasswordExpiration) < new Date()
    ) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 })
    }
    // Generate new salt and hash for the new password
    const salt = await generateSalt()
    const hash = await hashPassword(password, salt)
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        salt,
        hash,
        resetPasswordToken: null,
        resetPasswordExpiration: null,
      },
    })

    await signJwtToken({
      fieldsToSign: { id: user.id, email: user.email },
    })

    return NextResponse.json({
      message: 'Password has been reset successfully.',
      user: { id: user.id, email: user.email },
    })
  } catch (err) {
    console.error('Reset password error', err)
    return NextResponse.json({ message: 'Failed to reset password' }, { status: 500 })
  }
}
