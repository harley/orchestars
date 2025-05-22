import { Media } from "@/payload-types";

export type TicketPrice = {
  name?: string | null;
  key?: "zone1" | "zone2" | "zone3" | "zone4" | "zone5" | null;
  price?: number | null;
  currency?: string | null;
  quantity?: number | null;
  id?: string | null;
};

export type EventSchedule = {
  date?: string | null;
  scheduleImage?: (number | null) | Media;
  details?: {
      time?: string | null;
      name?: string | null;
      description?: string | null;
      id?: string | null;
  }[] | null;
  id?: string | null;
}

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
