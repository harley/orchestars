import { NextRequest, NextResponse } from 'next/server'
import { createAffiliateLinkSchema } from './validation'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { authorizeApiRequest } from '@/app/(affiliate)/utils/authorizeApiRequest'
import { generateCode } from '@/utilities/generateCode'

// POST - Create new affiliate link
export async function POST(request: NextRequest) {
  try {
    const userRequest = await authorizeApiRequest()
    const body = await request.json()

    // Validate request body with Joi
    const { error, value } = createAffiliateLinkSchema.validate(body, {
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

    // Check if affiliate code is already in use
    const existingAffiliate = await payload.find({
      collection: 'affiliate-links',
      where: {
        affiliateCode: {
          equals: value.affiliateCode,
        },
      },
      limit: 1,
    })

    if (existingAffiliate.docs.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'This affiliate code is already in use. Please choose a different one.',
        },
        { status: 400 },
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

    // Create the affiliate link
    const affiliateLink = await payload.create({
      collection: 'affiliate-links',
      data: {
        affiliateUser: userRequest.id,
        event: value.event,
        affiliateCode: generateCode('AFF', { timestampLength: 9 }),
        affiliatePromotion: promotion.id,
        promotionCode: value.promotionCode,
        utmParams: value.utmParams,
        targetLink: value.targetLink,
        status: value.status || 'active',
      },
    })

    // Generate the full URL with UTM parameters for display
    const params = new URLSearchParams()
    if (affiliateLink.utmParams && typeof affiliateLink.utmParams === 'object') {
      const utmParams = affiliateLink.utmParams as any
      if (utmParams.source) params.append('utm_source', String(utmParams.source))
      if (utmParams.medium) params.append('utm_medium', String(utmParams.medium))
      if (utmParams.campaign) params.append('utm_campaign', String(utmParams.campaign))
      if (utmParams.term) params.append('utm_term', String(utmParams.term))
      if (utmParams.content) params.append('utm_content', String(utmParams.content))
    }
    params.append('affiliate', affiliateLink.affiliateCode)

    return NextResponse.json({
      success: true,
      data: {
        id: affiliateLink.id,
        affiliateCode: affiliateLink.affiliateCode,
        promotionCode: affiliateLink.promotionCode,
        utmParams: affiliateLink.utmParams,
        targetLink: affiliateLink.targetLink,
        status: affiliateLink.status,
        createdAt: affiliateLink.createdAt,
      },
    })
  } catch (error) {
    console.error('Error creating affiliate link:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error. Please try again later.',
      },
      { status: 500 },
    )
  }
}

// GET - Fetch affiliate links for current user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1') || 1
    const limit = parseInt(searchParams.get('limit') || '10') || 10
    const status = searchParams.get('status')

    const payload = await getPayload()

    const userRequest = await authorizeApiRequest()

    // Build where clause
    const where: any = {
      affiliateUser: {
        equals: userRequest.id,
      },
    }

    if (status && ['active', 'disabled', 'expired'].includes(status)) {
      where.status = { equals: status }
    }

    const affiliateLinks = await payload.find({
      collection: 'affiliate-links',
      where,
      page,
      limit,
      sort: '-createdAt',
      depth: 1, // Include related event data
    })

    // Format the response data
    const formattedData = affiliateLinks.docs.map((link: any) => {
      return {
        id: link.id,
        affiliateCode: link.affiliateCode,
        promotionCode: link.promotionCode,
        utmParams: link.utmParams,
        targetLink: link.targetLink,
        status: link.status,
        event: link.event
          ? {
              id: link.event.id,
              title: link.event.title,
              slug: link.event.slug,
              eventLocation: link.event.eventLocation,
              description: link.event.description,
            }
          : null,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt,
      }
    })

    return NextResponse.json({
      success: true,
      data: formattedData,
      pagination: {
        page: affiliateLinks.page,
        limit: affiliateLinks.limit,
        totalPages: affiliateLinks.totalPages,
        totalDocs: affiliateLinks.totalDocs,
        hasNextPage: affiliateLinks.hasNextPage,
        hasPrevPage: affiliateLinks.hasPrevPage,
      },
    })
  } catch (error) {
    console.error('Error fetching affiliate links:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error. Please try again later.',
      },
      { status: 500 },
    )
  }
}
