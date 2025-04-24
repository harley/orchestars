import { Event } from '@/payload-types'

// Helper function to extract zoneId and zoneName
export function getZoneInfo(ticket: any, eventRecord: Event): { zoneId: string; zoneName: string } {
  const ticketPriceInfo = ticket.ticketPriceInfo as Record<string, any>

  let zoneId = ticketPriceInfo?.key || 'unknown'
  let zoneName = ticketPriceInfo?.name || 'unknown'

  // If no zoneId from ticketPriceInfo, try to find it in eventRecord.ticketPrices
  if (zoneId === 'unknown' && eventRecord?.ticketPrices) {
    const ticketPrice = eventRecord.ticketPrices.find(
      (price: any) => price.id === (ticketPriceInfo?.id || ticketPriceInfo?.ticketPriceId),
    )
    zoneId = ticketPrice?.key || 'unknown'
  }

  // If no zoneName from ticketPriceInfo, try to find it in eventRecord.ticketPrices
  if (zoneName === 'unknown' && eventRecord?.ticketPrices) {
    const ticketPrice = eventRecord.ticketPrices.find(
      (price: any) => price.id === (ticketPriceInfo?.id || ticketPriceInfo?.ticketPriceId),
    )
    zoneName = ticketPrice?.name || 'unknown'
  }

  return { zoneId, zoneName }
}
