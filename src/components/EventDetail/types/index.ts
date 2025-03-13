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
