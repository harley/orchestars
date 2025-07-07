import type { CollectionConfig } from 'payload'

export const Membership: CollectionConfig = {
  slug: 'memberships',
  admin: {
    useAsTitle: 'user',
    description:
      'Stores membership-related information for users, including points, rank, and activity details.',
  },
  access: {
    create: () => false,
    // delete: () => false,
    // update: () => false,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true, // Mỗi user chỉ có một profile
      index: true,
      admin: {
        readOnly: true, // Cập nhật qua logic tự động
      },
    },
    {
      name: 'totalPoints',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
      admin: {
        readOnly: true, // Cập nhật qua logic tự động
      },
    },
    {
      name: 'membershipRank',
      type: 'relationship',
      relationTo: 'membership-rank-configs',
      required: false, // Có thể null nếu chưa đạt hạng nào
      admin: {
        readOnly: true, // Cập nhật qua logic tự động
      },
    },
    {
      name: 'lastActive',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm a',
        },
        readOnly: true, // Cập nhật qua logic tự động
      },
    },
    {
      // use virtual field
      name: 'pointsExpirationDate',
      type: 'date',
      required: false, // Ngày hết hạn của điểm hiện tại
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm a',
        },
        readOnly: true,
      },
    },
    {
      name: 'lastReceivedBirthdayPointAt',
      type: 'date',
      label: 'Lần Nhận Điểm Sinh Nhật Gần Nhất',
      required: false,
      admin: {
        description: 'Thời gian nhận điểm sinh nhật gần nhất',
        readOnly: true, // Cập nhật qua logic tự động
      },
    },
    
    // {
    //   name: 'notificationPreferences',
    //   type: 'group',
    //   fields: [
    //     {
    //       name: 'pointsExpiringSoon',
    //       type: 'checkbox',
    //       defaultValue: true, // Nhận thông báo khi điểm sắp hết hạn
    //     },
    //     {
    //       name: 'tierChange',
    //       type: 'checkbox',
    //       defaultValue: true, // Nhận thông báo khi thay đổi hạng
    //     },
    //     {
    //       name: 'pointsEarned',
    //       type: 'checkbox',
    //       defaultValue: true, // Nhận thông báo khi tích điểm
    //     },
    //   ],
    // },
    // {
    //   name: 'referralCode',
    //   type: 'text',
    //   unique: true,
    //   required: false, // Mã giới thiệu riêng của user
    //   index: true,
    //   admin: {
    //     description: 'Mã giới thiệu riêng của user',
    //     readOnly: true,
    //   },
    // },
  ],
  hooks: {},
}
