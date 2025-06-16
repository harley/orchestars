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

  const collections = navGroups.map((item) => {
    if (item.label === 'Collections') {
      const indexOfAffLinks = item.entities.findIndex((item) => item.slug === 'affiliate-links')
      if (indexOfAffLinks !== -1) {
        // Insert new item after index 1 (i.e., after a: '4')
        item.entities.splice(indexOfAffLinks, 0, {
          slug: 'affiliate',
          type: '',
          label: 'Management Affiliate',
        })
      }
    }

    return item
  })

  return (
    <div>
      <AdminCollections collections={[currentEventOnGoing, ...collections]} />
    </div>
  )
}

export default Component
