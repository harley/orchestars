'use client'

import React from 'react'

import { Event } from '@/payload-types'
// import TicketClassSelection from './TicketClassSelection'
import SeatMapSelection from './SeatMapSelection'

const SeatReservationClient = ({
  event,
  unavailableSeats,
}: {
  event: Event
  unavailableSeats?: string[]
}) => {
  return (
    <>
      {/* <TicketClassSelection event={event} unavailableSeats={unavailableSeats} /> */}
      <SeatMapSelection event={event} unavailableSeats={unavailableSeats} />
    </>
  )
}

export default SeatReservationClient
