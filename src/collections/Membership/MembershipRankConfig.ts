import type { CollectionConfig } from 'payload'
import { MEMBERSHIP_RANK, MEMBERSHIP_RANK_EXPIRES_IN, MEMBERSHIP_RANKS } from './constants'
import { rankNameLabel } from './fields/rankNameLabel'
import { TICKET_ZONES } from '../Events/constants'

export const MembershipRankConfig: CollectionConfig = {
  slug: 'membership-rank-configs',
  admin: {
    useAsTitle: 'rankNameLabel',
    description: 'Cấu hình các hạng của Membership',
  },

  fields: [
    // --- Thông tin hạng ---
    {
      name: 'rankName',
      type: 'select',
      label: 'Tên Hạng',
      required: true,
      options: MEMBERSHIP_RANKS,
      unique: true,
    },
    rankNameLabel,
    {
      name: 'expiresIn',
      type: 'number',
      label: 'Khoảng thời gian nếu không hoạt động sẽ bị xuống hạng (ngày)',
      required: false,
      defaultValue: MEMBERSHIP_RANK_EXPIRES_IN,
      min: 0,
      admin: {
        readOnly: true,
        description: 'Khoảng thời gian nếu không hoạt động sẽ bị xuống hạng (ngày) (không tính hạng thấp nhất)',
      },
    },
    {
      name: 'description',
      type: 'text',
      label: 'Description',
      required: false,
    },
    // Condition
    {
      name: 'condition',
      type: 'group',
      label: 'Điều kiện',
      fields: [
        {
          name: 'minPoints',
          type: 'number',
          label: 'Điểm Tích Lũy Tối Thiểu',
          required: true,
          defaultValue: 0,
          admin: {
            description: 'Số điểm tối thiểu để đạt hạng này (1 điểm = 1000 VND doanh thu)',
          },
        },
        // Điều kiện duy trì điểm, áp dụng cho Tier2 trở lên
        // todo
      ],
    },
    // --- Quyền lợi ---
    {
      name: 'benefits',
      type: 'group',
      label: 'Quyền lợi',
      fields: [
        {
          name: 'birthdayPoints',
          type: 'number',
          label: 'Điểm Quà Sinh Nhật',
          required: false,
          defaultValue: 0,
          admin: {
            description: 'Số điểm tặng vào dịp sinh nhật của thành viên thuộc hạng này',
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
            condition: (data) =>
              [
                MEMBERSHIP_RANK.Tier2.value,
                MEMBERSHIP_RANK.Tier3.value,
                MEMBERSHIP_RANK.Tier4.value,
              ].includes(data?.rankName),
          },
        },
        {
          name: 'giftExpiresIn',
          type: 'number',
          label: 'Thời Gian Hết Hạn Vé Tặng (Bắt đầu tính từ thời điểm thăng hạng)',
          required: false,
          defaultValue: 365,
          min: 0,
          admin: {
            description: 'Thời gian hết hạn vé tặng (ngày)',
            readOnly: true,
          },
        },
        {
          name: 'discountPercentage',
          type: 'number',
          label: 'Phần Trăm Giảm Giá',
          required: false,
          defaultValue: 0,
          min: 0,
          max: 100,
          admin: {
            description: 'Phần trăm giảm giá khi mua vé cho hạng này (%)',
          },
        },
        {
          name: 'vipCheckIn',
          type: 'checkbox',
          label: 'Check-in Khu VIP',
          required: false,
          defaultValue: false,
          admin: {
            description: 'Cho phép check-in tại khu VIP khi tham gia show',
            condition: (data) =>
              [MEMBERSHIP_RANK.Tier3.value, MEMBERSHIP_RANK.Tier4.value].includes(
                data?.rankName,
              ),
          },
        },
      ],
    },
  ],
}
