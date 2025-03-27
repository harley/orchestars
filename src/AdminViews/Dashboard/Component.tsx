'use server'

import React from 'react'
import AdminCollections from './AdminCollections'
import { fetchOngoingEvents } from './actions'

const Component = async ({
  navGroups,
}: {
  navGroups: [
    {
      label: string
      entities: Array<{ slug: string; type: 'collections' | 'globals' | string; label: string }>
    },
  ]
}) => {
  const ongoingEvents = await fetchOngoingEvents()

  const eventTicketEntities = ongoingEvents.map((evt) => ({
    slug: evt.slug || '',
    type: 'event',
    label: evt.title || '',
  }))

  const currentEventOnGoing = {
    label: 'Event Seats',
    entities: eventTicketEntities,
  }

  return (
    <div>
      <AdminCollections collections={[currentEventOnGoing, ...navGroups]} />
    </div>
  )
}

export default Component
