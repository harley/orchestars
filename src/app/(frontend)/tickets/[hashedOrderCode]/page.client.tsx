'use client'

import { TicketDetails } from '@/app/(frontend)/ticket/[ticketCode]/page.client'
import type { Ticket } from '@/payload-types'
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react'
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

  // Custom navigation handlers
  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1)
  }
  const handleNext = () => {
    if (current < total - 1) setCurrent(current + 1)
  }

  // Swiper ref to control slide programmatically
  const [swiperInstance, setSwiperInstance] = useState<SwiperClass | null>(null)
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
      className="flex flex-col items-center w-full h-full py-6 sm:py-10 min-h-screen relative"
      style={{
        backgroundColor: ticketClassColor?.color,
      }}
    >
      {/* Parent container for index bar and card */}
      <div className="w-full max-w-md mx-auto bg-white rounded-b-md shadow-md py-4">
        <div className="ticket-index-bar-ui flex items-center justify-center gap-2 w-full p-1 sm:p-2 rounded-t-lg bg-white text-base sm:text-lg z-10">
          <Button
            onClick={handlePrev}
            disabled={current === 0}
            variant="ghost"
            size="icon"
            className={`nav-btn ${current === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
            aria-label="Previous ticket"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputCommit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                ;(e.target as HTMLInputElement).blur()
              }
            }}
            className="ticket-index-input w-10 sm:w-12 text-center border border-gray-300 focus:border-primary outline-none transition-all duration-200 bg-transparent text-base sm:text-lg font-semibold rounded focus:bg-gray-100 mx-1"
            style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
            aria-label="Go to ticket number"
            inputMode="numeric"
            pattern="[0-9]*"
          />
          <span className="text-gray-500 text-base sm:text-lg">/ {total}</span>
          <Button
            onClick={handleNext}
            disabled={current === total - 1}
            variant="ghost"
            size="icon"
            className={`nav-btn ${current === total - 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
            aria-label="Next ticket"
          >
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
        </div>

        {/* Main card container */}
        <div className="relative w-full sm:pt-6 sm:px-8 pt-3 px-3 pb-3 bg-white rounded-b-md">
          <Swiper
            modules={[Pagination, Navigation]}
            pagination={{ clickable: true, type: 'progressbar' }}
            spaceBetween={16}
            slidesPerView={1}
            onSlideChange={(swiper) => setCurrent(swiper.activeIndex)}
            className="w-full flex-1 flex items-center justify-center pt-2"
            navigation={false} // Hide default navigation
            onSwiper={setSwiperInstance}
            speed={300} // Smooth transition
          >
            {tickets.map((ticket, idx) => (
              <SwiperSlide key={ticket.ticket.id + idx} className="w-full flex justify-center">
                <TicketDetails
                  ticket={ticket.ticket}
                  isCheckedIn={ticket.isCheckedIn}
                  checkedInAt={ticket.checkedInAt}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
      {/* Custom navigation buttons */}
    </div>
  )
}
