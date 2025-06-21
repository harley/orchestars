import React from 'react'

import EntityCard, { Entity } from '../Components/EntityCard'

const collections: Entity[] = [
  {
    slug: 'affiliate-ranks',
    type: 'collections',
    label: 'Affiliate Ranks',
  },
  {
    slug: 'event-affiliate-ranks',
    type: 'collections',
    label: 'Event Affiliate Ranks',
  },
  {
    slug: 'affiliate-rank-logs',
    type: 'collections',
    label: 'Affiliate Rank Logs',
  },
  {
    slug: 'affiliate-user-ranks',
    type: 'collections',
    label: 'Affiliate User Ranks',
  },
]

export const AffiliateCollectionList = () => {
  return (
    <div className="admin-entity-grid">
      {collections.map((col, index) => (
        <EntityCard key={col.slug} entity={col} index={index} />
      ))}
    </div>
  )
}
