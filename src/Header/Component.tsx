import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Header as HeaderType } from '@/payload-types'
import { getLocale } from '@/providers/I18n/server'
import { getOngoingPaginatedDocsCached } from '@/components/Home/actions'

export async function Header() {
  const locale = await getLocale()

  const headerData: HeaderType = await getCachedGlobal('header', 1, locale)()
  const events = await getOngoingPaginatedDocsCached({ locale })()

  return <HeaderClient data={headerData} events={events.docs} />
}
