export type Event = {
  id: number
  title: string
  slug: string
  description: string
  keyword: string
  startDatetime?: string
  endDatetime?: string
  schedules: Array<{
    id: string
    date: string
    details: Array<{
      id: string
      time: string
      name: string
      description: string
    }>
  }>
  showAfterExpiration?: boolean
  showTicketsAutomatically?: boolean
  eventLocation: string
  eventTermsAndConditions?: string
  ticketPrices: Array<{
    id: string
    name: string
    price: number
    currency: string
  }>
  eventLogo?: {
    id: number
    alt: string
    url: string
    [k: string]: any
  }
  eventBanner?: {
    id: number
    alt: string
    url: string
    [k: string]: any
  }
  sponsorLogo?: {
    id: number
    alt: string
    url: string
    [k: string]: any
  }
  ticketQuantityLimitation: string
}
