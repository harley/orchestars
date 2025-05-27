export type CategorySeatChart = {
  id: string
  name: string
  color: string
  textColor: string
}

export type TextSeatChart = {
  color: string
  embraceOffset: boolean
  fontSize: number
  fontWeight: number
  id: string
  label: string
  letterSpacing: number
  rotation: number
  x: number
  y: number
}

export type ShapeSeatChart = {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  rx: number
  color: string
  stroke: string
}

export type SectionSeatChart = {
  id: string
  name: string
  color: string
  stroke: string
  freeSeating: boolean
}

export type SeatItemChart = {
  block: 'left' | 'center' | 'right' | string
  category: CategorySeatChart['id']
  id: string
  label: string
  square: boolean
  status: 'Available' | 'Unavailable' | string
  x: number
  y: number
}

export type EventSeatChartData = {
  seats: SeatItemChart[]
  texts: TextSeatChart[]
  categories: CategorySeatChart[]
  shapes?: ShapeSeatChart[]
  sections?: SectionSeatChart[]
}
