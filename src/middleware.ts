import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SUPPORTED_LOCALES = ['vi', 'en'] as const

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
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

  return response
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/', '/events/:eventId*'],
}
