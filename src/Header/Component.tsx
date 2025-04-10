import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Header } from '@/payload-types'
import { getLocale } from '@/providers/I18n/server'

export async function Header() {
  const locale = await getLocale()

  const headerData: Header = await getCachedGlobal('header', 1, locale)()

  return <HeaderClient data={headerData} />
}
