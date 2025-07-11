import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cache } from 'react'
import type { Ticket, CheckinRecord } from '@/payload-types'
import { Gutter } from '@payloadcms/ui'
import { TicketDetails } from './page.client'

const queryTicketByCode = cache(
  async ({ ticketCode }: { ticketCode: string }): Promise<Ticket | null> => {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'tickets',
      limit: 1,
      pagination: false,
      where: {
        ticketCode: {
          equals: ticketCode,
        },
      },
      depth: 2,
      overrideAccess: true, // ticket is public to view
    })

    return (result?.docs?.[0] as Ticket) || null
  },
)

export async function generateMetadata({
  params,
}: {
  params: { ticketCode: string }
}): Promise<Metadata> {
  const ticket = await queryTicketByCode({ ticketCode: params.ticketCode })
  const pageTitle: string = ticket?.ticketCode ? `Ticket ${ticket.ticketCode}` : 'Ticket'
  return {
    title: pageTitle,
  }
}

export default async function TicketPage({ params: { ticketCode } }: { params: { ticketCode: string } }) {
  const ticket = await queryTicketByCode({ ticketCode })

  // Fetch checkin record to see if already checked in
  const payload = await getPayload({ config: configPromise })
  const checkinRes = await payload.find({
    collection: 'checkinRecords',
    limit: 1,
    pagination: false,
    where: {
      ticketCode: {
        equals: ticketCode.toUpperCase(),
      },
    },
  })
  const checkedInRecord = (checkinRes?.docs?.[0] as CheckinRecord | undefined) ?? null
  const isCheckedIn = Boolean(checkedInRecord)

  if (!ticket) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold">Ticket not found</h1>
      </div>
    )
  }

  return (
    <Gutter className="flex justify-center py-10">
      <TicketDetails ticket={ticket} isCheckedIn={isCheckedIn} />
    </Gutter>
  )
} 