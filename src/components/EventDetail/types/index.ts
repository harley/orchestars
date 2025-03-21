export interface SeatType {
  id: string
  name?: string
  row: string
  number: number
  price?: number
  isReserved: boolean
  [k: string]: any
}

export interface SeatProps {
  seat: SeatType
  isSelected: boolean
  onSelect: (seat: SeatType) => void
}

export interface SelectedSeat {
  id: string
  label: string
  ticketPrice: {
    id: string
    name: string
    price: number
    currency: string
  }
  eventId: number
  [k: string]: any
}

export interface SeatToolKitItem {
  id: string
  label: string
  category: {
    id: string
    name: string
  }
}

export interface PaymentDetails {
  amount: string
  accountName: string
  accountNo: string
  bankName: string
  contentBankTransfer: string
  qrDataURL: string
}

export interface TicketPrice {
  name?: string
  /**
   * Giá trị giảm dần theo khu vực, với Zone 1 là vé đắt nhất.
   */
  key?: ('zone1' | 'zone2' | 'zone3' | 'zone4' | 'zone5') | null
  price?: number
  currency?: string
  id?: string
}
