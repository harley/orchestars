import React from 'react'
import { getAdminUser } from '@/utilities/getAdminUser'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/providers/CheckIn/useAuth'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { cn } from '@/utilities/ui'
import { getLocale } from '@/providers/I18n/server'
import { I18nProvider } from '@/providers/I18n'

import { AdminNav } from './AdminNav'
import '../(frontend)/globals.css'

export default async function CheckinLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser()
  const locale = await getLocale()

  return (
    <html lang={locale} className={cn('h-full', GeistSans.variable, GeistMono.variable)}>
      <body className="flex flex-col h-full bg-gray-900 text-white">
        <I18nProvider locale={locale}>
          <AuthProvider>
            <AdminNav admin={admin} />
            <main className="flex-1 flex flex-col">{children}</main>
            <Toaster />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  )
} 