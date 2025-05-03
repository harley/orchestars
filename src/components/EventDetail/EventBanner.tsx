import { Event, Media } from '@/payload-types'
import { Calendar, MapPin } from 'lucide-react'
import React from 'react'
import { format as dateFnsFormat } from 'date-fns'
import Image from 'next/image'

const EventBanner = ({ event }: { event: Event }) => {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-gray-100 py-20 relative">
      {/* Background pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      ></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left Content */}
            <div className="flex flex-col md:w-5/12 p-8 md:p-10 space-y-8">
              {/* Title Section */}
              {!!event.configuration?.showBannerTitle && (
                <div>
                  <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
                    {event.title || ''}
                  </h1>
                </div>
              )}

              {/* Description Section */}
              {event.description && !!event.configuration?.showBannerDescription && (
                <div>
                  <pre className="text-muted-foreground sm:mb-4 mb-2 leading-relaxed whitespace-pre-wrap font-gilroy">
                    {event.description}
                  </pre>
                </div>
              )}

              {/* Event Details Section */}
              <div className="space-y-5 mt-auto">
                {/* Date and Time */}
                {event.startDatetime && !!event.configuration?.showBannerTime && (
                  <div className="flex items-start group">
                    <div className="p-2 bg-gray-100 rounded-lg mr-4 group-hover:bg-gray-200 transition-colors">
                      <Calendar className="h-5 w-5 text-gray-700 flex-shrink-0" />
                    </div>
                    <div className="text-gray-800">
                      <span className="font-medium">
                        {dateFnsFormat(new Date(event.startDatetime), 'HH:mm')} –&nbsp;
                        {event.endDatetime
                          ? dateFnsFormat(new Date(event.endDatetime), 'HH:mm')
                          : ''}
                      </span>
                      <br />
                      <span className="text-gray-600">
                        {dateFnsFormat(new Date(event.startDatetime), 'dd/MM/yyyy')}
                      </span>
                      {event.endDatetime && (
                        <span className="text-gray-600">
                          {' '}
                          - {dateFnsFormat(new Date(event.endDatetime), 'dd/MM/yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Location */}
                {event.eventLocation && !!event.configuration?.showBannerLocation && (
                  <div className="flex items-start group">
                    <div className="p-2 bg-gray-100 rounded-lg mr-4 group-hover:bg-gray-200 transition-colors">
                      <MapPin className="h-5 w-5 text-gray-700 flex-shrink-0" />
                    </div>
                    <div className="text-gray-800 whitespace-pre-line">{event.eventLocation}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Content - Event Banner Image */}
            <div className="md:w-7/12 relative">
              <div className="relative h-full min-h-[300px] md:min-h-0">
                <Image
                  src={
                    (event.eventBanner as Media)?.url ||
                    (event?.mobileEventBanner as Media)?.url ||
                    '/images/logos/logo-black-adjacent.png'
                  }
                  fill
                  alt={event.title || 'Event'}
                  className="object-cover hidden md:block"
                />

                <Image
                  src={
                    (event.eventBanner as Media)?.url ||
                    (event?.mobileEventBanner as Media)?.url ||
                    '/images/logos/logo-black-adjacent.png'
                  }
                  fill
                  alt={event.title || 'Event'}
                  className="object-cover md:hidden"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default EventBanner
