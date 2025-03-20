import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import PageClient from './page.client'
import EventBanner from '@/components/EventDetail/EventBanner'
import Schedule from '@/components/EventDetail/Schedule'
import TermCondition from '@/components/EventDetail/TermCondition'
import SeatReservationClient from '@/components/EventDetail/SeatReservation/Component.client'
import FeaturedPerformers from '@/components/EventDetail/FeaturedPerformers/Component'
import FAQ from '@/components/EventDetail/FAQ/Component'
import DetailDescriptionClient from '@/components/EventDetail/DetailDescription/Component.client'
import { fetchEvent } from './actions'
import UpcomingSaleBanner from '@/components/EventDetail/UpcomingSale'
import { EVENT_STATUS } from '@/collections/Events/constants/status'

// export const dynamic = 'force-dynamic'
export const revalidate = 60
export const dynamicParams = true

const EventDetailPage = async (props: {
  params: Promise<{ eventId: string }>
  searchParams: Promise<{ eventScheduleId: string }>
}) => {
  const params = await props.params
  const searchParams = await props.searchParams

  const eventSlug = params.eventId

  const eventDetail = await fetchEvent({ slug: eventSlug })

  if (!eventDetail) {
    return notFound()
  }

  const isUpcoming = eventDetail.status === EVENT_STATUS.published_upcoming.value
  const isOpenForSales = eventDetail.status === EVENT_STATUS.published_open_sales.value

  let unavailableSeats: string[] = []
  if (searchParams.eventScheduleId && !isUpcoming) {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    unavailableSeats = await payload
      .find({
        collection: 'tickets',
        where: {
          status: { in: ['booked', 'pending_payment', 'hold'] },
          event: { equals: eventDetail.id },
          eventScheduleId: { equals: searchParams.eventScheduleId },
        },
        select: { seat: true },
        limit: 1000,
      })
      .then((res) => res.docs.map((tk) => tk.seat as string).filter((exist) => !!exist))
      .catch(() => [])
  }

  return (
    <div className="">
      <PageClient />
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">
          <EventBanner event={eventDetail} />
          {isUpcoming && <UpcomingSaleBanner />}


          <DetailDescriptionClient event={eventDetail} />
          {isOpenForSales && (
            <SeatReservationClient
              event={eventDetail}
              unavailableSeats={unavailableSeats as string[]}
            />
          )}

          <FeaturedPerformers />
          {!isUpcoming && (
            <>
              {!!eventDetail.schedules?.length && <Schedule schedules={eventDetail.schedules} />}
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
