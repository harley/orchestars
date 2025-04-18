import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import PageClient from './page.client'
import EventBanner from '@/components/EventDetail/EventBanner'
// import Schedule from '@/components/EventDetail/Schedule'
import TermCondition from '@/components/EventDetail/TermCondition'
import SeatReservationClient from '@/components/EventDetail/SeatReservation/Component.client'
import FeaturedPerformers from '@/components/EventDetail/FeaturedPerformers/Component'
import FAQ from '@/components/EventDetail/FAQ/Component'
import DetailDescriptionClient from '@/components/EventDetail/DetailDescription/Component.client'
import { getEventCached } from './actions'
import UpcomingSaleBanner from '@/components/EventDetail/UpcomingSale'
import { EVENT_STATUS } from '@/collections/Events/constants/status'
import { checkBookedOrPendingPaymentSeats } from '@/app/(payload)/api/bank-transfer/order/utils'
import { getSeatHoldings } from '@/app/(payload)/api/seat-holding/seat/utils'
import { cookies } from 'next/headers'
import { getLocale } from '@/providers/I18n/server'

// export const dynamic = 'force-dynamic'
export const revalidate = 86400 // 24 hours
export const dynamicParams = true

const EventDetailPage = async (props: {
  params: Promise<{ eventId: string }>
  searchParams: Promise<{ eventScheduleId: string }>
}) => {
  const params = await props.params
  const searchParams = await props.searchParams

  const eventSlug = params.eventId

  const locale = await getLocale()

  const eventDetail = await getEventCached({ slug: eventSlug, locale })()

  if (!eventDetail) {
    return notFound()
  }

  const isUpcoming = eventDetail.status === EVENT_STATUS.published_upcoming.value
  const isOpenForSales = eventDetail.status === EVENT_STATUS.published_open_sales.value

  let unavailableSeats: string[] = []
  if (searchParams.eventScheduleId && !isUpcoming) {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    unavailableSeats = await checkBookedOrPendingPaymentSeats({
      eventId: eventDetail.id,
      eventScheduleId: searchParams.eventScheduleId,
      payload,
    }).then((seats) => seats.map((s) => s.seatName))

    const cookieStore = await cookies()
    const seatHoldingCode = cookieStore.get('seatHoldingCode')?.value

    const seatHoldings = await getSeatHoldings({
      eventId: eventDetail.id,
      eventScheduleId: searchParams.eventScheduleId,
      payload,
      notEqualSeatHoldingCode: seatHoldingCode,
    })

    unavailableSeats = [...unavailableSeats, ...seatHoldings]
  }

  return (
    <div className="">
      <PageClient />
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow pt-6">
          <EventBanner event={eventDetail} />
          {isUpcoming && <UpcomingSaleBanner />}

          {isOpenForSales && (
            <SeatReservationClient
              event={eventDetail}
              unavailableSeats={unavailableSeats as string[]}
            />
          )}
          <DetailDescriptionClient event={eventDetail} />
          <FeaturedPerformers eventSlug={eventSlug} />
          {!isUpcoming && (
            <>
              {/* {!!esventDetail.schedules?.length && <Schedule schedules={eventDetail.schedules} />} */}
              {eventDetail.eventTermsAndConditions && (
                <TermCondition termCondition={eventDetail.eventTermsAndConditions} />
              )}
              <FAQ />
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default EventDetailPage
