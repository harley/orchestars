import React from 'react'
import Link from 'next/link'
import './EntityCard.css'
import { Plus } from 'lucide-react'

export interface Entity {
    slug: string
    type: string
    label: string
  }

const EntityCard = ({ entity, index }: { entity: Entity, index: number }) => {
  return (
    <Link href={`/admin/${entity.type}/${entity.slug}`}>
    <div className="admin-entity-card" style={{ animationDelay: `${index * 0.05}s` }}>
      <h3 className="admin-entity-title">{entity.label}</h3>
      <p className="admin-entity-type">{entity.type}</p>
      <div className="admin-entity-add">
        <Plus size={16} />
      </div>
    </div>
  </Link>
  )
}

export default EntityCard