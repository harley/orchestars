import { getPayload } from '@/payload-config/getPayloadConfig'

interface TokenValidationResult {
  valid: boolean
  message?: string
  user?: {
    id: number
    email: string
  }
}

export async function validateAffiliateResetPasswordToken(
  token: string,
): Promise<TokenValidationResult> {
  try {
    if (!token) {
      return {
        valid: false,
        message: 'Reset token is required',
      }
    }

    const payload = await getPayload()

    // Find user by reset token
    const userRes = await payload.find({
      collection: 'users',
      where: { resetPasswordToken: { equals: token } },
      limit: 1,
      select: {
        id: true,
        email: true,
        resetPasswordExpiration: true,
        status: true,
      },
      showHiddenFields: true,
    })

    const user = userRes.docs[0]

    if (!user) {
      return {
        valid: false,
        message: 'Invalid reset token',
      }
    }

    // Check if token has expired
    if (!user.resetPasswordExpiration || new Date(user.resetPasswordExpiration) < new Date()) {
      return {
        valid: false,
        message: 'Reset token has expired',
      }
    }

    return {
      valid: true,
      user: {
        id: user.id,
        email: user.email,
      },
    }
  } catch (error) {
    console.error('Token validation error:', error)
    return {
      valid: false,
      message: 'Failed to validate token',
    }
  }
}
