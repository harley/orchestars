import React, { useState, useEffect } from 'react'
import { Calendar, MapPin } from 'lucide-react'
import { format as dateFnsFormat } from 'date-fns'
import Link from 'next/link'
import { useTranslate } from '@/providers/I18n/client'

interface EventBannerProps {
  events: Record<string, any>[]
}

const ConcertBanner: React.FC<EventBannerProps> = ({ events = [] }) => {
  const { t } = useTranslate()
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % events?.length || 0)
    }, 6000)

    return () => clearInterval(interval)
  }, [events?.length])

  const handleDotClick = (index: number) => {
    setCurrentIndex(index)
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + events.length) % events.length)
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length)
  }

  return (
    <div className="relative w-full h-[170px] sm:h-[200px] md:h-[300px] lg:h-[400px] xl:h-[500px] 2xl:h-[700px] overflow-hidden">
      {events?.map((evt, index) => (
        <div
          key={evt.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="absolute inset-0  z-10" />
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${evt?.eventBanner?.url})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 to-transparent" />
          </div>

          <div className="relative z-20 h-full flex items-end">
            <div className="container mx-auto px-6 md:px-10 pb-2 md:pb-24">
              <div className="max-w-3xl">
                {evt.sponsor && (
                  <div className="inline-block px-3 py-1 mb-3 border border-white/30 rounded-full backdrop-blur text-xs text-white/90">
                    Powered by <span className="font-semibold">{evt.sponsor}</span>
                  </div>
                )}

                {evt.title && evt.configuration?.showBannerTitle && (
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-4 animate-fade-in">
                    {evt.title}
                  </h1>
                )}

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-white/90 mb-8">
                  {evt.configuration?.showBannerTime && (
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span>
                        {evt.startDatetime &&
                          dateFnsFormat(new Date(evt.startDatetime), 'dd/MM/yyyy HH:mm a')}{' '}
                        -{' '}
                        {evt.endDatetime &&
                          dateFnsFormat(new Date(evt.endDatetime), 'dd/MM/yyyy HH:mm a')}
                      </span>
                    </div>
                  )}

                  {evt.eventLocation && evt.configuration?.showBannerLocation && (
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>{evt.eventLocation}</span>
                    </div>
                  )}
                </div>

                <Link
                  href={`/events/${evt.slug}`}
                  className=" lg:py-3 lg:px-6 py-1 px-3 shadow-lg bg-slate-100/80 text-black lg:text-base text-[13px] hover:bg-slate-100/100 relative cursor-pointer rounded-lg font-medium inline-flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20"
                >
                  {t('home.viewDetail')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {events?.length > 1 && (
        <>
          {' '}
          <button
            onClick={handlePrev}
            className="absolute top-1/2 left-4 z-30 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur text-white hover:bg-white/30 transition-all"
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
            className="absolute top-1/2 right-4 z-30 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur text-white hover:bg-white/30 transition-all"
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

      <div className="absolute bottom-2 md:bottom-8 left-0 right-0 z-30 flex justify-center gap-2">
        {events?.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`md:h-2 h-1 rounded-full transition-all ${
              index === currentIndex ? 'md:w-8 w-4 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default ConcertBanner
