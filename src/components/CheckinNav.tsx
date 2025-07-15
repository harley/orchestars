//'use client' directive and component
'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useTranslate } from '@/providers/I18n/client'

interface CheckinNavProps {
  dark?: boolean
}

/**
 * Reusable navigation tabs used by all three check-in modes (QR, Paper, Search).
 * When `dark` is true, it uses the white-on-dark style from the QR scan page;
 * otherwise it falls back to the light grey variant used by other pages.
 */
export const CheckinNav: React.FC<CheckinNavProps> = ({ dark = false }) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const modeParam = searchParams?.get('mode')
  const { t } = useTranslate()

  // Helper to decide which tab is active
  const isQRActive = pathname === '/checkin/scan'

  // Paper tab is active either on the dedicated /checkin/paper page
  // OR when we are on the event-selection page with ?mode=paper
  const isPaperActive = pathname === '/checkin/paper' || (pathname === '/checkin/events' && modeParam === 'paper')

  // Search tab is active on validates pages or on event selection when not in paper mode
  const isSearchActive =
    pathname.startsWith('/checkin/validates') || (pathname === '/checkin/events' && modeParam !== 'paper')

  const baseInactive = dark
    ? 'bg-white/20 text-white hover:bg-white/30'
    : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
  const baseActive = dark
    ? 'bg-white text-gray-900'
    : 'bg-gray-900 text-white'

  const tabClass = (active: boolean) =>
    `text-center py-2 px-4 rounded font-semibold ${active ? baseActive : baseInactive}`

  return (
    <div className="text-center mb-4">
      <h2 className={`text-lg font-semibold mb-3${dark ? ' text-white' : ' text-gray-900'}`}>{
        t('Check-in by')
      }</h2>
      <div className="grid grid-cols-3 gap-2 w-full">
        <Link href="/checkin/scan" className={tabClass(isQRActive)}>
          {t('QR')}
        </Link>
        <Link href="/checkin/paper" className={tabClass(isPaperActive)}>
          {t('Paper')}
        </Link>
        <Link href="/checkin/events" className={tabClass(isSearchActive)}>
          {t('Search')}
        </Link>
      </div>
    </div>
  )
} 