import type { CollectionConfig } from 'payload'

export const SeatingCharts: CollectionConfig = {
  slug: 'seatingCharts',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'chartMap',
      type: 'json',
      required: true,
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: false,
    },
  ],
}
