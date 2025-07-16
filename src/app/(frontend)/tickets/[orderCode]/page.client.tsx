'use client'

import { TicketDetails } from '@/app/(frontend)/ticket/[ticketCode]/page.client'
import type { Ticket } from '@/payload-types'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/pagination'
import { Navigation, Pagination } from 'swiper/modules'
import { useState } from 'react'
import { getTicketClassColorNoCached } from '@/utilities/getTicketClassColor'

export default function TicketsSwipeViewer({
  tickets,
}: {
  tickets: { ticket: Ticket; isCheckedIn: boolean; checkedInAt: string | null }[]
}) {

  const [current, setCurrent] = useState(0)
  const total = tickets.length

  if (!tickets.length) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold">No tickets found</h1>
      </div>
    )
  }

  const ticketClassColor = getTicketClassColorNoCached(tickets[current]?.ticket?.ticketPriceInfo)

  return (
    <div
      className="flex flex-col items-center w-full h-full  py-10 min-h-screen"
      style={{
        backgroundColor: ticketClassColor?.color,
      }}
    >
      <div className="text-gray-500 mb-4 mt-4" style={{ color: ticketClassColor?.textColor }}>
        {current + 1} / {total}
      </div>
      <Swiper
        modules={[Pagination, Navigation]}
        pagination={{ clickable: true, type: 'progressbar' }}
        spaceBetween={24}
        slidesPerView={1}
        onSlideChange={(swiper) => setCurrent(swiper.activeIndex)}
        className="w-full max-w-md flex-1 flex items-center justify-center"
        style={{ minHeight: '100vh' }}
        navigation={true}
      >
        {tickets.map((ticket, idx) => (
          <SwiperSlide key={ticket.ticket.id || idx}>
            <TicketDetails
              ticket={ticket.ticket}
              isCheckedIn={ticket.isCheckedIn}
              checkedInAt={ticket.checkedInAt}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
