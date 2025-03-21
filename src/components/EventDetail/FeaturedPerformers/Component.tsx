'use server'

import { getPerformersCached } from '@/components/Home/actions'
import PerformersSection from '@/components/Home/components/PerformersSection'
import { Performer } from '@/types/Performer'
import React from 'react'

const Performers = async () => {
  const performers = await getPerformersCached()()
  return <PerformersSection performers={performers as Performer[]} />
}

export default Performers
