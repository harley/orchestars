import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cache } from 'react'
import type { Ticket } from '@/payload-types'
import { Gutter } from '@payloadcms/ui'
import { TicketDetails } from './page.client'

const getTicketAndCheckinStatus = cache(
  async ({
    ticketCode,
  }: {
    ticketCode: string
  }): Promise<{
    ticket: Ticket | null
    isCheckedIn: boolean
  }> => {
    const payload = await getPayload({ config: configPromise })

    const ticketResult = await payload.find({
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

    const ticket = (ticketResult?.docs?.[0] as Ticket) || null

    if (!ticket) {
      return { ticket: null, isCheckedIn: false }
    }

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
    const isCheckedIn = Boolean(checkinRes?.docs?.[0])

    return { ticket, isCheckedIn }
  },
)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ticketCode: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const { ticket } = await getTicketAndCheckinStatus({ ticketCode: resolvedParams.ticketCode })
  const pageTitle: string = ticket?.ticketCode ? `Ticket ${ticket.ticketCode}` : 'Ticket'
  return {
    title: pageTitle,
  }
}

export default async function TicketPage({
  params,
}: {
  params: Promise<{ ticketCode: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params
  const { ticketCode } = resolvedParams
  const { ticket, isCheckedIn } = await getTicketAndCheckinStatus({ ticketCode })

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