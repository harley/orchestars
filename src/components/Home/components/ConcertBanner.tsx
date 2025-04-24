import React, { useState, useEffect, useCallback } from 'react'
import { Calendar, MapPin } from 'lucide-react'
import { format as dateFnsFormat } from 'date-fns'
import Link from 'next/link'
import { useTranslate } from '@/providers/I18n/client'
import { EVENT_STATUS } from '@/collections/Events/constants/status'
import { Event } from '@/types/Event'
import { useIsMobile } from '@/hooks/use-mobile'

interface EventBannerProps {
  events: Event[]
}

const ConcertBanner: React.FC<EventBannerProps> = ({ events = [] }) => {
  const { t } = useTranslate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (events.length <= 1) return
    const id = setInterval(() => {
      if (!isHovering) {
        setCurrentIndex((p) => (p + 1) % events.length)
      }
    }, 6000)
    return () => clearInterval(id)
  }, [events.length, isHovering])

  const handleDotClick = (index: number) => {
    setCurrentIndex(index)
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + events.length) % events.length)
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length)
  }

  const renderBanners = useCallback(
    (evt: Event, index: number) => {
      const isUpcoming = evt.status === EVENT_STATUS.published_upcoming.value
      const isNowShowing = evt.status === EVENT_STATUS.published_open_sales.value

      const Banner = (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden md:block"
            style={{
              backgroundImage: `url(${evt?.eventBanner?.url})`,
            }}
          />

          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden"
            style={{
              backgroundImage: `url(${evt?.mobileEventBanner?.url || evt?.eventBanner?.url})`,
            }}
          />
        </>
      )

      // show on desktop
      if (!isMobile) {
        return (
          <div
            key={evt.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {Banner}
            {/* Hover overlay with animation */}
            <div
              className={`absolute inset-0 bg-black/85 flex flex-col items-start justify-end text-white transition-opacity duration-300 ${
                isHovering ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="container mx-auto px-6 pb-12 flex flex-col">
                <h3 className="text-xl font-bold mb-4">
                  {isUpcoming && t('home.upcomingEvents')}
                  {isNowShowing && t('home.nowShowingEvents')}
                </h3>
                {evt.configuration?.showBannerTitle && (
                  <h2 className="line-clamp-2 text-4xl xl:text-5xl font-bold mb-4">{evt.title}</h2>
                )}

                <div className="flex flex-col gap-2 font-medium mb-6">
                  {evt.configuration?.showBannerTime && evt.startDatetime && (
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2" />
                      <span>
                        {dateFnsFormat(new Date(evt.startDatetime), 'dd.MM.yyyy')}
                        {evt.endDatetime && (
                          <>
                            &nbsp;-&nbsp;
                            {dateFnsFormat(new Date(evt.endDatetime), 'dd.MM.yyyy')}
                          </>
                        )}
                      </span>
                    </div>
                  )}

                  {evt.configuration?.showBannerLocation && evt.eventLocation && (
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-2" />
                      <span className="">
                        {typeof evt.eventLocation === 'string'
                          ? evt.eventLocation
                          : 'Event location'}
                      </span>
                    </div>
                  )}
                </div>

                {evt.configuration?.showBannerDescription && (
                  <span className="max-w-[600px] font-medium text-lg mb-6">{evt.description}</span>
                )}

                <Link
                  href={`/events/${evt.slug}`}
                  className="inline-block w-fit px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {evt.status === EVENT_STATUS.published_open_sales.value && t('home.bookTicket')}
                  {evt.status === EVENT_STATUS.published_upcoming.value && t('home.upcomingEvents')}
                  {evt.status !== EVENT_STATUS.published_open_sales.value &&
                    evt.status !== EVENT_STATUS.published_upcoming.value &&
                    t('home.viewDetail')}
                </Link>
              </div>
            </div>
          </div>
        )
      }

      // show on mobile
      return (
        <Link
          key={evt.id}
          href={`/events/${evt.slug}`}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {Banner}
        </Link>
      )
    },
    [currentIndex, isHovering, isMobile, t],
  )

  if (!events || events.length === 0) return null

  return (
    <div
      className="relative w-full h-[200px] sm:h-[200px] md:h-[300px] lg:h-[400px] xl:h-[500px] 2xl:h-[700px] overflow-hidden"
      onMouseEnter={() => !isMobile && setIsHovering(true)}
      onMouseLeave={() => !isMobile && setIsHovering(false)}
    >
      {/* Render banners for each event with transitions and navigation controls */}
      {events?.map(renderBanners)}

      {/* Navigation buttons and dots for banner carousel */}
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

      <div className="absolute bottom-4 md:bottom-8 left-0 right-0 z-30 flex justify-center gap-2">
        {events?.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`h-2 rounded-full transition-all border border-white ${
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
