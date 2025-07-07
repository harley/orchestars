export type MembershipHistoryType = 'earned' | 'spent' | 'birthday' | 'receivedTicketGift'

export const MEMBERSHIP_HISTORY_TYPE: Record<
  MembershipHistoryType,
  { label: string; value: MembershipHistoryType }
> = {
  earned: {
    label: 'Tích Điểm',
    value: 'earned',
  },
  spent: {
    label: 'Sử Dụng Điểm',
    value: 'spent',
  },
  birthday: {
    label: 'Tặng Điểm Sinh Nhật',
    value: 'birthday',
  },
  receivedTicketGift: {
    label: 'Nhận Vé Tặng',
    value: 'receivedTicketGift',
  },
}

export const MEMBERSHIP_HISTORY_TYPES = Object.values(MEMBERSHIP_HISTORY_TYPE)
