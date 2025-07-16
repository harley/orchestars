export const EMAIL_STATUS = {
    pending: { label: 'Pending', value: 'pending' },
    sent: { label: 'Sent', value: 'sent' },
    failed: { label: 'Failed', value: 'failed' },
  }
  
  export const EMAIL_STATUSES = Object.values(EMAIL_STATUS)

  export type EmailType = 'qr_event_ticket' | 'event_ticket_confirmation' | 'reset_password'
  
  export const EMAIL_TYPE: Record<EmailType, { label: string; value: EmailType }> = {
    qr_event_ticket: { label: 'QR Event Ticket', value: 'qr_event_ticket' },
    event_ticket_confirmation: { label: 'Event Ticket Confirmation', value: 'event_ticket_confirmation' },
    reset_password: { label: 'Reset Password', value: 'reset_password' },
  }
  
  export const EMAIL_TYPES = Object.values(EMAIL_TYPE)