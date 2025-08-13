import { useState, useCallback, useRef, useEffect } from 'react'
import { Ticket } from '@/types/Ticket'
import { TicketStatus } from '@/collections/Tickets/constants'

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
  ticketStatus: TicketStatus | 'gifted'
}

export function useTickets({ ticketStatus }: UseTicketsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const cache = useRef<Map<string, TicketsResponse>>(new Map())

  const fetchTickets = useCallback(
    async (page: number, options?: { forceFetch?: boolean }) => {
      const cacheKey = `${ticketStatus}-${page}`

      // Check cache first
      const cachedData = cache.current.get(cacheKey)

      if (!options?.forceFetch && cachedData) {
        setTickets(cachedData.data.docs)
        setCurrentPage(cachedData.data.page)
        setTotalPages(cachedData.data.totalPages)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/user/tickets?ticketStatus=${ticketStatus}&page=${page}&limit=10`,
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
    [ticketStatus],
  )
  useEffect(() => {
    fetchTickets(1)
  }, [ticketStatus, fetchTickets])

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
    refresh: (page?: number, options?: { forceFetch?: boolean }) =>
      fetchTickets(page || currentPage, options),
  }
}
