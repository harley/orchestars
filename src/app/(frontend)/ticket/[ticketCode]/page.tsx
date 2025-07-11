import React from 'react'

import { Gutter } from '@payloadcms/ui'
// Remove RenderParams and style import for now

export default async function TicketPage({ params: { ticketCode } }: { params: { ticketCode: string } }) {
  // TODO: Fetch ticket data using ticketCode

  return (
    <Gutter>
      <h1>Ticket Details</h1>
      <p>Ticket Code: {ticketCode}</p>
      {/* TODO: Add QRCodeComponent here */}
      {/* <QRCodeComponent payload={ticketCode} /> */}
    </Gutter>
  )
} 