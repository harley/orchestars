import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { X_API_KEY } from './config/app'

const SUPPORTED_LOCALES = ['vi', 'en'] as const

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const url = new URL(request.url)

  const locale =
    typeof url.searchParams.get('locale') === 'string'
      ? url.searchParams.get('locale')?.toLowerCase()
      : undefined
  const currentLocale = request.cookies.get('next-locale')?.value

  if (locale && locale !== currentLocale && SUPPORTED_LOCALES.includes(locale as any)) {
    const expiresInAYear = new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000)
    response.cookies.set('next-locale', locale, {
      expires: expiresInAYear,
      path: '/',
    })
  }

  // --- UTM Tracking Start ---
  const utmParameters = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
  const expiresOneDay = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)

  utmParameters.forEach(param => {
    const value = url.searchParams.get(param)
    if (value) {
      response.cookies.set(param, value, {
        expires: expiresOneDay,
        path: '/',
      })
    }
  })
  // --- UTM Tracking End ---

  // --- Affiliate Tracking Start ---
  const affiliateCode = url.searchParams.get('affiliate')
  const promoCode = url.searchParams.get('affiliate_promo_code')

  if (affiliateCode) {
    // Store affiliate data in cookies for attribution
    const expiresSevenDays = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)

    response.cookies.set('affiliate_code', affiliateCode, {
      expires: expiresSevenDays,
      path: '/',
    })

    if (promoCode) {
      response.cookies.set('affiliate_promo_code', promoCode, {
        expires: expiresSevenDays,
        path: '/',
      })
    }

    // Check if this is a new affiliate click (not already tracked in this session)
    const existingAffiliateSession = request.cookies.get('affiliate_session')?.value
    const currentSessionId = existingAffiliateSession || generateSessionId()

    if (!existingAffiliateSession) {
      // Set session cookie for 30 minutes to prevent duplicate tracking
      const expiresThirtyMinutes = new Date(new Date().getTime() + 30 * 60 * 1000)
      response.cookies.set('affiliate_session', currentSessionId, {
        expires: expiresThirtyMinutes,
        path: '/',
      })

      // Trigger affiliate click logging asynchronously
      logAffiliateClick(request, affiliateCode, promoCode, currentSessionId).catch(error => {
        console.error('Failed to log affiliate click:', error)
      })
    }
  }
  // --- Affiliate Tracking End ---

  return response
}

// Generate a simple session ID
function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// Log affiliate click asynchronously
async function logAffiliateClick(
  request: NextRequest,
  affiliateCode: string,
  promoCode: string | null,
  sessionId: string
) {
  try {
    const url = new URL(request.url)

    // Collect UTM parameters from URL
    const utmParams: Record<string, string> = {}
    const utmParameters = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']

    utmParameters.forEach(param => {
      const value = url.searchParams.get(param)
      if (value) {
        utmParams[param] = value
      } else {
        // Fallback to cookie if not in URL
        const cookieValue = request.cookies.get(param)?.value
        if (cookieValue) {
          utmParams[param] = cookieValue
        }
      }
    })

    const trackingData = {
      affiliateCode,
      promoCode,
      sessionId,
      ip: getClientIP(request),
      userAgent: request.headers.get('user-agent') || '',
      referrer: request.headers.get('referer') || '',
      url: request.url,
      timestamp: new Date().toISOString(),
      utmParams: Object.keys(utmParams).length > 0 ? utmParams : null,
    }

    // Make internal API call to log the click
    const baseUrl = new URL(request.url).origin
    await fetch(`${baseUrl}/api/affiliate/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': X_API_KEY, // Mark as internal request
      },
      body: JSON.stringify(trackingData),
    })
  } catch (error) {
    console.error('Error in logAffiliateClick:', error)
  }
}

// Extract client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('request-ip') || request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }

  if (realIP) {
    return realIP
  }

  // Fallback to connection remote address or unknown
  return 'unknown'
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/',
    '/events/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|admin).*)',
  ],
}
