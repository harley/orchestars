import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { USER_ROLE, AFFILIATE_USER_STATUS } from '@/collections/Users/constants'
import { authorizeApiRequest } from '@/app/(user)/utils/authorizeApiRequest'
import { signJwtToken } from '@/app/(user)/utils/auth/signJwtToken'

export async function POST(_req: NextRequest) {
  try {
    // remove when production is ready
    const env = process.env.NEXT_PUBLIC_ENVIRONMENT
    const hiddenRegistrationPage = !env || env === 'production'
    if (hiddenRegistrationPage) {
      return NextResponse.json(
        {
          success: false,
          error: 'Page not found',
        },
        { status: 404 },
      )
    }
    // Verify the JWT token
    const userRequest = await authorizeApiRequest()

    const payload = await getPayload()

    // Fetch the user
    const user = await payload.findByID({
      collection: 'users',
      id: userRequest.id,
      depth: 0,
      select: {
        id: true,
        role: true,
        affiliateStatus: true,
      },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If already affiliate, return early
    if (user.role === USER_ROLE.affiliate.value) {
      return NextResponse.json({
        message: 'User is already an affiliate',
        user,
      })
    }

    // Update user to become affiliate
    // default approved
    const updatedUser = await payload.update({
      collection: 'users',
      id: userRequest.id,
      data: {
        role: USER_ROLE.affiliate.value,
        affiliateStatus: AFFILIATE_USER_STATUS.approved.value,
      },
      context: {
        disableSendingAffiliateSetupEmail: true,
      },
    })

    // Sign JWT token if approved
    await signJwtToken({
      fieldsToSign: {
        id: user.id,
        email: user.email,
        role: USER_ROLE.affiliate.value,
      },
    })

    return NextResponse.json({
      message: 'User is now an affiliate',
      user: updatedUser,
    })
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Error in affiliate-register:', error)
    return NextResponse.json(
      {
        error: 'Failed to register as affiliate',
        details: error.message,
      },
      { status: 500 },
    )
  }
}
