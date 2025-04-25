'use client'

import React, { useState, useRef, useEffect } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import {
  getTicketsForSchedule,
  assignSeatToTicket,
  getBookedTicketsCounts,
  getSeatHoldings,
} from '../actions'
import { useRouter, useSearchParams } from 'next/navigation'
import { categories } from '@/components/EventDetail/data/seat-maps/categories'
import { formatMoney } from '@/utilities/formatMoney'
import seats from '@/components/EventDetail/data/seat-maps/seats.json'
import type { SeatHolding } from '@/payload-types'
import type { Event, Ticket, TicketPrice } from '../types'

interface Props {
  event: Event
}

const SeatAssignment: React.FC<Props> = ({ event }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    searchParams?.get('scheduleId') ?? null,
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
  const [seatHoldings, setSeatHoldings] = useState<SeatHolding[]>([])

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

  useEffect(() => {
    const loadSeatHoldings = async () => {
      if (selectedScheduleId) {
        try {
          const holdings = await getSeatHoldings(event.id, selectedScheduleId)
          setSeatHoldings(holdings)
        } catch (error) {
          console.error('Error loading seat holdings:', error)
        }
      }
    }
    loadSeatHoldings()
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

      // Get held seats
      const heldSeats = seatHoldings.flatMap(
        (holding) => holding.seatName?.split(',').map((s) => s.trim()) || [],
      )

      // Check if seat is held
      const isHeld = heldSeats.includes(trimmedSeat)

      if ((existingTicket || isHeld) && trimmedSeat) {
        setAssignError(isHeld ? 'Seat is currently reserved' : 'Seat is already taken')
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
          color: 'inherit',
          fontSize: '0.75rem',
          fontFamily: 'monospace',
          opacity: bookedCountsLoading ? 0.5 : 1,
        }}
      >
        {counts.join('|')}/{ticket.quantity}
      </div>
    )
  }

  const getTotalCapacity = () => {
    return event.ticketPrices?.reduce((sum, tp) => sum + (tp.quantity || 0), 0) || 0
  }

  const getBookedCountForSchedule = (scheduleId: string) => {
    return Object.values(bookedCounts).reduce((sum, counts) => sum + (counts[scheduleId] || 0), 0)
  }

  const getSeatsForRow = (row: string, tickets: Ticket[]) => {
    // Get all seats for this row from seats.json
    const rowSeats = seats
      .filter((seat) => seat.label.startsWith(row))
      .sort((a, b) => {
        const aNum = parseInt(a.label.replace(row, ''))
        const bNum = parseInt(b.label.replace(row, ''))
        return aNum - bNum
      })

    // Get taken seats in this row
    const takenSeats = tickets.filter((t) => t.seat?.startsWith(row)).map((t) => t.seat)

    // Get held seats in this row
    const heldSeats = seatHoldings
      .flatMap((holding) => holding.seatName?.split(',').map((s) => s.trim()) || [])
      .filter((seat) => seat.startsWith(row))

    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.25rem',
          marginTop: '0.5rem',
          fontSize: '0.75rem',
          fontFamily: 'monospace',
        }}
      >
        {rowSeats.map((seat) => {
          const isTaken = takenSeats.includes(seat.label)
          const isHeld = heldSeats.includes(seat.label)
          const ticketPrice = event.ticketPrices?.find((tp) => tp.key === seat.category)
          const color = categories.find((c) => c.id === seat.category)?.color

          return (
            <span
              key={seat.id}
              style={{
                padding: '0.125rem 0.25rem',
                borderRadius: '2px',
                backgroundColor: isTaken ? '#e5e7eb' : isHeld ? '#fef3c7' : color + '20',
                color: isTaken ? '#9ca3af' : isHeld ? '#92400e' : color,
                border: `1px solid ${isTaken ? '#d1d5db' : isHeld ? '#f59e0b' : color + '40'}`,
                cursor: 'default',
                fontSize: '0.75rem',
              }}
              title={
                isTaken
                  ? `${seat.label} - ${ticketPrice?.name || seat.category} (Taken)`
                  : isHeld
                    ? `${seat.label} - ${ticketPrice?.name || seat.category} (Reserved)`
                    : `${seat.label} - ${ticketPrice?.name || seat.category} (Available)`
              }
            >
              {seat.label}
            </span>
          )
        })}
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
          padding: '1rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            {event.title}
          </h1>
          <div className="space-y-4">
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Dates</h2>
              <p>Start: {new Date(event.startDatetime).toLocaleString()}</p>
              <p>End: {new Date(event.endDatetime).toLocaleString()}</p>
            </div>

            {event.schedules && event.schedules.length > 0 && (
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0' }}>
                  Schedules
                </h2>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.25rem',
                    marginBottom: '1rem',
                  }}
                >
                  {event.schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      style={{
                        padding: '0.5rem',
                        border: '1px solid #374151',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        backgroundColor: selectedScheduleId === schedule.id ? '#374151' : 'white',
                        color: selectedScheduleId === schedule.id ? 'white' : '#1a1a1a',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                      }}
                      onClick={() => handleScheduleClick(schedule.id)}
                    >
                      <h3
                        style={{
                          fontWeight: 'bold',
                          fontSize: '0.875rem',
                          marginBottom: '0',
                          color: selectedScheduleId === schedule.id ? 'white' : '#1a1a1a',
                        }}
                      >
                        {format(new Date(schedule.date), 'dd/MM')}
                      </h3>
                      <p
                        style={{
                          color: selectedScheduleId === schedule.id ? '#d1d5db' : '#666666',
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                        }}
                      >
                        {getBookedCountForSchedule(schedule.id)}/{getTotalCapacity()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {event.ticketPrices && event.ticketPrices.length > 0 && (
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0' }}>
                  Ticket Prices
                </h2>
                <div
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.25rem' }}
                >
                  {event.ticketPrices.map((ticket, index) => (
                    <div
                      key={index}
                      onClick={() => handleTicketPriceClick(ticket.name)}
                      style={{
                        padding: '0.25rem',
                        border: '1px solid #374151',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        backgroundColor: selectedTicketPrice === ticket.name ? '#374151' : 'white',
                        color: selectedTicketPrice === ticket.name ? 'white' : '#1a1a1a',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: '0.75rem',
                          right: '0.75rem',
                          width: '0.75rem',
                          height: '0.75rem',
                          borderRadius: '50%',
                          backgroundColor: categories.find((c) => c.id === ticket.key)?.color,
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <h3
                        style={{
                          fontWeight: 'bold',
                          color: selectedTicketPrice === ticket.name ? 'white' : '#1a1a1a',
                          fontSize: '0.875rem',
                          marginBottom: '0.25rem',
                          paddingRight: '1.25rem',
                        }}
                      >
                        {ticket.name}
                      </h3>
                      <p
                        style={{
                          whiteSpace: 'nowrap',
                          color: selectedTicketPrice === ticket.name ? 'white' : '#4a4a4a',
                          fontSize: '0.875rem',
                          marginBottom: '0.25rem',
                        }}
                      >
                        {formatMoney(ticket.price, ticket.currency)}
                      </p>
                      <p
                        style={{
                          color: selectedTicketPrice === ticket.name ? '#d1d5db' : '#666666',
                          fontSize: '0.75rem',
                        }}
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

        {/* Legend */}
        <div
          style={{
            borderTop: '1px solid #ddd',
            paddingTop: '1rem',
            marginTop: '1rem',
          }}
        >
          <h3
            style={{
              fontSize: '0.875rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              color: '#666',
            }}
          >
            Seat Status
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  padding: '0.125rem 0.25rem',
                  borderRadius: '2px',
                  backgroundColor: '#e5e7eb',
                  color: '#9ca3af',
                  border: '1px solid #d1d5db',
                  fontSize: '0.75rem',
                }}
              >
                A1
              </span>
              <span style={{ fontSize: '0.75rem', color: '#666' }}>Taken</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  padding: '0.125rem 0.25rem',
                  borderRadius: '2px',
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  border: '1px solid #f59e0b',
                  fontSize: '0.75rem',
                }}
              >
                A1
              </span>
              <span style={{ fontSize: '0.75rem', color: '#666' }}>Reserved</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  padding: '0.125rem 0.25rem',
                  borderRadius: '2px',
                  backgroundColor: '#fff',
                  color: '#1a1a1a',
                  border: '1px solid #374151',
                  fontSize: '0.75rem',
                }}
              >
                A1
              </span>
              <span style={{ fontSize: '0.75rem', color: '#666' }}>Available</span>
            </div>
          </div>
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
                    {row !== 'cancelled' && row !== '-' && getSeatsForRow(row, rowTickets)}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '0.5rem',
                        marginTop: row !== 'cancelled' && row !== '-' ? '0.5rem' : 0,
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
                            gap: '0.25rem',
                          }}
                        >
                          {editingSeatId === ticket.id ? (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <input
                                ref={inputRef}
                                type="text"
                                value={newSeatValue}
                                onChange={(e) => setNewSeatValue(e.target.value)}
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
                                  padding: '0.25rem 0.5rem',
                                  border: '1px solid #ddd',
                                  borderRadius: '4px',
                                  width: '100%',
                                }}
                                placeholder="Enter seat..."
                              />
                              <button
                                onClick={() => handleSeatSubmit(ticket.id)}
                                disabled={loadingTicketId === ticket.id}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  backgroundColor: '#4a90e2',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                }}
                              >
                                {loadingTicketId === ticket.id ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingSeatId(null)
                                  setNewSeatValue('')
                                  setAssignError(null)
                                }}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  backgroundColor: '#e2e8f0',
                                  color: '#1a1a1a',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                              }}
                            >
                              <div
                                style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
                              >
                                <div
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                  <span style={{ fontWeight: 'bold' }}>{ticket.seat || '-'}</span>
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
                                <div style={{ fontSize: '0.875rem', color: '#4a4a4a' }}>
                                  <div>{ticket.attendeeName || '-'}</div>
                                  <div style={{ color: '#666', fontSize: '0.8125rem' }}>
                                    {ticket.userEmail || '-'}
                                  </div>
                                </div>
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'flex-end',
                                  gap: '0.25rem',
                                }}
                              >
                                <button
                                  onClick={() => handleSeatEdit(ticket.id)}
                                  style={{
                                    padding: '0.25rem 0.5rem',
                                    backgroundColor: '#f3f4f6',
                                    color: '#1a1a1a',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  {ticket.seat ? 'Change' : 'Assign'}
                                </button>
                                <div style={{ fontSize: '0.75rem', color: '#666' }}>
                                  {ticket.ticketPriceName}
                                </div>
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
                                  }}
                                >
                                  {ticket.status.replace('_', ' ')}
                                </div>
                              </div>
                            </div>
                          )}
                          {assignError && editingSeatId === ticket.id && (
                            <div
                              style={{
                                color: '#ef4444',
                                fontSize: '0.875rem',
                                marginTop: '0.25rem',
                              }}
                            >
                              {assignError}
                            </div>
                          )}
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

export default SeatAssignment
