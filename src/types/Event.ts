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
    scheduleImage: string
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
    quantity: number
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
  mobileEventBanner?: {
    id: number
    alt: string
    url: string
    [k: string]: any
  }
  eventThumbnail?: {
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
  ticketQuantityLimitation?: 'perTicketType' | 'perEvent'
  configuration: {
    showBannerTitle: boolean
    showBannerDescription: boolean
    showBannerTime: boolean
    showBannerLocation: boolean
  }
  status: string
}
