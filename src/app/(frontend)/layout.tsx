import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React, { Suspense } from 'react'

// import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
// import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
// import { draftMode } from 'next/headers'
import { Toaster } from '@/components/ui/toaster'
import { EnvironmentIndicator } from '@/components/EnvironmentIndicator'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'
import { getLocale } from '@/providers/I18n/server'

import { Analytics } from '@vercel/analytics/next'
import PixelTracker from '@/components/PixelTracker'
import { GOOGLE_TAG_MANAGER_KEY } from '@/config/ads'
import { GTM, GTM_NO_SCRIPT } from '@/components/GTM'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // const { isEnabled } = await draftMode()

  const lang = await getLocale()

  return (
    <html
      className={cn(GeistSans.variable, GeistMono.variable)}
      lang={lang}
      suppressHydrationWarning
    >
      <head>
        {/* <InitTheme /> */}
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <GTM gtmKey={GOOGLE_TAG_MANAGER_KEY} />
      </head>
      <body>
        <GTM_NO_SCRIPT gtmKey={GOOGLE_TAG_MANAGER_KEY} />
        <Providers>
          {/* <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          /> */}
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
