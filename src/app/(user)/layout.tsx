import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { Toaster } from '@/components/ui/toaster'
import { EnvironmentIndicator } from '@/components/EnvironmentIndicator'

import '@/app/(frontend)/globals.css'
import { getServerSideURL } from '@/utilities/getURL'
import { getLocale } from '@/providers/I18n/server'

import { Analytics } from '@vercel/analytics/next'
// import PixelTracker from '@/components/PixelTracker'
import { GOOGLE_TAG_MANAGER_KEY } from '@/config/ads'
import { GTM, GTM_NO_SCRIPT } from '@/components/GTM'
import Sidebar, { SidebarMobile } from '@/components/User/Sidebar'
import { checkUserAuthenticated } from './user/actions/authenticated'
import { redirect } from 'next/navigation'
import { getUserData } from './user/profile/actions'
import { UserProviders } from './providers'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLocale()

  const authData = await checkUserAuthenticated()

  if (!authData) {
    return redirect('/')
  }

  const userId = authData.userInfo.id

  const userData = await getUserData({ userId: userId })

  return (
    <html
      className={cn(GeistSans.variable, GeistMono.variable)}
      lang={lang}
      suppressHydrationWarning
    >
      <head>
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <GTM gtmKey={GOOGLE_TAG_MANAGER_KEY} />
      </head>
      <body>
        <GTM_NO_SCRIPT gtmKey={GOOGLE_TAG_MANAGER_KEY} />
        <EnvironmentIndicator />
        <Providers>
          <UserProviders
            authUser={{ ...authData, userInfo: { ...authData.userInfo, ...userData } }}
          >
            <div className="min-h-screen bg-gradient-subtle">
              {/* Desktop Layout */}
              <div className="hidden lg:block">
                <Header />
                <div className="flex">
                  <Sidebar />
                  <div className="flex-1 flex flex-col min-h-screen">
                    <main className="flex-1 p-4 lg:p-6 mt-8">
                      <div className="pt-[72px]">{children}</div>
                    </main>
                    <Footer />
                  </div>
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="lg:hidden flex flex-col min-h-screen">
                <Header />
                <div className="relative">
                  <div className="fixed top-[100px] left-[10px] z-10 ">
                    <SidebarMobile />
                  </div>
                  <main className="flex-1 p-4">
                    <div className="pt-[72px]">{children}</div>
                  </main>
                  <Footer />
                </div>
              </div>
            </div>
          </UserProviders>
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
