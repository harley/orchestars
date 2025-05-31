import { useState, useCallback, useRef } from 'react'
import { Event } from '@/payload-types'

interface EventsResponse {
  data: {
    docs: Event[]
    page: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export function useUserEvents() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const cache = useRef<Map<number, EventsResponse>>(new Map())

  const fetchEvents = useCallback(async (page: number) => {
    // Check cache first
    const cachedData = cache.current.get(page)
    if (cachedData) {
      setEvents(cachedData.data.docs)
      setCurrentPage(cachedData.data.page)
      setTotalPages(cachedData.data.totalPages)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/user/events?page=${page}&limit=10`)
      const data: EventsResponse = await response.json()

      if (!response.ok) {
        console.error('Failed to fetch events', data)
        throw new Error((data as any)?.error || 'Failed to fetch events')
      }

      // Cache the response
      cache.current.set(page, data)

      setEvents(data.data.docs)
      setCurrentPage(data.data.page)
      setTotalPages(data.data.totalPages)
    } catch (err) {
      setError('Failed to load events')
      console.error('Error fetching events:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      fetchEvents(currentPage + 1)
    }
  }, [currentPage, totalPages, fetchEvents])

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      fetchEvents(currentPage - 1)
    }
  }, [currentPage, fetchEvents])

  return {
    events,
    isLoading,
    error,
    currentPage,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    nextPage,
    prevPage,
    refresh: () => fetchEvents(currentPage)
  }
}
