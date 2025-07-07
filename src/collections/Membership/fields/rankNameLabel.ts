import { Field } from 'payload'
import { displayRankNameLabel } from '../hooks/displayRankNameLabel'

export const rankNameLabel: Field = {
  name: 'rankNameLabel',
  label: '',
  type: 'text',
  access: {
    create: () => false,
    update: () => false,
  },
  hooks: {
    beforeChange: [
      ({ siblingData }: any) => {
        // Mutate the sibling data to prevent DB storage
        siblingData.rankNameLabel = undefined
      },
    ],
    afterRead: [displayRankNameLabel],
  },
  admin: {
    hidden: true,
    disableListColumn: true,
    disableListFilter: true,
  },
}
