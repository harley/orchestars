export type ActionTypeLog = 'add_points' | 'subtract_points' | 'rank_upgrade' | 'rank_downgrade' | 'confirm_rank_upgrade' | 'event_completed'

export const AFFILIATE_ACTION_TYPE_LOG: Record<ActionTypeLog, { label: string; value: ActionTypeLog }> = {
  add_points: { label: 'Thêm Điểm', value: 'add_points' },
  subtract_points: { label: 'Trừ Điểm', value: 'subtract_points' },
  rank_upgrade: { label: 'Nâng Hạng', value: 'rank_upgrade' },
  rank_downgrade: { label: 'Hạ Hạng', value: 'rank_downgrade' },
  confirm_rank_upgrade: { label: 'Xác Nhận Nâng Hạng', value: 'confirm_rank_upgrade' },
  event_completed: { label: 'Event Hoàn Thành', value: 'event_completed' },
}

export const AFFILIATE_ACTION_TYPE_LOGS = Object.values(AFFILIATE_ACTION_TYPE_LOG)
