import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React, { Suspense } from 'react'

import { Providers } from '@/providers'
import { AffiliateProviders } from '@/app/(affiliate)/providers/Affiliate'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { Toaster } from '@/components/ui/toaster'
import { EnvironmentIndicator } from '@/components/EnvironmentIndicator'

import '../(frontend)/globals.css'
import { getServerSideURL } from '@/utilities/getURL'
import { getLocale } from '@/providers/I18n/server'
import { fetchOngoingEventsCached } from './actions/event'

import { Analytics } from '@vercel/analytics/next'
import PixelTracker from '@/components/PixelTracker'
import { checkUserAuthenticated } from './actions/authenticated'

export default async function AffiliateLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLocale()

  // Fetch events data for the affiliate context
  const eventsData = await fetchOngoingEventsCached({ locale: lang })
  const authUser = await checkUserAuthenticated()

  return (
    <html
      className={cn(GeistSans.variable, GeistMono.variable)}
      lang={lang}
      suppressHydrationWarning
    >
      <head>
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
      </head>
      <body>
        <Providers>
          <AffiliateProviders initialEvents={eventsData} authUser={authUser} locale={lang}>
            <Suspense fallback={null}>
              <PixelTracker />
            </Suspense>
            <EnvironmentIndicator />
            {children}
          </AffiliateProviders>
        </Providers>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@coderpush',
  },
  description:
    'Affiliate Dashboard - Orchestars Partner Portal',
  title: 'Affiliate Dashboard | Orchestars',
}
