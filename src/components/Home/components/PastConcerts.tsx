import React from 'react'
import { Calendar, MapPin } from 'lucide-react'
import { Event } from '@/types/Event'
import { format as dateFnsFormat } from 'date-fns'
import { useTranslate } from '@/providers/I18n/client'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

interface PastConcertsProps {
  events: Event[]
  className?: string
}

const PastConcerts: React.FC<PastConcertsProps> = ({ events, className }) => {
  const { t } = useTranslate()

  return (
    <section className={`py-10 md:py-20 ${className || ''}`}>
      <div className="container mx-auto px-4 w-full">
        <Carousel className="w-full relative">
          <div className="flex md:items-center gap-2 justify-between mb-4">
            <h2 className="text-2xl md:text-4xl font-bold uppercase">{t('home.pastEvents')}</h2>
            <div className="flex space-x-4">
              <CarouselPrevious className="relative inset-0 translate-y-0 bg-black/30 hover:bg-black/80 hover:text-white text-white rounded-full h-10 w-10" />
              <CarouselNext className="relative inset-0 translate-y-0 bg-black/30 hover:bg-black/80 hover:text-white text-white rounded-full h-10 w-10" />
            </div>
          </div>

          <CarouselContent className="-ml-4">
            {events.map((evt) => (
              <CarouselItem key={evt.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div key={evt.id} className="flex flex-col">
                  <div className="md:aspect-[3/4] aspect-square overflow-hidden mb-4 rounded-md relative group border border-black/10 ">
                    <img
                      src={evt.eventThumbnail?.url || evt.eventBanner?.url}
                      alt={evt.eventThumbnail?.alt || evt.eventBanner?.alt || evt.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Hover overlay to show event information on desktop view*/}
                    <div className="hidden absolute inset-0 bg-black/50 md:flex flex-col items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="text-white text-xl md:text-3xl line-clamp-3 font-bold mb-3 text-center">
                        {evt.title}
                      </h3>

                      <div className="flex flex-col text-white space-y-2">
                        <div className="flex items-center justify-center">
                          <Calendar className="h-4 w-4 mr-2 text-white/80" />
                          <span className="text-sm">
                            {evt.startDatetime &&
                              dateFnsFormat(new Date(evt.startDatetime), 'dd/MM/yyyy')}{' '}
                            -{' '}
                            {evt.endDatetime &&
                              dateFnsFormat(new Date(evt.endDatetime), 'dd/MM/yyyy')}
                          </span>
                        </div>

                        {evt.eventLocation && (
                          <div className="flex items-start justify-center">
                            <MapPin size={16} className="mr-2 text-white/80" />
                            <span className="text-sm text-wrap max-w-[200px]">
                              {evt.eventLocation}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* event information on mobile view */}
                <div className="bg-black/50 flex flex-col items-start justify-center transition-opacity duration-300 md:hidden">
                  <h3 className="text-white text-xl md:text-3xl line-clamp-3 font-bold text-center">
                    {evt.title}
                  </h3>

                  <div className="flex flex-col items-start text-white space-y-2">
                    <div className="flex items-center justify-center">
                      <Calendar className="h-4 w-4 mr-2 text-white/80" />
                      <span className="text-sm">
                        {evt.startDatetime &&
                          dateFnsFormat(new Date(evt.startDatetime), 'dd/MM/yyyy')}{' '}
                        -{' '}
                        {evt.endDatetime && dateFnsFormat(new Date(evt.endDatetime), 'dd/MM/yyyy')}
                      </span>
                    </div>

                    {evt.eventLocation && (
                      <div className="flex items-start justify-center">
                        <MapPin size={16} className="mr-2 text-white/80" />
                        <span className="text-sm text-wrap">{evt.eventLocation}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  )
}

export default PastConcerts
