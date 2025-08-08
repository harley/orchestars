import { User } from '@/payload-types'

export type Ticket = {
  id: string
  attendeeName: string
  email: string
  event: any
  eventDate: string
  phoneNumber: string
  ticketCode: string
  seat: string
  status: string
  ticketPriceInfo?: any
  isCheckedIn?: boolean
  checkinRecord?: any
  user?: User
  giftInfo?: {
    /**
     * Đánh dấu vé có phải là vé tặng hay không
     */
    isGifted?: boolean;
  };
}
