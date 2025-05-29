import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import PageClient from './page.client'
import { EVENT_STATUS } from '@/collections/Events/constants/status'
import { checkBookedOrPendingPaymentSeats } from '@/app/(payload)/api/bank-transfer/order/utils'
import { getSeatHoldings } from '@/app/(payload)/api/seat-holding/seat/utils'
import { cookies } from 'next/headers'
import { getLocale } from '@/providers/I18n/server'
import { getEventCached } from '../../actions'
import SelectTicket from '@/components/EventDetail/SeatReservation/SeatMapSelection/SelectTicket'
import UpcomingSaleBanner from '@/components/EventDetail/UpcomingSale'

// export const dynamic = 'force-dynamic'
export const revalidate = 86400 // 24 hours
export const dynamicParams = true

const EventDetailSelectTicketPage = async (props: {
  params: Promise<{ eventId: string; eventScheduleId: string }>
}) => {
  const params = await props.params

  const eventSlug = params.eventId
  const eventScheduleId = params.eventScheduleId

  const locale = await getLocale()

  const [eventDetail] = await Promise.all([getEventCached({ slug: eventSlug, locale })()])

  if (!eventDetail) {
    return notFound()
  }

  const isValidEventScheduleId = eventDetail.schedules?.find?.(
    (sche) => sche?.id === eventScheduleId,
  )

  if (!isValidEventScheduleId) {
    return notFound()
  }

  const isUpcoming = eventDetail.status === EVENT_STATUS.published_upcoming.value
  const isOpenForSales = eventDetail.status === EVENT_STATUS.published_open_sales.value

  let unavailableSeats: string[] = []
  if (!isUpcoming) {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    unavailableSeats = await checkBookedOrPendingPaymentSeats({
      eventId: eventDetail.id,
      eventScheduleId,
      payload,
    }).then((seats) => seats.map((s) => s.seatName))

    const cookieStore = await cookies()
    const seatHoldingCode = cookieStore.get('seatHoldingCode')?.value

    const seatHoldings = await getSeatHoldings({
      eventId: eventDetail.id,
      eventScheduleId,
      payload,
      notEqualSeatHoldingCode: seatHoldingCode,
    })

    unavailableSeats = [...unavailableSeats, ...seatHoldings]
  }

  return (
    <div className="bg-white">
      <PageClient />
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow pt-2 md:pt-6">
          {/* Ticket Section */}
          {isUpcoming && <UpcomingSaleBanner />}
          {isOpenForSales && (
            <SelectTicket
              event={eventDetail}
              unavailableSeats={unavailableSeats as string[]}
              eventScheduleId={eventScheduleId}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default EventDetailSelectTicketPage
