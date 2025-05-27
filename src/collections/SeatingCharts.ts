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
      name: 'seatMap',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'chartMapJson',
      type: 'json',
      required: false,
      hidden: true,
    },
  ],
}
