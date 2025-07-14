import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cache } from 'react'
import type { Ticket, CheckinRecord } from '@/payload-types'
import { Gutter } from '@payloadcms/ui'
import { TicketDetails } from './page.client'
import { categories } from '@/components/EventDetail/data/seat-maps/categories'

// Utility function to get ticket class color
const getTicketClassColor = (ticketPriceInfo: any) => {
  if (!ticketPriceInfo || typeof ticketPriceInfo !== 'object') {
    return { color: '#6B7280', textColor: '#fff' }
  }

  const ticketKey = ticketPriceInfo.key
  const category = categories.find((cat) => cat.id === ticketKey)

  return category
    ? { color: category.color, textColor: category.textColor }
    : { color: '#6B7280', textColor: '#fff' }
}

function isTicket(data: unknown): data is Ticket {
  return (
    typeof data === 'object' &&
    data !== null &&
    'ticketCode' in data &&
    typeof (data as Ticket).ticketCode === 'string'
  )
}

// Type guard to validate CheckinRecord objects
function isCheckinRecord(data: unknown): data is CheckinRecord {
  return (
    typeof data === 'object' &&
    data !== null &&
    'ticketCode' in data &&
    typeof (data as CheckinRecord).ticketCode === 'string'
  )
}

const getTicketAndCheckinStatus = cache(
  async ({
    ticketCode,
  }: {
    ticketCode: string
  }): Promise<{
    ticket: Ticket | null
    isCheckedIn: boolean
    checkedInAt: string | null
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

    const ticketDoc = ticketResult?.docs?.[0]
    const ticket = isTicket(ticketDoc) ? ticketDoc : null


    if (!ticket) {
      return { ticket: null, isCheckedIn: false, checkedInAt: null }
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

    const potentialRecord = checkinRes?.docs?.[0]
    const checkinRecord = isCheckinRecord(potentialRecord) ? potentialRecord : null
    const checkedInAt = checkinRecord?.checkInTime ?? checkinRecord?.createdAt ?? null

    const isCheckedIn = Boolean(checkinRecord)

    return { ticket, isCheckedIn, checkedInAt }
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
  const { ticket, isCheckedIn, checkedInAt } = await getTicketAndCheckinStatus({ ticketCode })

  if (!ticket) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold">Ticket not found</h1>
      </div>
    )
  }

  const ticketClassColor = getTicketClassColor(ticket.ticketPriceInfo)

  return (
    <div
      style={{ background: ticketClassColor ? ticketClassColor.color : undefined }}
      className="-mt-[72px]"
    >
      <Gutter className="flex justify-center py-10">
        <TicketDetails ticket={ticket} isCheckedIn={isCheckedIn} checkedInAt={checkedInAt} />
      </Gutter>
    </div>
  )
} 