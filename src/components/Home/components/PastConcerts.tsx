import React, { useRef, useEffect } from 'react'
import { Calendar, MapPin } from 'lucide-react'
import { Event } from '@/types/Event'
import { format as dateFnsFormat } from 'date-fns'
import { useTranslate } from '@/providers/I18n/client'
interface PastConcertsProps {
  events: Event[]
}

const PastConcerts: React.FC<PastConcertsProps> = ({ events }) => {
  const { t } = useTranslate()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const rect = scrollContainerRef.current.getBoundingClientRect()
        if (rect.top < window.innerHeight - 100) {
          scrollContainerRef.current.classList.add('visible')
        }
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current: container } = scrollContainerRef
      const scrollAmount = container.clientWidth * 0.75

      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      }
    }
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-6 md:px-10">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold">{t('home.pastEvents')}</h2>

          <div className="flex space-x-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-white shadow-subtle hover:shadow-md transition-all"
              aria-label="Scroll left"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-white shadow-subtle hover:shadow-md transition-all"
              aria-label="Scroll right"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto space-x-6 pb-6 hide-scrollbar animate-on-scroll"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {events.map((evt, index) => (
            <div
              key={evt.id}
              ref={(el) => (cardsRef.current[index] = el) as any}
              className="flex-shrink-0 w-[280px] bg-white rounded-lg overflow-hidden shadow-subtle shadow hover:shadow-md transition-all"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="h-[180px] overflow-hidden">
                <img
                  src={evt.eventBanner?.url}
                  alt={evt.eventBanner?.alt || evt.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>

              <div className="p-5">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{evt.title}</h3>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span className="text-sm">
                    {evt.startDatetime &&
                      dateFnsFormat(new Date(evt.startDatetime), 'dd/MM/yyyy HH:mm a')}{' '}
                    -{' '}
                    {evt.endDatetime &&
                      dateFnsFormat(new Date(evt.endDatetime), 'dd/MM/yyyy HH:mm a')}
                  </span>
                </div>

                {evt.eventLocation && (
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-primary/70" />
                      <span className="text-muted-foreground line-clamp-1">
                        {evt.eventLocation}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PastConcerts
