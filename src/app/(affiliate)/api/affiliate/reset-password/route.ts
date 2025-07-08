import { NextRequest, NextResponse } from 'next/server'
import { updateNewPasswordUserResetPassword } from '@/collections/Users/utils/updateNewPasswordResetPassword'
import { signJwtToken } from '@/app/(user)/utils/auth/signJwtToken'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()
    
    if (!token || !password) {
      return NextResponse.json(
        { message: 'Token and new password are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    const user = await updateNewPasswordUserResetPassword({
      resetPasswordToken: token,
      newPassword: password,
    })

    // Sign JWT token for automatic login
    await signJwtToken({
      fieldsToSign: { 
        id: user.id, 
        email: user.email,
        role: 'affiliate'
      },
    })

    return NextResponse.json({
      message: 'Password has been reset successfully. You are now logged in.',
      user: { 
        id: user.id, 
        email: user.email 
      },
    })

  } catch (error) {
    console.error('Affiliate reset password error:', error)
    return NextResponse.json(
      { message: 'Failed to reset password' },
      { status: 500 }
    )
  }
}
