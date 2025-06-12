import { NextRequest, NextResponse } from 'next/server'

import { getPayload } from '@/payload-config/getPayloadConfig'
import { updateAffiliateLinkSchema } from '../validation'
import { authorizeApiRequest } from '@/app/(affiliate)/utils/authorizeApiRequest'

// GET - Fetch single affiliate link
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userRequest = await authorizeApiRequest()
    const { id } = await params
    const payload = await getPayload()

    const affiliateLink = await payload.findByID({
      collection: 'affiliate-links',
      id: parseInt(id),
      depth: 1,
    })

    if (!affiliateLink) {
      return NextResponse.json(
        {
          success: false,
          error: 'Affiliate link not found',
        },
        { status: 404 },
      )
    }

    // Check if the link belongs to the current user
    const affiliateUserId =
      typeof affiliateLink.affiliateUser === 'object'
        ? affiliateLink.affiliateUser.id
        : affiliateLink.affiliateUser
    if (affiliateUserId !== userRequest.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized access to this affiliate link',
        },
        { status: 403 },
      )
    }

    // Generate the full URL

    return NextResponse.json({
      success: true,
      data: {
        id: affiliateLink.id,
        affiliateCode: affiliateLink.affiliateCode,
        promotionCode: affiliateLink.promotionCode,
        utmParams: affiliateLink.utmParams,
        targetLink: affiliateLink.targetLink,
        status: affiliateLink.status,
        event: affiliateLink.event,
        createdAt: affiliateLink.createdAt,
        updatedAt: affiliateLink.updatedAt,
      },
    })
  } catch (error) {
    console.error('Error fetching affiliate link:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error. Please try again later.',
      },
      { status: 500 },
    )
  }
}

// PUT - Update affiliate link
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userRequest = await authorizeApiRequest()
    const { id } = await params
    const body = await request.json()

    // Validate request body with Joi
    const { error, value } = updateAffiliateLinkSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    })

    if (error) {
      const validationErrors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }))

      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationErrors,
        },
        { status: 400 },
      )
    }

    const payload = await getPayload()

    if (value.promotionCode) {
      const promotion = await payload
        .find({
          collection: 'promotions',
          where: {
            code: { equals: value.promotionCode },
            status: { equals: 'active' },
          },
          limit: 1,
          depth: 0,
        })
        .then((res) => res.docs?.[0])

      if (!promotion) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid promotion code provided',
          },
          { status: 400 },
        )
      }

      value.affiliatePromotion = promotion.id
    }

    // First, check if the affiliate link exists and belongs to the user
    const existingLink = await payload.findByID({
      collection: 'affiliate-links',
      id: parseInt(id),
    })

    if (!existingLink) {
      return NextResponse.json(
        {
          success: false,
          error: 'Affiliate link not found',
        },
        { status: 404 },
      )
    }

    // Check ownership
    const affiliateUserId =
      typeof existingLink.affiliateUser === 'object'
        ? existingLink.affiliateUser.id
        : existingLink.affiliateUser
    if (affiliateUserId !== userRequest.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized access to this affiliate link',
        },
        { status: 403 },
      )
    }

    // Validate event exists if provided
    if (value.event) {
      const event = await payload
        .findByID({
          collection: 'events',
          id: value.event,
        })
        .catch(() => null)

      if (!event) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid event ID provided',
          },
          { status: 400 },
        )
      }
    }

    // Update the affiliate link
    const updatedLink = await payload.update({
      collection: 'affiliate-links',
      id: parseInt(id),
      data: {
        ...value,
      },
      depth: 0
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedLink.id,
        affiliateCode: updatedLink.affiliateCode,
        promotionCode: updatedLink.promotionCode,
        utmParams: updatedLink.utmParams,
        targetLink: updatedLink.targetLink,
        status: updatedLink.status,
        event: updatedLink.event,
        createdAt: updatedLink.createdAt,
        updatedAt: updatedLink.updatedAt,
      },
    })
  } catch (error) {
    console.error('Error updating affiliate link:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error. Please try again later.',
      },
      { status: 500 },
    )
  }
}

// DELETE - Delete affiliate link
// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> },
// ) {
//   try {
//     const userRequest = await authorizeApiRequest()
//     const { id } = await params
//     const payload = await getPayload()

//     // First, check if the affiliate link exists and belongs to the user
//     const existingLink = await payload.findByID({
//       collection: 'affiliate-links',
//       id: parseInt(id),
//     })

//     if (!existingLink) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: 'Affiliate link not found',
//         },
//         { status: 404 },
//       )
//     }

//     // Check ownership
//     const affiliateUserId =
//       typeof existingLink.affiliateUser === 'object' ? existingLink.affiliateUser.id : existingLink.affiliateUser
//     if (affiliateUserId !== userRequest.id) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: 'Unauthorized access to this affiliate link',
//         },
//         { status: 403 },
//       )
//     }

//     // Delete the affiliate link
//     await payload.delete({
//       collection: 'affiliate-links',
//       id: parseInt(id),
//     })

//     return NextResponse.json({
//       success: true,
//       message: 'Affiliate link deleted successfully',
//     })
//   } catch (error) {
//     console.error('Error deleting affiliate link:', error)

//     return NextResponse.json(
//       {
//         success: false,
//         error: 'Internal server error. Please try again later.',
//       },
//       { status: 500 },
//     )
//   }
// }
