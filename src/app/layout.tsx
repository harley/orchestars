import Script from 'next/script'
import { GA_ID } from '@/lib/gtag'
import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React, { Suspense } from 'react'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { Toaster } from '@/components/ui/toaster'
import { EnvironmentIndicator } from '@/components/EnvironmentIndicator'
import { getServerSideURL } from '@/utilities/getURL'
import { getLocale } from '@/providers/I18n/server'

import { Analytics } from '@vercel/analytics/next'
import PixelTracker from '@/components/PixelTracker'
import GATracker from '@/components/GATracker'
import { GoogleAnalytics } from '@next/third-parties/google'

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@coderpush',
  },
  description:
    'Orchestars is a dynamic music company committed to transforming the orchestral landscape',
  title: 'Experience Live Orchestral Music Like Never Before | Orchestars',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLocale()

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={cn(GeistSans.variable, GeistMono.variable)}
    >
      <head>
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
      </head>
      <body>
        {GA_ID && (
          <>
            <GoogleAnalytics gaId={GA_ID}></GoogleAnalytics>
            <GATracker />
          </>
        )}

        <Providers locale={lang}>
          <Suspense fallback={null}>
            <PixelTracker />
          </Suspense>
          <Header />
          <EnvironmentIndicator />
          <div className="pt-[72px]">{children}</div>
          <Footer />
        </Providers>

        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
