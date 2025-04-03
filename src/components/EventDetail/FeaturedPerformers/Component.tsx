'use server'

import { getPerformersByEventCached } from '@/app/(frontend)/events/[eventId]/actions'
import PerformersSection from '@/components/Home/components/PerformersSection'
import { Performer } from '@/types/Performer'
import React from 'react'

const Performers = async ({ eventSlug }: { eventSlug: string }) => {
  const performers = await getPerformersByEventCached({ eventSlug })()
  return <PerformersSection performers={performers as Performer[]} />
}

export default Performers
