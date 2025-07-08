import type { CollectionConfig } from 'payload'
import { TICKET_ZONES } from '../Events/constants'

export const MembershipGift: CollectionConfig = {
  slug: 'membership-gifts',
  admin: {
    useAsTitle: 'user',
    description: 'Quản lý các vé tặng thăng hạng của thành viên',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Người Dùng',
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'giftType',
      type: 'select',
      label: 'Loại Quà Tặng',
      required: true,
      options: [{ label: 'Tặng Vé', value: 'giftTicket' }],
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'ticketGift',
      type: 'select',
      label: 'Vé Được Thưởng Khi Thăng Hạng',
      required: false,
      options: TICKET_ZONES,
      admin: {
        description: 'Loại vé tặng khi thành viên thăng hạng',
        condition: (data) => data.giftType === 'giftTicket',
        readOnly: true,
      },
    },
    {
      name: 'receivedAt',
      type: 'date',
      label: 'Ngày Nhận Quà Tặng',
      required: false,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      label: 'Ngày Hết Hạn',
      required: false,
      admin: {
        description:
          'Thời gian hết hạn của quà tặng(Nếu không thiết lập thì quà tặng sẽ không hết hạn)',
        readOnly: true,
      },
      index: true,
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation, req: { payload } }) => {
        //    todo write history for receiving
      },
    ],
  },
}
