export interface Event {
  id: string
  title: string
  description: string
  startDatetime: string
  endDatetime: string
  eventLocation: string
  schedules?: Array<{
    id: string
    date: string
    details?: Array<{
      time: string
      name: string
      description: string
    }>
  }>
  ticketPrices?: Array<TicketPrice>
}

export interface TicketPrice {
  name: string
  key: 'zone1' | 'zone2' | 'zone3' | 'zone4' | 'zone5'
  price: number
  currency: string
  quantity: number
}

export interface Ticket {
  id: string
  ticketPriceName: string
  status: 'booked' | 'pending_payment' | 'hold' | 'cancelled'
  seat: string | null
  userEmail?: string
  eventScheduleId: string
  ticketCode: string
  attendeeName: string
  expire_at?: string
  ticketPriceInfo?: Record<string, any>
  order?: {
    promotion_code: string | null
  }
}
