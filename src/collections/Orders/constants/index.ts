export type OrderStatus = 'processing' | 'canceled' | 'completed' | 'failed'

export const ORDER_STATUS = {
  processing: { label: 'Processing', value: 'processing' },
  canceled: { label: 'Canceled', value: 'canceled' },
  completed: { label: 'Completed', value: 'completed' },
  failed: { label: 'Failed', value: 'failed' },
}

export const ORDER_STATUSES = Object.values(ORDER_STATUS)

export type OrderItemStatus = 'processing' | 'canceled' | 'completed'

export const ORDER_ITEM_STATUS: Record<OrderItemStatus, { label: string; value: OrderItemStatus }> = {
  processing: { label: 'Processing', value: 'processing' },
  canceled: { label: 'Canceled', value: 'canceled' },
  completed: { label: 'Completed', value: 'completed' },
}

export const ORDER_ITEM_STATUSES = Object.values(ORDER_ITEM_STATUS)
