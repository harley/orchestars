'use client'

import React, { useState, useRef, useEffect } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { getTicketsForSchedule, assignSeatToTicket, getBookedTicketsCounts } from './actions'
import { useRouter, useSearchParams } from 'next/navigation'

interface Event {
  id: string
  title: string
  description: string
  startDatetime: string
  endDatetime: string
  eventLocation: string
  schedules?: Array<{
    id: string
    date: string
    details?: Array<{
      time: string
      name: string
      description: string
    }>
  }>
  ticketPrices?: Array<TicketPrice>
}

interface TicketPrice {
  name: string
  key: 'zone1' | 'zone2' | 'zone3' | 'zone4' | 'zone5'
  price: number
  currency: string
  quantity: number
}

interface Ticket {
  id: string
  ticketPriceName: string
  status: 'booked' | 'pending_payment' | 'hold' | 'cancelled'
  seat: string | null
  userEmail?: string
  eventScheduleId: string
  ticketCode: string
  attendeeName: string
  expire_at?: string
  order?: {
    promotion_code: string | null
  }
}

interface Props {
  event: Event
}

const AdminEventClient: React.FC<Props> = ({ event }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    searchParams.get('scheduleId'),
  )
  const [selectedTicketPrice, setSelectedTicketPrice] = useState<string | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)
  const [editingSeatId, setEditingSeatId] = useState<string | null>(null)
  const [newSeatValue, setNewSeatValue] = useState('')
  const [assignError, setAssignError] = useState<string | null>(null)
  const [bookedCounts, setBookedCounts] = useState<Record<string, Record<string, number>>>({})
  const [bookedCountsLoading, setBookedCountsLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const rowRefs = useRef<Record<string, HTMLDivElement>>({})
  const [loadingTicketId, setLoadingTicketId] = useState<string | null>(null)

  useEffect(() => {
    const loadBookedCounts = async () => {
      setBookedCountsLoading(true)
      try {
        console.log('Loading booked counts for event:', event.id)
        const counts = await getBookedTicketsCounts(event.id)
        console.log('Received booked counts:', counts)
        setBookedCounts(counts || {})
      } catch (error) {
        console.error('Error loading booked counts:', error)
      } finally {
        setBookedCountsLoading(false)
      }
    }
    loadBookedCounts()
  }, [event.id])

  useEffect(() => {
    const loadInitialData = async () => {
      if (selectedScheduleId) {
        setLoading(true)
        try {
          const ticketDocs = await getTicketsForSchedule(event.id, selectedScheduleId)
          setTickets(ticketDocs as unknown as Ticket[])
        } catch (error) {
          console.error('Error loading tickets:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    loadInitialData()
  }, [selectedScheduleId, event.id])

  const handleScheduleClick = async (scheduleId: string) => {
    setSelectedScheduleId(scheduleId)
    // Update URL with selected schedule
    router.push(`?scheduleId=${scheduleId}`, { scroll: false })
  }

  const handleSeatEdit = (ticketId: string) => {
    setEditingSeatId(ticketId)
    const ticket = tickets.find((t) => t.id === ticketId)
    setNewSeatValue(ticket?.seat || '')
    setAssignError(null)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  const scrollToRow = (rowId: string) => {
    const element = rowRefs.current[rowId]
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleSeatSubmit = async (ticketId: string) => {
    try {
      setLoadingTicketId(ticketId)
      const trimmedSeat = newSeatValue.trim()

      const existingTicket = tickets.find(
        (t) => t.id !== ticketId && t.seat?.toUpperCase() === trimmedSeat.toUpperCase(),
      )

      if (existingTicket && trimmedSeat) {
        setAssignError('Seat is already taken')
        setLoadingTicketId(null)
        return
      }

      const result = await assignSeatToTicket(ticketId, trimmedSeat || null)

      if (result.error) {
        setAssignError(result.error)
        setLoadingTicketId(null)
        return
      }

      // Update local state
      setTickets(
        tickets.map((t) => {
          if (t.id === ticketId) {
            return { ...t, seat: trimmedSeat ? trimmedSeat.toUpperCase() : null }
          }
          return t
        }),
      )

      setEditingSeatId(null)
      setNewSeatValue('')
      setAssignError(null)
      setLoadingTicketId(null)

      // Scroll to the appropriate row
      if (trimmedSeat) {
        const row = trimmedSeat.match(/[A-Z]+/)?.[0]
        if (row) {
          scrollToRow(row)
        }
      } else {
        scrollToRow('-')
      }
    } catch (error) {
      console.error('Error updating seat:', error)
      setAssignError('Failed to update seat')
      setLoadingTicketId(null)
    }
  }

  const groupTicketsByRow = (tickets: Ticket[]) => {
    const groups = tickets.reduce(
      (acc, ticket) => {
        if (ticket.status === 'cancelled') {
          if (!acc['cancelled']) {
            acc['cancelled'] = []
          }
          acc['cancelled'].push(ticket)
        } else {
          const row = ticket.seat?.match(/[A-Z]+/)?.[0] || '-'
          if (!acc[row]) {
            acc[row] = []
          }
          acc[row].push(ticket)
        }
        return acc
      },
      {} as Record<string, Ticket[]>,
    )

    // Sort tickets within each group
    Object.keys(groups).forEach((row) => {
      if (groups[row]) {
        groups[row].sort((a, b) => {
          const aNum = parseInt(a.seat?.match(/\d+/)?.[0] || '0', 10)
          const bNum = parseInt(b.seat?.match(/\d+/)?.[0] || '0', 10)
          return aNum - bNum
        })
      }
    })

    // Sort groups with specific order: regular rows alphabetically, then unassigned, then cancelled
    return Object.entries(groups).sort(([a], [b]) => {
      if (a === 'cancelled') return 1
      if (b === 'cancelled') return -1
      if (a === '-') return 1
      if (b === '-') return -1
      return a.localeCompare(b)
    })
  }

  const handleTicketPriceClick = (ticketName: string) => {
    setSelectedTicketPrice(selectedTicketPrice === ticketName ? null : ticketName)
  }

  const filteredTickets = selectedTicketPrice
    ? tickets.filter((ticket) => ticket.ticketPriceName === selectedTicketPrice)
    : tickets

  const formatBookedCount = (ticket: TicketPrice) => {
    if (!event.schedules) return `0 / ${ticket.quantity}`
    if (bookedCountsLoading) return 'Loading...'

    const counts = event.schedules.map((schedule) => {
      const count = bookedCounts[ticket.name]?.[schedule.id] || 0
      return count
    })

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'inherit',
          fontSize: '0.875rem',
          fontFamily: 'monospace',
          opacity: bookedCountsLoading ? 0.5 : 1,
        }}
      >
        {counts.join(' | ')} | {ticket.quantity}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <div
        style={{
          width: '300px',
          borderRight: '1px solid #ddd',
          padding: '2rem',
          overflowY: 'auto',
        }}
      >
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          {event.title}
        </h1>
        <div className="space-y-4">
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Description</h2>
            <p>{event.description}</p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Location</h2>
            <p>{event.eventLocation}</p>
          </div>

          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Dates</h2>
            <p>Start: {new Date(event.startDatetime).toLocaleString()}</p>
            <p>End: {new Date(event.endDatetime).toLocaleString()}</p>
          </div>

          {event.schedules && event.schedules.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Schedules</h2>
              {event.schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  style={{
                    marginLeft: '1rem',
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    backgroundColor: selectedScheduleId === schedule.id ? '#374151' : 'transparent',
                    color: selectedScheduleId === schedule.id ? 'white' : 'inherit',
                    borderRadius: '4px',
                  }}
                  onClick={() => handleScheduleClick(schedule.id)}
                >
                  <h3 style={{ fontWeight: 'bold' }}>
                    {format(new Date(schedule.date), 'dd/MM/yyyy')}
                  </h3>
                  {schedule.details?.map((detail, detailIndex) => (
                    <div key={detailIndex} style={{ marginLeft: '1rem' }}>
                      <p>
                        {detail.time} - {detail.name}
                      </p>
                      <p style={{ color: selectedScheduleId === schedule.id ? '#d1d5db' : 'gray' }}>
                        {detail.description}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {event.ticketPrices && event.ticketPrices.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Ticket Prices</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {event.ticketPrices.map((ticket, index) => (
                  <div
                    key={index}
                    onClick={() => handleTicketPriceClick(ticket.name)}
                    style={{
                      padding: '1rem',
                      border: '1px solid #374151',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      backgroundColor: selectedTicketPrice === ticket.name ? '#374151' : 'white',
                      color: selectedTicketPrice === ticket.name ? 'white' : '#1a1a1a',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <h3
                      style={{
                        fontWeight: 'bold',
                        color: selectedTicketPrice === ticket.name ? 'white' : '#1a1a1a',
                      }}
                    >
                      {ticket.name}
                    </h3>
                    <p
                      style={{
                        whiteSpace: 'nowrap',
                        color: selectedTicketPrice === ticket.name ? 'white' : '#4a4a4a',
                      }}
                    >
                      {ticket.price.toLocaleString()} {ticket.currency}
                    </p>
                    <p
                      style={{ color: selectedTicketPrice === ticket.name ? '#d1d5db' : '#666666' }}
                    >
                      {formatBookedCount(ticket)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {selectedScheduleId ? (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                Tickets for{' '}
                {format(
                  new Date(event.schedules?.find((s) => s.id === selectedScheduleId)?.date || ''),
                  'dd/MM/yyyy',
                )}
              </h2>
              {selectedTicketPrice && (
                <button
                  onClick={() => setSelectedTicketPrice(null)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Clear Filter
                </button>
              )}
            </div>
            {loading ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '200px',
                }}
              >
                Loading tickets...
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {groupTicketsByRow(filteredTickets).map(([row, rowTickets]) => (
                  <div
                    key={row}
                    ref={(el) => {
                      if (el) rowRefs.current[row] = el
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        color: '#666',
                        marginBottom: '0.5rem',
                      }}
                    >
                      {row === 'cancelled'
                        ? 'Cancelled'
                        : row === '-'
                          ? 'Unassigned'
                          : `Row ${row}`}
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '0.5rem',
                      }}
                    >
                      {rowTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          style={{
                            padding: '0.75rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            backgroundColor:
                              ticket.status === 'booked'
                                ? '#f0fff4'
                                : ticket.status === 'pending_payment'
                                  ? '#fff7ed'
                                  : ticket.status === 'hold'
                                    ? '#fff1f2'
                                    : ticket.status === 'cancelled'
                                      ? '#f1f5f9'
                                      : 'white',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '1.5rem',
                              fontWeight: 'bold',
                              color: '#1a1a1a',
                              borderBottom: '1px solid #ddd',
                              paddingBottom: '0.5rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            {editingSeatId === ticket.id ? (
                              <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                                <input
                                  ref={inputRef}
                                  type="text"
                                  value={newSeatValue}
                                  onChange={(e) => setNewSeatValue(e.target.value.toUpperCase())}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSeatSubmit(ticket.id)
                                    } else if (e.key === 'Escape') {
                                      setEditingSeatId(null)
                                      setNewSeatValue('')
                                      setAssignError(null)
                                    }
                                  }}
                                  style={{
                                    width: '80px',
                                    padding: '0.25rem',
                                    fontSize: '1.25rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    backgroundColor: '#f8fafc',
                                    color: '#1a1a1a',
                                  }}
                                />
                                <button
                                  onClick={() => handleSeatSubmit(ticket.id)}
                                  style={{
                                    padding: '0.25rem 0.5rem',
                                    backgroundColor: '#22c55e',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor:
                                      loadingTicketId === ticket.id ? 'not-allowed' : 'pointer',
                                    opacity: loadingTicketId === ticket.id ? 0.7 : 1,
                                  }}
                                  disabled={loadingTicketId === ticket.id}
                                >
                                  {loadingTicketId === ticket.id ? 'Assigning...' : 'Save'}
                                </button>
                              </div>
                            ) : (
                              <>
                                <div
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                  <span>{ticket.seat || '-'}</span>
                                  {ticket.order?.promotion_code && (
                                    <span
                                      style={{
                                        fontSize: '0.75rem',
                                        padding: '0.125rem 0.375rem',
                                        border: '1px dashed #6b7280',
                                        borderRadius: '4px',
                                        color: '#6b7280',
                                        backgroundColor: 'transparent',
                                      }}
                                    >
                                      {ticket.order.promotion_code}
                                    </span>
                                  )}
                                </div>
                                {ticket.seat ? (
                                  <button
                                    onClick={async () => {
                                      setLoadingTicketId(ticket.id)
                                      const result = await assignSeatToTicket(ticket.id, null)
                                      if (result.success) {
                                        setTickets(
                                          tickets.map((t) => {
                                            if (t.id === ticket.id) {
                                              return { ...t, seat: null }
                                            }
                                            return t
                                          }),
                                        )
                                        scrollToRow('-')
                                      } else {
                                        setAssignError('Failed to unassign seat')
                                      }
                                      setLoadingTicketId(null)
                                    }}
                                    style={{
                                      padding: '0.25rem 0.75rem',
                                      backgroundColor: '#e5e7eb',
                                      color: '#4b5563',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor:
                                        loadingTicketId === ticket.id ? 'not-allowed' : 'pointer',
                                      opacity: loadingTicketId === ticket.id ? 0.7 : 1,
                                      fontSize: '0.875rem',
                                    }}
                                    disabled={loadingTicketId === ticket.id}
                                  >
                                    {loadingTicketId === ticket.id ? 'Unassigning...' : 'Unassign'}
                                  </button>
                                ) : (
                                  (ticket.status === 'booked' || ticket.status === 'hold') && (
                                    <button
                                      onClick={() => handleSeatEdit(ticket.id)}
                                      style={{
                                        padding: '0.25rem 0.75rem',
                                        backgroundColor: '#374151',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor:
                                          loadingTicketId === ticket.id ? 'not-allowed' : 'pointer',
                                        opacity: loadingTicketId === ticket.id ? 0.7 : 1,
                                        fontSize: '0.875rem',
                                      }}
                                      disabled={loadingTicketId === ticket.id}
                                    >
                                      {loadingTicketId === ticket.id ? 'Assigning...' : 'Assign'}
                                    </button>
                                  )
                                )}
                              </>
                            )}
                          </div>
                          {assignError && editingSeatId === ticket.id && (
                            <div style={{ color: '#ef4444', fontSize: '0.875rem' }}>
                              {assignError}
                            </div>
                          )}
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.25rem',
                              color: '#4a4a4a',
                              fontSize: '0.875rem',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <span>{ticket.ticketCode}</span>
                              <span style={{ color: '#666' }}>{ticket.ticketPriceName}</span>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <span>{ticket.attendeeName || '-'}</span>
                              <div
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '4px',
                                  fontWeight: 'bold',
                                  fontSize: '0.75rem',
                                  textTransform: 'uppercase',
                                  backgroundColor:
                                    ticket.status === 'booked'
                                      ? '#22c55e'
                                      : ticket.status === 'pending_payment'
                                        ? '#f97316'
                                        : ticket.status === 'hold'
                                          ? '#ef4444'
                                          : '#94a3b8',
                                  color: 'white',
                                  maxWidth: '80px',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {ticket.status.replace('_', ' ')}
                              </div>
                            </div>
                            {ticket.status !== 'booked' && ticket.expire_at && (
                              <div
                                style={{ fontSize: '0.75rem', color: '#666', textAlign: 'right' }}
                              >
                                {formatDistanceToNow(new Date(ticket.expire_at), {
                                  addSuffix: true,
                                  includeSeconds: true,
                                })
                                  .replace('about ', '')
                                  .replace(' minutes', 'm')
                                  .replace(' minute', 'm')
                                  .replace(' hours', 'h')
                                  .replace(' hour', 'h')
                                  .replace(' seconds', 's')
                                  .replace(' second', 's')}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              color: '#666',
            }}
          >
            Select a schedule to view tickets
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminEventClient
