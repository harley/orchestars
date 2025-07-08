import type { CollectionConfig } from 'payload'
import { MEMBERSHIP_HISTORY_TYPES } from './constants/membershipHistoryType'

export const MembershipHistory: CollectionConfig = {
  slug: 'membership-histories',
  admin: {
    useAsTitle: 'user',
  },
  access: {
    create: () => false,
    // delete: () => false,
    update: () => false,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        description: 'User người mà có thay đổi điểm tích lũy hoặc hạng thành viên',
        readOnly: true,
      },
    },
    {
      name: 'membership',
      type: 'relationship',
      relationTo: 'memberships',
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: false, // Điểm có thể từ nguồn khác, không bắt buộc từ order
      index: true,
      admin: {
        description: 'Đơn hàng liên quan',
        readOnly: true,
        condition: (data) => !!data.order,
      },
    },
    {
      name: 'pointsBefore',
      type: 'number',
      label: 'Điểm Trước Khi Thay Đổi',
      admin: {
        description: 'Số điểm của Membership trước khi thay đổi',
        readOnly: true,
        // disabled: true,
      },
    },
    {
      name: 'pointsChange',
      type: 'number',
      label: 'Thay Đổi Điểm',
      defaultValue: 0,
      admin: {
        description: 'Số điểm thay đổi (dương hoặc âm, 0 nếu không thay đổi điểm)',
        readOnly: true,
        // disabled: true,
      },
    },
    {
      name: 'pointsAfter',
      type: 'number',
      label: 'Điểm Sau Khi Thay Đổi',
      admin: {
        description: 'Số điểm của Membership sau khi thay đổi',
        readOnly: true,
        // disabled: true,
      },
    },

    {
      name: 'type',
      type: 'select',
      options: MEMBERSHIP_HISTORY_TYPES,
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'description',
      type: 'text',
      required: false, // Mô tả giao dịch, ví dụ: "Tích điểm từ đơn hàng #123"
      admin: {
        description: 'Mô tả giao dịch, ví dụ: "Tích điểm từ đơn hàng #123"',
        readOnly: true,
      },
    },
    {
      name: 'moreInformation',
      type: 'json',
      required: false,
      admin: {
        description: 'Thông tin bổ sung về giao dịch',
        readOnly: true,
      },
    },
  ],
}
