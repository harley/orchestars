import { NextRequest, NextResponse } from 'next/server'
import Joi from 'joi'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { AFFILIATE_USER_STATUS, USER_ROLE } from '@/collections/Users/constants'
import { sendMailAndWriteLog } from '@/collections/Emails/utils'
import { affiliateRegistrationEmailHtml } from '@/mail/templates/AffiliateRegistrationEmail'
import { EMAIL_DEFAULT_FROM_ADDRESS } from '@/config/email'

const affiliateRegisterSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(50).required().messages({
    'string.empty': 'First name is required',
    'string.max': 'First name must not exceed 50 characters',
  }),
  lastName: Joi.string().trim().min(1).max(50).required().messages({
    'string.empty': 'Last name is required',
    'string.max': 'Last name must not exceed 50 characters',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email address',
  }),
  phoneNumber: Joi.string()
    .pattern(/^[0-9+\-() ]{7,20}$/)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Phone number must be valid',
    }),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { error, value } = affiliateRegisterSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    })
    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.details.map((d) => ({ field: d.path.join('.'), message: d.message })),
        },
        { status: 400 },
      )
    }
    const payload = await getPayload()
    // Check for duplicate email or phone number
    const existing = await payload.find({
      collection: 'users',
      where: {
        or: [{ email: { equals: String(value.email).toLowerCase() } }, { phoneNumber: { equals: value.phoneNumber } }],
      },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'An account with this email or phone number already exists.',
        },
        { status: 409 },
      )
    }
    // Save user with role affiliate
    const user = await payload.create({
      collection: 'users',
      data: {
        firstName: value.firstName,
        lastName: value.lastName,
        email: String(value.email).toLowerCase(),
        phoneNumber: value.phoneNumber,
        role: USER_ROLE.affiliate.value,
        affiliateStatus: AFFILIATE_USER_STATUS.pending.value,
      },
    })
    // Send email
    await sendMailAndWriteLog({
      resendMailData: {
        to: value.email,
        subject: 'Affiliate Registration Confirmation',
        html: affiliateRegistrationEmailHtml({ contactEmail: EMAIL_DEFAULT_FROM_ADDRESS }),
      },
      emailData: { user: user.id },
      payload,
    })
    return NextResponse.json({
      success: true,
      message: 'Registration successful!',
      userId: user.id,
    })
  } catch (err) {
    console.error('Affiliate register error:', err)
    return NextResponse.json(
      {
        success: false,
        error: 'Something went wrong. Please try again.',
      },
      { status: 400 },
    )
  }
}
