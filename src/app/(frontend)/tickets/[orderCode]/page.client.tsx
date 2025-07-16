'use client'

import { TicketDetails } from '@/app/(frontend)/ticket/[ticketCode]/page.client'
import type { Ticket } from '@/payload-types'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/pagination'
import { Navigation, Pagination } from 'swiper/modules'
import { useState, useEffect } from 'react'
import { getTicketClassColorNoCached } from '@/utilities/getTicketClassColor'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import './style.css'

export default function TicketsSwipeViewer({
  tickets,
}: {
  tickets: { ticket: Ticket; isCheckedIn: boolean; checkedInAt: string | null }[]
}) {
  const [current, setCurrent] = useState(0)
  const total = tickets.length
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768

  // Custom navigation handlers
  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1)
  }
  const handleNext = () => {
    if (current < total - 1) setCurrent(current + 1)
  }

  // Swiper ref to control slide programmatically
  const [swiperInstance, setSwiperInstance] = useState<any>(null)
  useEffect(() => {
    if (swiperInstance) {
      swiperInstance.slideTo(current)
    }
  }, [current, swiperInstance])

  const [inputValue, setInputValue] = useState('1')
  // Sync inputValue with current
  useEffect(() => {
    setInputValue((current + 1).toString())
  }, [current])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const val = e.target.value.replace(/[^0-9]/g, '')
    setInputValue(val)
  }

  // Handle input blur or Enter
  const handleInputCommit = () => {
    let num = parseInt(inputValue, 10)
    if (isNaN(num) || num < 1) num = 1
    if (num > total) num = total
    setCurrent(num - 1)
  }

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
      className="flex flex-col items-center w-full h-full py-10 min-h-screen relative"
      style={{
        backgroundColor: ticketClassColor?.color,
      }}
    >
      <div className="relative p-10 bg-white rounded-md">
        <div className="ticket-index-bar-ui flex items-center justify-center gap-2 absolute top-2 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs mx-auto p-2 rounded-lg bg-white/90 shadow-md">
          <Button
            onClick={handlePrev}
            disabled={current === 0}
            variant="ghost"
            size="icon"
            className={`nav-btn ${current === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
            aria-label="Previous ticket"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputCommit}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                (e.target as HTMLInputElement).blur()
              }
            }}
            className="ticket-index-input w-12 text-center border border-gray-300 focus:border-primary outline-none transition-all duration-200 bg-transparent text-lg font-semibold rounded focus:bg-gray-100 mx-1"
            style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
            aria-label="Go to ticket number"
            inputMode="numeric"
            pattern="[0-9]*"
          />
          <span className="text-gray-500 text-lg">/ {total}</span>
          <Button
            onClick={handleNext}
            disabled={current === total - 1}
            variant="ghost"
            size="icon"
            className={`nav-btn ${current === total - 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
            aria-label="Next ticket"
          >
            <ArrowRight className="w-6 h-6" />
          </Button>
        </div>

        <Swiper
          modules={[Pagination, Navigation]}
          pagination={{ clickable: true, type: 'progressbar' }}
          spaceBetween={24}
          slidesPerView={1}
          onSlideChange={(swiper) => setCurrent(swiper.activeIndex)}
          className="w-full max-w-md flex-1 flex items-center justify-center pt-2"
          navigation={false} // Hide default navigation
          onSwiper={setSwiperInstance}
          speed={300} // Smooth transition
        >
          {tickets.map((ticket, idx) => (
            <SwiperSlide key={Math.random().toString() + idx}>
              <TicketDetails
                ticket={ticket.ticket}
                isCheckedIn={ticket.isCheckedIn}
                checkedInAt={ticket.checkedInAt}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      {/* Custom navigation buttons */}
    </div>
  )
}
