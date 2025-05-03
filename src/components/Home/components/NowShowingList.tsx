import React, { useEffect, useMemo, useRef } from 'react'

import Image from 'next/image'
import { PaginatedDocs } from 'payload'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import { useTranslate } from '@/providers/I18n/client'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { EVENT_STATUS } from '@/collections/Events/constants/status'
interface ConcertListProps {
  onGoingPaginatedDocs: PaginatedDocs
  className?: string
}

const NowShowingList: React.FC<ConcertListProps> = ({ onGoingPaginatedDocs, className }) => {
  const elementsRef = useRef<(HTMLDivElement | null)[]>([])

  const { t } = useTranslate()

  const nowShowingEvents = useMemo(
    () =>
      onGoingPaginatedDocs?.docs.filter(
        (evt) =>
          evt.status === EVENT_STATUS.published_open_sales.value &&
          new Date(evt.endDatetime) > new Date(),
      ),
    [onGoingPaginatedDocs?.docs],
  )

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

  if (nowShowingEvents.length === 0) return null

  return (
    <section className={`py-10 md:py-20 ${className || ''}`}>
      <Carousel className="w-full relative">
        <div className="container mx-auto px-4">
          <div className="flex md:items-center gap-2 justify-between mb-4">
            <h2 className="text-2xl md:text-4xl font-bold uppercase">
              {t('home.nowShowingEvents')}
            </h2>
            {nowShowingEvents.length > 1 && (
              <div className="flex space-x-4">
                <CarouselPrevious className="relative inset-0 translate-y-0 bg-black/30 hover:bg-black/80 hover:text-white text-white rounded-full h-10 w-10" />
                <CarouselNext className="relative inset-0 translate-y-0 bg-black/30 hover:bg-black/80 hover:text-white text-white rounded-full h-10 w-10" />
              </div>
            )}
          </div>

          <CarouselContent className="-ml-4">
            {nowShowingEvents.map((evt, index) => (
              <CarouselItem key={evt.id} className="pl-4">
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
                  <div className="relative rounded-lg overflow-hidden w-full h-[250px] md:h-[600px] lg:h-[700px] xl:h-[890px] shadow-md">
                    <Image
                      fill
                      sizes="(max-width:768px) 100vw, 50vw"
                      src={evt.eventThumbnail?.url || evt.eventBanner?.url}
                      alt={evt.eventThumbnail?.alt || evt.eventBanner?.alt || evt.title}
                      className="object-cover object-center transition-transform duration-700 hover:scale-105"
                    />
                  </div>

                  {/* Content section */}
                  <div className="flex flex-col justify-center">
                    <Link
                      href={`/events/${evt.slug}`}
                      className="text-[22px] md:text-6xl font-bold mb-3 hover:underline"
                    >
                      {evt.title}
                    </Link>
                    <pre className="text-muted-foreground mb-6 text-lg md:text-xl whitespace-pre-wrap font-gilroy">
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
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
      </Carousel>
    </section>
  )
}

export default NowShowingList
