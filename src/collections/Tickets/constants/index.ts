export const TICKET_STATUS = {
  booked: {
    label: 'Booked', //  The seat has been paid for and confirmed
    value: 'booked',
  },
  pending_payment: {
    label: 'Pending Payment', // The seat is held while payment is being processed
    value: 'pending_payment',
  },
  hold: {
    label: 'Hold', // The seat is hold while pending user continue to pay
    value: 'hold',
  },
  cancelled: {
    label: 'Canceled', // The seat has been cancelled by user: eg user has not paid for this ticket
    value: 'cancelled',
  },
}

export const TICKET_STATUSES = Object.values(TICKET_STATUS)
