import React from 'react'
import Link from 'next/link'
import './AdminCollection.css'
import { Plus } from 'lucide-react'

export interface Entity {
  slug: string
  type: string
  label: string
}

export interface CollectionSection {
  label: string
  entities: Entity[]
}

interface EntityCardProps {
  entity: Entity
  index: number
}

const EntityCard: React.FC<EntityCardProps> = ({ entity, index }) => {
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

interface SectionProps {
  section: CollectionSection
  index: number
}

const Section: React.FC<SectionProps> = ({ section, index }) => {
  return (
    <div className="admin-section" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="admin-section-header" style={{ animationDelay: `${index * 0.1 + 0.2}s` }}>
        <h2 className="admin-section-title">{section.label}</h2>
      </div>

      <div className="admin-entity-grid">
        {section.entities.map((entity, idx) => (
          <EntityCard key={`${entity.slug}-${idx}`} entity={entity} index={idx} />
        ))}
      </div>
    </div>
  )
}

interface AdminCollectionProps {
  collections: CollectionSection[]
}

const AdminCollection: React.FC<AdminCollectionProps> = ({ collections }) => {
  return (
    <div className="admin-collection">
      {collections.map((section, index) => (
        <Section key={`${section.label}-${index}`} section={section} index={index} />
      ))}
    </div>
  )
}

export default AdminCollection
