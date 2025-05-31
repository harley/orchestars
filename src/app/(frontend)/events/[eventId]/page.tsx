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
import { Metadata, ResolvingMetadata } from 'next'
import { Media } from '@/payload-types'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getServerSideURL } from '@/utilities/getURL'

// export const dynamic = 'force-dynamic'
export const revalidate = 86400 // 24 hours
export const dynamicParams = true

function encodeImagePath(path: string): string {
  const segments = path.split('/');
  const encodedSegments = segments.map((segment, index) => {
    // Encode only the last part (the filename)
    return index === segments.length - 1 ? encodeURIComponent(segment) : segment;
  });
  return encodedSegments.join('/');
}


export async function generateMetadata(
  props: {
    params: Promise<{ eventId: string }>
  },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const params = await props.params
  const eventSlug = params.eventId
  const locale = await getLocale()

  const eventDetail = await getEventCached({ slug: eventSlug, locale })()

  if (!eventDetail) {
    return {
      title: 'Event Not Found | Orchestars',
      description: 'Sorry, the event you are looking for does not exist.',
    }
  }

  const previousImages = (await parent).openGraph?.images || []

  let imageUrl =
    (eventDetail.eventBanner as Media)?.sizes?.og?.url || (eventDetail.eventBanner as Media)?.url || ''

  if (imageUrl) {
    const encodedPath = encodeImagePath(imageUrl);
    imageUrl = `${getServerSideURL()}${encodedPath}`
  }

  const images = []
  if (imageUrl) {
    images.push({ url: imageUrl })
  } else {
    images.push(...previousImages)
  }

  const openGraph = mergeOpenGraph({
    title: eventDetail.title || undefined,
    description: eventDetail.description || undefined,
    images,
  })

  const metadata: Metadata = {
    title: openGraph?.title,
    description: openGraph?.description,
    openGraph,
    twitter: {
      card: 'summary_large_image',
      title: openGraph?.title,
      description: openGraph?.description,
      images: imageUrl ? [imageUrl] : [],
    },
  }

  return metadata
}

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
