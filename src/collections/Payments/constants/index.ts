export const PAYMENT_STATUS = {
  processing: { label: 'Processing', value: 'processing' },
  canceled: { label: 'Canceled', value: 'canceled' },
  paid: { label: 'Paid', value: 'paid' },
  failed: { label: 'Failed', value: 'failed' },
}

export const PAYMENT_STATUSES = Object.values(PAYMENT_STATUS)
