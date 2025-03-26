'use client'

import React from 'react'
import Link from 'next/link'

interface Event {
  id: string
  title: string
  description: string
  startDatetime: string
  endDatetime: string
  eventLocation: string
  schedules?: Array<{
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

interface Props {
  event: Event
}

const AdminEventClient: React.FC<Props> = ({ event }) => {
  // Since we're in the admin route group, authentication is handled by Payload
  // If user is not authenticated, they will be redirected to login automatically
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>{event.title}</h1>
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
            {event.schedules.map((schedule, index) => (
              <div key={index} style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                <h3 style={{ fontWeight: 'bold' }}>
                  {new Date(schedule.date).toLocaleDateString()}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
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
  )
}

export default AdminEventClient
