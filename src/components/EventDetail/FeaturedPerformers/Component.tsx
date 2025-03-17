'use server'

import { fetchPerformers } from '@/components/Home/actions'
import PerformersSection from '@/components/Home/components/PerformersSection'
import React from 'react'

const Performers = async () => {
  const performers = await fetchPerformers()
  return <PerformersSection performers={performers} />
}

export default Performers
