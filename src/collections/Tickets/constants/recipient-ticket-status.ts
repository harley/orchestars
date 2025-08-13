export type RecipientTicketStatus = 'pending' | 'confirmed' | 'expired'


export const RECIPIENT_TICKET_STATUS: Record<RecipientTicketStatus, { label: string; value: RecipientTicketStatus }> = {
  pending: {
    label: 'Pending', //  The seat has been paid for and confirmed
    value: 'pending',
  },
  confirmed: {
    label: 'Confirmed', // The seat is held while payment is being processed
    value: 'confirmed',
  },
  expired: {
    label: 'Expired',
    value: 'expired',
  },
}

export const RECIPIENT_TICKET_STATUSES = Object.values(RECIPIENT_TICKET_STATUS)
