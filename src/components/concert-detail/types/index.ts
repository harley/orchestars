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
