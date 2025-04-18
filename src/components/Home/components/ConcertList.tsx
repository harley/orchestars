import React, { useEffect, useRef } from 'react'
import { Calendar, MapPin } from 'lucide-react'
import { format as dateFnsFormat } from 'date-fns'

import { PaginatedDocs } from 'payload'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import { useTranslate } from '@/providers/I18n/client'
interface ConcertListProps {
  onGoingPaginatedDocs: PaginatedDocs
  className?: string
}

const ConcertList: React.FC<ConcertListProps> = ({ onGoingPaginatedDocs, className }) => {
  const elementsRef = useRef<(HTMLDivElement | null)[]>([])

  const { t } = useTranslate()

  useEffect(() => {
    const handleScroll = () => {
      elementsRef.current.forEach((element) => {
        if (!element) return

        const rect = element.getBoundingClientRect()
        const isVisible = rect.top < window.innerHeight - 100

        if (isVisible) {
          element.classList.add('visible')
        }
      })
    }

    // Call once to check for elements already in view on load
    handleScroll()

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <section className={`py-20 ${className || ''}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-gray-700 to-gray-950 bg-clip-text text-transparent">
            {t('home.onGoingEvent')}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-gray-950 to-gray-700 mx-auto mt-4 rounded-full" />
        </div>

        <div className="space-y-20">
          {onGoingPaginatedDocs?.docs?.map((evt, index) => (
            <div
              key={evt.id}
              ref={(el) => (elementsRef.current[index] = el) as any}
              className={cn(
                'grid md:grid-cols-2 gap-6 md:gap-10 animate-on-scroll',
                index % 2 === 0 ? 'md:grid-flow-col' : '',
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image section */}
              <div
                className={cn(
                  'rounded-lg overflow-hidden h-[250px] sm:h-[300px] md:h-full shadow-md',
                  index % 2 === 0 ? 'md:order-1' : 'md:order-2',
                )}
              >
                <img
                  src={evt.eventThumbnail?.url || evt.eventBanner?.url}
                  alt={evt.eventThumbnail?.alt || evt.eventBanner?.alt || evt.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>

              {/* Content section */}
              <div
                className={cn(
                  'flex flex-col justify-center',
                  index % 2 === 0 ? 'md:order-2' : 'md:order-1',
                )}
              >
                <Link
                  href={`/events/${evt.slug}`}
                  className="text-2xl md:text-3xl font-bold mb-3 hover:underline"
                >
                  {evt.title}
                </Link>
                <div className="flex flex-col sm:flex-row gap-4 text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      {dateFnsFormat(new Date(evt.startDatetime), 'dd/MM/yyyy HH:mm a')} -{' '}
                      {dateFnsFormat(new Date(evt.endDatetime), 'dd/MM/yyyy HH:mm a')}
                    </span>
                  </div>
                  {evt.eventLocation && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{evt.eventLocation}</span>
                    </div>
                  )}

                  {/* <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="text-sm">{'-/300'} attendees</span>
                  </div> */}
                </div>

                <pre className="text-muted-foreground mb-6 text-sm whitespace-pre-wrap font-montserrat">
                  {evt.description}
                </pre>

                <div>
                  <Link
                    // variant="primary"
                    href={`/events/${evt.slug}`}
                    className="text-sm px-4 py-2 bg-gray-800 text-white hover:bg-gray-800/90 shadow-subtle relative cursor-pointer rounded-lg font-medium inline-flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20"
                  >
                    {t('home.bookTicket')}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ConcertList
