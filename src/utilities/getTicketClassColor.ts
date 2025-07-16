import { categories } from '@/components/EventDetail/data/seat-maps/categories'

// Cache for ticket class colors to avoid repeated lookups
const colorCache = new Map<string, { color: string; textColor: string }>()

/**
 * Get ticket class color with caching for performance
 * @param ticketPriceInfo - Ticket price info object containing the key
 * @returns Object with color and textColor properties
 */
export const getTicketClassColor = (ticketPriceInfo: any) => {
  if (!ticketPriceInfo || typeof ticketPriceInfo !== 'object') {
    return { color: '#6B7280', textColor: '#fff' } // Default gray color
  }

  const ticketKey = ticketPriceInfo.key
  if (!ticketKey) {
    return { color: '#6B7280', textColor: '#fff' } // Default gray color
  }

  // Check cache first
  if (colorCache.has(ticketKey)) {
    return colorCache.get(ticketKey)!
  }

  // Find category and cache result
  const category = categories.find((cat) => cat.id === ticketKey)
  const result = category
    ? { color: category.color, textColor: category.textColor }
    : { color: '#6B7280', textColor: '#fff' } // Default gray color

  colorCache.set(ticketKey, result)
  return result
}

/**
 * Clear the color cache (useful for testing or if categories change)
 */
export const clearTicketClassColorCache = () => {
  colorCache.clear()
}

export const getTicketClassColorNoCached = (ticketPriceInfo: any) => {
  if (!ticketPriceInfo || typeof ticketPriceInfo !== 'object') {
    return { color: '#6B7280', textColor: '#fff' } // Default gray color
  }

  const ticketKey = ticketPriceInfo.key
  const category = categories.find((cat) => cat.id === ticketKey)

  return category
    ? { color: category.color, textColor: category.textColor }
    : { color: '#6B7280', textColor: '#fff' } // Default gray color
}