import { User } from '@/payload-types'

export type Ticket = {
  id: string
  attendeeName: string
  email: string
  event: {
    id: number | string
    title?: string
    eventLocation?: string
    ticketPrices?: Array<{
      id: string
      name: string
      key: string
      price: number
      currency: string
      quantity: number
    }>
  }
  eventDate: string
  phoneNumber: string
  ticketCode: string
  seat: string
  status: string
  ticketPriceInfo?: {
    name?: string
    id?: string
    ticketPriceId?: string
    [key: string]: any
  }
  isCheckedIn?: boolean
  checkinRecord?: any
  user?: User
  giftInfo?: {
    /**
     * Marks whether the ticket has been gifted.
     */
    isGifted?: boolean;
  };
}
