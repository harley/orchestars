import { useState, useCallback, useRef, useEffect } from 'react'
import { Ticket } from '@/types/Ticket'

interface TicketsResponse {
  data: {
    docs: Ticket[]
    page: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

interface UseTicketsProps {
  eventType: 'upcoming' | 'finished'
  ticketType: 'booked' | 'canceled' | 'pending_payment' | 'gifted'
}

export function useTickets({ eventType, ticketType }: UseTicketsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const cache = useRef<Map<string, TicketsResponse>>(new Map())

  const fetchTickets = useCallback(
    async (page: number) => {
      const cacheKey = `${eventType}-${ticketType}-${page}`

      // Check cache first
      const cachedData = cache.current.get(cacheKey)

      if (cachedData) {
        setTickets(cachedData.data.docs)
        setCurrentPage(cachedData.data.page)
        setTotalPages(cachedData.data.totalPages)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/user/tickets?timeStatus=${eventType}&ticketType=${ticketType}&page=${page}&limit=10`,
        )
        const data: TicketsResponse = await response.json()

        if (!response.ok) {
          console.error('Failed to fetch tickets', data)
          throw new Error((data as any)?.message || 'Failed to fetch tickets')
        }

        // Cache the response
        cache.current.set(cacheKey, data)

        setTickets(data.data.docs)
        setCurrentPage(data.data.page)
        setTotalPages(data.data.totalPages)
      } catch (err) {
        setError('Failed to load tickets')
        console.error('Error fetching tickets:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [eventType, ticketType],
  )
  useEffect(() => {
    fetchTickets(1)
  }, [eventType, ticketType, fetchTickets])
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      fetchTickets(currentPage + 1)
    }
  }, [currentPage, totalPages, fetchTickets])

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      fetchTickets(currentPage - 1)
    }
  }, [currentPage, fetchTickets])

  return {
    tickets,
    isLoading,
    error,
    currentPage,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    nextPage,
    prevPage,
    refresh: () => fetchTickets(currentPage),
  }
}
