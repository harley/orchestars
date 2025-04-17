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
    <section className={`py-20 ${className || ''}`}>
      <div className="container mx-auto px-4 w-full">
        <Carousel className="w-full relative">
          <div className="flex flex-col md:flex-row items-center justify-between mb-4">
            <div className="flex justify-between items-center mb-12">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-extrabold bg-gradient-to-r from-gray-700 to-gray-950 bg-clip-text text-transparent">
                  {t('home.pastEvents')}
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-gray-950 to-gray-700 mx-auto mt-4 rounded-full" />
              </div>
            </div>
            <div className="flex space-x-4">
              <CarouselPrevious className="relative inset-0 translate-y-0 bg-transparent hover:bg-black/10 text-black border border-black rounded-full h-10 w-10" />
              <CarouselNext className="relative inset-0 translate-y-0 bg-transparent hover:bg-black/10 text-black border border-black rounded-full h-10 w-10" />
            </div>
          </div>

          <CarouselContent className="-ml-4">
            {events.map((evt) => (
              <CarouselItem key={evt.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div key={evt.id} className="flex flex-col">
                  <div className="md:aspect-[3/4] aspect-square overflow-hidden mb-4 rounded-md">
                    <img
                      src={evt.eventThumbnail?.url || evt.eventBanner?.url}
                      alt={evt.eventThumbnail?.alt || evt.eventBanner?.alt || evt.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="text-black text-xl font-bold">{evt.title}</h3>
                  {/* <p className="text-white text-lg mb-4">{show.subtitle}</p> */}

                  <div className="text-black space-y-2 mb-6">
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span>
                        {evt.startDatetime &&
                          dateFnsFormat(new Date(evt.startDatetime), 'dd/MM/yyyy HH:mm a')}{' '}
                        -{' '}
                        {evt.endDatetime &&
                          dateFnsFormat(new Date(evt.endDatetime), 'dd/MM/yyyy HH:mm a')}
                      </span>
                    </div>
                    {evt.eventLocation && (
                      <div className="flex items-start space-x-2 text-sm">
                        <MapPin className="h-4 w-4 mr-1 text-primary/70" />
                        <span className="flex-1">{evt.eventLocation}</span>
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
