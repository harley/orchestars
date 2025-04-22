import { Event, Media } from '@/payload-types'
import { Calendar, MapPin } from 'lucide-react'
import React from 'react'
import { format as dateFnsFormat } from 'date-fns'

const EventBanner = ({ event }: { event: Event }) => {
  return (
    <section className="relative h-[300px] lg:h-[400px] xl:h-[500px] 2xl:h-[700px] overflow-hidden">
      <div className="absolute inset-0 z-10" />
      {/* Desktop Banner */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden md:block"
        style={{ backgroundImage: `url(${(event?.eventBanner as Media)?.url})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 to-transparent" />
      </div>

      {/* Mobile Banner */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden"
        style={{
          backgroundImage: `url(${(event?.mobileEventBanner as Media)?.url || (event?.eventBanner as Media)?.url})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 to-transparent" />
      </div>

      <div className="relative z-20 h-full flex items-end">
        <div className="container mx-auto px-6 md:px-10 pb-16 md:pb-20 w-full">
          <div className="max-w-3xl">
            {event.title && event.configuration?.showBannerTitle && (
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 animate-fade-in">
                {event.title}
              </h1>
            )}

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-white/90 mb-8">
              {event.configuration?.showBannerTime && (
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>
                    {event.startDatetime &&
                      dateFnsFormat(new Date(event.startDatetime), 'dd/MM/yyyy HH:mm a')}{' '}
                    -{' '}
                    {event.endDatetime &&
                      dateFnsFormat(new Date(event.endDatetime), 'dd/MM/yyyy HH:mm a')}
                  </span>
                </div>
              )}

              {event.eventLocation && event.configuration?.showBannerLocation && (
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{event.eventLocation}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default EventBanner
