import { NextRequest, NextResponse } from 'next/server'
import { sendMailAndWriteLog } from '@/collections/Emails/utils'
import { getServerSideURL } from '@/utilities/getURL'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { affiliateResetPasswordEmailHtml } from '@/mail/templates/AffiliateAccountResetPassword'
import { setUserResetPasswordToken } from '@/collections/Users/utils/setUserResetPasswordToken'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }

    const payload = await getPayload()

    // Find user by email
    const userRes = await payload.find({
      collection: 'users',
      where: {
        email: { equals: email.toLowerCase() },
        role: {
          equals: 'affiliate',
        },
      },
      limit: 1,
    })

    const user = userRes.docs[0]

    if (!user) {
      // For security, do not reveal if user exists
      return NextResponse.json({
        message: 'If the email exists in our affiliate system, a reset link will be sent.',
      })
    }

    // Generate reset token and expiration
    const resetToken = await setUserResetPasswordToken({ userId: user.id })

    // Build affiliate-specific reset link
    const resetLink = `${getServerSideURL() || 'http://localhost:3000'}/affiliate/reset-password?token=${resetToken}`
    // Send email
    await sendMailAndWriteLog({
      resendMailData: {
        to: email,
        subject: 'Affiliate Portal - Password Reset Request',
        html: affiliateResetPasswordEmailHtml({ resetLink }),
      },
      emailData: { user: user.id },
      payload,
    })

    return NextResponse.json({
      message: 'If the email exists in our affiliate system, a reset link will be sent.',
    })
  } catch (error) {
    console.error('Affiliate forgot password error:', error)
    return NextResponse.json({ message: 'Failed to process request' }, { status: 500 })
  }
}
