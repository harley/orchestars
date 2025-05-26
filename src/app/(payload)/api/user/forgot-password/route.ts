import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { sendMailAndWriteLog } from '@/collections/Emails/utils'
import { EMAIL_CC } from '@/config/email'
import { getServerSideURL } from '@/utilities/getURL'

function generateResetToken(length = 48) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
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
    const resetToken = generateResetToken()
    const resetExpiration = new Date(Date.now() + 1000 * 60 * 60).toISOString() // 1 hour
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiration: resetExpiration,
      },
    })
    // Build reset link (adjust URL as needed)
    const resetLink = `${getServerSideURL() || 'http://localhost:3000'}/user/reset-password?token=${resetToken}`
    const html = `<div>
    <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
    <p>Please click on the following link, or paste this into your browser to complete the process: <a href="${resetLink}">HERE</a>, this link will expire in 1 hour.</p>
    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
</div>`
    await sendMailAndWriteLog({
      resendMailData: {
        to: email,
        // cc: EMAIL_CC,
        subject: 'Password Reset Request',
        html,
      },
      emailData: { user: user.id },
      payload,
    })
    return NextResponse.json({ message: 'If the email exists, a reset link will be sent.' })
  } catch (err) {
    console.error('Forgot password error', err)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
