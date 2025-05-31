import { Event, Media } from '@/payload-types'
import { Calendar, MapPin } from 'lucide-react'
import React from 'react'
import { format as dateFnsFormat } from 'date-fns'
import { toZonedTime, format as tzFormat } from 'date-fns-tz'
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
        <div className={`${event.slug === 'disney-25' ? 'rounded-xl shadow-xl overflow-hidden' : 'bg-white rounded-xl shadow-xl overflow-hidden'}`}>
          <div className={`flex flex-col md:flex-row${event.slug === 'disney-25' ? ' items-stretch' : ''}`}>
            {/* Left Content */}
            <div className={`flex flex-col ${event.slug === 'disney-25' ? 'flex-1 min-w-0 p-8 md:p-10 space-y-8' : 'md:w-5/12 p-8 md:p-10 space-y-8'}`}>
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
                        {tzFormat(toZonedTime(new Date(event.startDatetime), 'Asia/Ho_Chi_Minh'), 'HH:mm')} –&nbsp;
                        {event.endDatetime
                          ? tzFormat(toZonedTime(new Date(event.endDatetime), 'Asia/Ho_Chi_Minh'), 'HH:mm')
                          : ''}
                      </span>
                      <br />
                      <span className="text-gray-600">
                        {tzFormat(toZonedTime(new Date(event.startDatetime), 'Asia/Ho_Chi_Minh'), 'dd/MM/yyyy')}
                      </span>
                      {event.endDatetime && (
                        <span className="text-gray-600">
                          {' '}
                          - {tzFormat(toZonedTime(new Date(event.endDatetime), 'Asia/Ho_Chi_Minh'), 'dd/MM/yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Location */}
                {event.eventLocation && !!event.configuration?.showBannerLocation && (
                  <div className="flex items-center group">
                    <div className="p-2 bg-gray-100 rounded-lg mr-4 group-hover:bg-gray-200 transition-colors">
                      <MapPin className="h-5 w-5 text-gray-700 flex-shrink-0" />
                    </div>
                    <div className="text-gray-800 whitespace-pre-line">{event.eventLocation}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Content - Event Banner Image */}
            {event.slug === 'disney-25' ? (
              <div className="relative min-w-[200px] max-w-[40vw] flex-shrink-0 flex-grow-0 flex items-center justify-center">
                <div className="relative w-full h-[500px] aspect-[3/4] flex items-center justify-center">
                  <Image
                    src={(event.eventThumbnail as Media)?.url || '/images/logos/logo-black-adjacent.png'}
                    alt={event.title || 'Event'}
                    className="object-contain w-full h-full"
                    fill={false}
                    width={600}
                    height={800}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none"></div>
                </div>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default EventBanner
