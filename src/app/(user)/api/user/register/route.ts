import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { USER_ROLE } from '@/collections/Users/constants'
import { sendMailAndWriteLog } from '@/collections/Emails/utils'
import { setUserResetPasswordToken } from '@/collections/Users/utils/setUserResetPasswordToken'
import { getNextBodyData } from '@/utilities/getNextBodyData'
import { newUserRegistrationEmailHtml } from '@/mail/templates/NewUserRegistration'
import { handleNextErrorMsgResponse } from '@/utilities/handleNextErrorMsgResponse'
import { normalizeVietnamesePhoneNumber } from '@/utilities/normalizeVietnamesePhoneNumber'
import { userRegisterSchema } from './validation'
import { getUserResetPassword } from '@/utilities/getUserResetPassword'

export async function POST(request: NextRequest) {
  try {
    const body = await getNextBodyData(request)
    const { error, value } = userRegisterSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    })
    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          details: error.details.map((d) => ({ field: d.path.join('.'), message: d.message })),
        },
        { status: 400 },
      )
    }
    // Explicitly trim all fields after validation
    const trimmed = {
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      email: value.email.trim().toLowerCase(),
      phoneNumber: normalizeVietnamesePhoneNumber(value.phoneNumber),
    }
    const payload = await getPayload()
    // Check for duplicate email or phone number
    const existing = await payload.find({
      collection: 'users',
      where: {
        or: [
          { email: { equals: trimmed.email } },
          { phoneNumber: { equals: trimmed.phoneNumber } },
        ],
      },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      throw new Error('USER001')
    }
    // Save user with role user (not affiliate), no password yet
    const user = await payload.create({
      collection: 'users',
      data: {
        firstName: trimmed.firstName,
        lastName: trimmed.lastName,
        email: trimmed.email,
        phoneNumber: trimmed.phoneNumber,
        phoneNumbers: [{ phone: trimmed.phoneNumber, isUsing: true }],
        role: USER_ROLE.user.value,
      },
    })

    // Generate reset token for password setup
    const resetToken = await setUserResetPasswordToken({ userId: user.id })
    // Build password setup link
    const setupLink = getUserResetPassword(resetToken)

    // Send email to user for verification and password setup
    await sendMailAndWriteLog({
      resendMailData: {
        to: trimmed.email,
        subject: 'Welcome to OrcheStars - Account Verification',
        html: newUserRegistrationEmailHtml({ setupLink }),
      },
      emailData: { user: user.id },
      payload,
    })

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please check your email to verify and set your password.',
      userId: user.id,
    })
  } catch (error: any) {
    console.error('User register error:', error)
    return NextResponse.json({ message: await handleNextErrorMsgResponse(error) }, { status: 400 })
  }
}
