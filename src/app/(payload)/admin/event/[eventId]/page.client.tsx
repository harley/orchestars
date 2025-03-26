'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { getTicketsForSchedule } from './actions'

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
  ticketPrices?: Array<{
    name: string
    key: 'zone1' | 'zone2' | 'zone3' | 'zone4' | 'zone5'
    price: number
    currency: string
    quantity: number
  }>
}

interface Ticket {
  id: number
  attendeeName: string
  userEmail: string
  ticketCode: string
  seat: string
  ticketPriceName: string
  status: 'booked' | 'pending_payment' | 'hold' | 'cancelled'
}

interface Props {
  event: Event
}

const sortSeats = (a: Ticket, b: Ticket) => {
  if (!a.seat || !b.seat) return 0
  const aRow = a.seat.match(/[A-Z]+/)?.[0] || ''
  const bRow = b.seat.match(/[A-Z]+/)?.[0] || ''
  const aNum = parseInt(a.seat.match(/\d+/)?.[0] || '0')
  const bNum = parseInt(b.seat.match(/\d+/)?.[0] || '0')

  if (aRow === bRow) {
    return aNum - bNum
  }
  return aRow.localeCompare(bRow)
}

const AdminEventClient: React.FC<Props> = ({ event }) => {
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)

  const handleScheduleClick = async (scheduleId: string) => {
    setSelectedScheduleId(scheduleId)
    setLoading(true)
    try {
      const ticketDocs = await getTicketsForSchedule(event.id, scheduleId)
      setTickets(ticketDocs as unknown as Ticket[])
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setLoading(false)
    }
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
                    backgroundColor: selectedScheduleId === schedule.id ? '#f0f0f0' : 'transparent',
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
                      <p style={{ color: 'gray' }}>{detail.description}</p>
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
                    style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <h3 style={{ fontWeight: 'bold' }}>{ticket.name}</h3>
                    <p>
                      {ticket.price.toLocaleString()} {ticket.currency}
                    </p>
                    <p>Available: {ticket.quantity}</p>
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Tickets for{' '}
              {format(
                new Date(event.schedules?.find((s) => s.id === selectedScheduleId)?.date || ''),
                'dd/MM/yyyy',
              )}
            </h2>
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
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '0.5rem',
                }}
              >
                {tickets.sort(sortSeats).map((ticket) => (
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
                    <div
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#1a1a1a',
                        borderBottom: '1px solid #ddd',
                        paddingBottom: '0.25rem',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Seat {ticket.seat}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                        color: '#4a4a4a',
                        fontSize: '0.875rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 'bold' }}>Type:</span>
                        <span>{ticket.ticketPriceName}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 'bold' }}>Code:</span>
                        <span>{ticket.ticketCode}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 'bold' }}>Attendee:</span>
                        <span>{ticket.attendeeName || '-'}</span>
                      </div>
                      <div
                        style={{
                          marginTop: '0.25rem',
                          padding: '0.25rem',
                          borderRadius: '4px',
                          textAlign: 'center',
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
