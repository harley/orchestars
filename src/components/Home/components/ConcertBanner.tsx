import React, { useState, useEffect } from 'react'
import { Calendar, MapPin } from 'lucide-react'
import { format as dateFnsFormat } from 'date-fns'
import Link from 'next/link'
import { useTranslate } from '@/providers/I18n/client'
import { EVENT_STATUS } from '@/collections/Events/constants/status'

interface EventBannerProps {
  events: Record<string, any>[]
}

const ConcertBanner: React.FC<EventBannerProps> = ({ events = [] }) => {
  const { t } = useTranslate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovering) {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % events?.length || 0)
      }
    }, 6000)

    return () => clearInterval(interval)
  }, [events?.length, isHovering])

  const handleDotClick = (index: number) => {
    setCurrentIndex(index)
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + events.length) % events.length)
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length)
  }

  if (!events || events.length === 0) return null

  return (
    <div
      className="relative w-full h-[200px] sm:h-[200px] md:h-[300px] lg:h-[400px] xl:h-[500px] 2xl:h-[700px] overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {events?.map((evt, index) => (
        <div
          key={evt.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${evt?.eventBanner?.url})` }}
          >
            {/* Hover overlay with animation */}
            <div
              className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-center transition-opacity duration-300 ${
                isHovering ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 md:mb-4 px-4">
                {evt.title}
              </h2>

              <div className="hidden md:flex flex-col items-center gap-2 mb-4 md:mb-6 text-sm md:text-base">
                {evt.startDatetime && (
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2" />
                    <span>
                      {dateFnsFormat(new Date(evt.startDatetime), 'dd.MM.yyyy')}&nbsp;-&nbsp;
                      {dateFnsFormat(new Date(evt.startDatetime), 'dd.MM.yyyy')}
                    </span>
                  </div>
                )}

                {evt.eventLocation && (
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-2" />
                    <span className="">
                      {typeof evt.eventLocation === 'string' ? evt.eventLocation : 'Event location'}
                    </span>
                  </div>
                )}
              </div>

              <span className="hidden md:block max-w-[600px] font-medium text-lg mb-4 md:mb-6">
                {evt.description}
              </span>

              <Link
                href={`/events/${evt.slug}`}
                className="inline-block px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                {evt.status === EVENT_STATUS.published_open_sales.value && t('home.bookTicket')}
                {evt.status === EVENT_STATUS.published_upcoming.value && t('home.upcomingEvents')}
              </Link>
            </div>
          </div>
        </div>
      ))}
      {events?.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute top-1/2 left-4 z-30 -translate-y-1/2 p-2 rounded-full border border-white/80 bg-black/20 backdrop-blur text-white hover:bg-black/30 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute top-1/2 right-4 z-30 -translate-y-1/2 p-2 rounded-full border border-white/80 bg-black/20 backdrop-blur text-white hover:bg-black/30 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}
      <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-2">
        {events?.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? 'w-8 bg-black/50' : 'w-2 bg-black/50 hover:bg-black/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default ConcertBanner
