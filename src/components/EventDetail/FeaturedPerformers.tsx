import { Performer } from '@/types/Performer'
import React from 'react'
import PerformersSection from '../Home/components/PerformersSection'

const FeaturedPerformers = ({ performers }: { performers: Performer[] }) => {
  return <PerformersSection performers={performers} />
}

export default FeaturedPerformers
