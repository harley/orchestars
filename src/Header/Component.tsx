import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Header as HeaderType } from '@/payload-types'
import { getLocale } from '@/providers/I18n/server'
import { getOngoingPaginatedDocsCached } from '@/components/Home/actions'
import { checkUserAuthenticated } from '@/app/(user)/user/actions/authenticated'

export async function Header() {
  const locale = await getLocale()
  const authData = await checkUserAuthenticated()
  const headerData: HeaderType = await getCachedGlobal('header', 1, locale)()
  const events = await getOngoingPaginatedDocsCached({ locale })()


  return <HeaderClient data={headerData} events={events.docs} authData={authData} />
}
