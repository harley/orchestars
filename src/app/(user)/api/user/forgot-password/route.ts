import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { sendMailAndWriteLog } from '@/collections/Emails/utils'
import { getServerSideURL } from '@/utilities/getURL'
import { resetPasswordEmailHtml } from '@/mail/templates/ResetPassword'
import { setUserResetPasswordToken } from '@/collections/Users/utils/setUserResetPasswordToken'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }
    const payload = await getPayload()
    const userRes = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
    })
    const user = userRes.docs[0]
    if (!user) {
      // For security, do not reveal if user exists
      return NextResponse.json({ message: 'If the email exists, a reset link will be sent.' })
    }

    // Generate reset token and expiration
    const resetToken = await setUserResetPasswordToken({ userId: user.id })

    // Build reset link (adjust URL as needed)
    const resetLink = `${getServerSideURL() || 'http://localhost:3000'}/user/reset-password?token=${resetToken}`

    await sendMailAndWriteLog({
      resendMailData: {
        to: email,
        // cc: EMAIL_CC,
        subject: 'Password Reset Request',
        html: resetPasswordEmailHtml({ resetLink }),
      },
      emailData: { user: user.id },
      payload,
    })
    return NextResponse.json({ message: 'If the email exists, a reset link will be sent.' })
  } catch (err) {
    console.error('Forgot password error', err)
    return NextResponse.json({ message: 'Failed to process request' }, { status: 500 })
  }
}
