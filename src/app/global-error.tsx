'use client' // Error boundaries must be Client Components

import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { cn } from '@/utilities/ui'
import { Providers } from '@/providers'
import { Toaster } from '@/components/ui/toaster'
import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { DEFAULT_FALLBACK_LOCALE, SupportedLocale } from '@/config/app'
import Component from '@/components/GlobalError/Component'

const getLocaleFromCookie = (): SupportedLocale => {
  if (typeof document === 'undefined') {
    return DEFAULT_FALLBACK_LOCALE
  }
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'next-locale') {
      if (value === 'en' || value === 'vi') {
        return value
      }
    }
  }
  return DEFAULT_FALLBACK_LOCALE
}

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
    console.error('Error while loading page:', error)
  }, [error])

  const locale = getLocaleFromCookie()

  return (
    <html
      className={cn(GeistSans.variable, GeistMono.variable)}
      lang={locale}
      suppressHydrationWarning
    >
      <head>
        <title>{'Oops! Something went wrong'} - Orchestars</title>
      </head>
      <body>
        <Providers locale={locale}>
          <Component />
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
