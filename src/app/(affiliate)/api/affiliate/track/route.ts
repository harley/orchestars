import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { X_API_KEY } from '@/config/app'

interface AffiliateTrackingData {
  affiliatePromoCode: string
  sessionId: string
  ip: string
  userAgent: string
  referrer: string
  url: string
  timestamp: string
  utmParams?: Record<string, string> | null
}

export async function POST(request: NextRequest) {
  try {
    // Verify this is an internal request
    const xApiKeyRequest = request.headers.get('X-Api-Key')

    if (xApiKeyRequest !== X_API_KEY) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body: AffiliateTrackingData = await request.json()
    const { affiliatePromoCode, sessionId, ip, userAgent, referrer, url, timestamp, utmParams } =
      body

    if (!affiliatePromoCode || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 },
      )
    }

    const payload = await getPayload()

    const promotion = await payload
      .find({
        collection: 'promotions',
        where: {
          code: { equals: affiliatePromoCode },
          status: { equals: 'active' },
        },
        limit: 1,
        depth: 0,
      })
      .then((res) => res.docs?.[0])
      .catch((_err) => {
        // Ignore error
      })

    if (!promotion) {
      return NextResponse.json({ success: false, error: 'APC not found' }, { status: 404 })
    }

    // Find the affiliate link by code
    const affiliateLinkResult = await payload.find({
      collection: 'affiliate-links',
      where: {
        affiliatePromotion: { equals: promotion.id },
        status: { equals: 'active' },
      },
      limit: 1,
      depth: 0,
    })

    const affiliateLink = affiliateLinkResult.docs?.[0]
    if (!affiliateLink) {
      console.warn(`Affiliate link not found for code: ${affiliatePromoCode}`)
      return NextResponse.json(
        { success: false, error: 'Affiliate link not found' },
        { status: 404 },
      )
    }

    // Check if this session has already been logged to prevent duplicates
    const existingLogResult = await payload.find({
      collection: 'affiliate-click-logs',
      where: {
        affiliateLink: { equals: affiliateLink.id },
        sessionId: { equals: sessionId },
      },
      limit: 1,
      depth: 0,
    })

    if (existingLogResult.docs.length > 0) {
      console.log(`Duplicate click detected for session: ${sessionId}`)
      return NextResponse.json(
        { success: true, message: 'Click already logged for this session' },
        { status: 200 },
      )
    }

    // Extract additional information including UTM parameters
    const moreInformation = {
      url,
      timestamp,
      sessionId,
      affiliatePromoCode,
      // Parse user agent for basic device info
      deviceInfo: parseUserAgent(userAgent),
      // Include UTM parameters if they exist
      utmParams: utmParams || null,
    }

    // Get affiliate user ID
    const affiliateUserId =
      typeof affiliateLink.affiliateUser === 'object'
        ? affiliateLink.affiliateUser.id
        : affiliateLink.affiliateUser

    // Create the click log entry
    const clickLog = await payload.create({
      collection: 'affiliate-click-logs',
      data: {
        affiliateUser: affiliateUserId,
        affiliateLink: affiliateLink.id,
        ip,
        userAgent,
        referrer,
        sessionId,
        moreInformation,
      },
      depth: 0,
    })

    console.log(`Affiliate click logged: ${affiliatePromoCode} - Session: ${sessionId}`)

    return NextResponse.json({
      success: true,
      data: {
        id: clickLog.id,
        affiliatePromoCode,
        sessionId,
        timestamp: clickLog.createdAt,
        utmParams: utmParams || null,
      },
    })
  } catch (error) {
    console.error('Error logging affiliate click:', error)
    return NextResponse.json(
      { success: false, error: 'Error logging affiliate click' },
      { status: 400 },
    )
  }
}

// Simple user agent parsing for basic device information
function parseUserAgent(userAgent: string) {
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent)
  const isDesktop = !isMobile && !isTablet

  let browser = 'Unknown'
  if (userAgent.includes('Chrome')) browser = 'Chrome'
  else if (userAgent.includes('Firefox')) browser = 'Firefox'
  else if (userAgent.includes('Safari')) browser = 'Safari'
  else if (userAgent.includes('Edge')) browser = 'Edge'

  let os = 'Unknown'
  if (userAgent.includes('Windows')) os = 'Windows'
  else if (userAgent.includes('Mac')) os = 'macOS'
  else if (userAgent.includes('Linux')) os = 'Linux'
  else if (userAgent.includes('Android')) os = 'Android'
  else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad'))
    os = 'iOS'

  return {
    deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    browser,
    os,
    isMobile,
    isTablet,
    isDesktop,
  }
}
