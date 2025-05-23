import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import PageClient from './page.client'
import EventBanner from '@/components/EventDetail/EventBanner'
import TermCondition from '@/components/EventDetail/TermCondition'
import FeaturedPerformers from '@/components/EventDetail/FeaturedPerformers/Component'
import FAQ from '@/components/EventDetail/FAQ/Component'
import { getEventCached } from './actions'
import UpcomingSaleBanner from '@/components/EventDetail/UpcomingSale'
import { EVENT_STATUS } from '@/collections/Events/constants/status'
import { checkBookedOrPendingPaymentSeats } from '@/app/(payload)/api/bank-transfer/order/utils'
import { getSeatHoldings } from '@/app/(payload)/api/seat-holding/seat/utils'
import { cookies } from 'next/headers'
import { getLocale } from '@/providers/I18n/server'
import About from '@/components/EventDetail/About'
import Partners from '@/components/Home/components/Partners'
import { getPartnersCached } from '@/components/Home/actions'
import { Partner } from '@/types/Partner'
import SeatReservationClient from '@/components/EventDetail/SeatReservation/Component.client'

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

  const [eventDetail, partnerData] = await Promise.all([
    getEventCached({ slug: eventSlug, locale })(),
    getPartnersCached({ locale })(),
  ])

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
    <div className="bg-white">
      <PageClient />
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow pt-2 md:pt-6">
          <EventBanner event={eventDetail} />

          {/* About Section */}
          <About eventDetail={eventDetail} />

          {/* Ticket Section */}
          {isUpcoming && <UpcomingSaleBanner />}

          {isOpenForSales && (
            <SeatReservationClient
              event={eventDetail}
              unavailableSeats={unavailableSeats as string[]}
            />
          )}

          <FeaturedPerformers eventSlug={eventSlug} />
          {!isUpcoming && (
            <>
              {/* {!!eventDetail.schedules?.length && <Schedule schedules={eventDetail.schedules} />} */}
              {eventDetail.eventTermsAndConditions && (
                <TermCondition termCondition={eventDetail.eventTermsAndConditions} />
              )}
              <FAQ />
            </>
          )}

          <Partners partners={partnerData as Partner[]} />
        </main>
      </div>
    </div>
  )
}

export default EventDetailPage
