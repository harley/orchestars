import { Event, Media } from '@/payload-types'
import { Calendar, MapPin } from 'lucide-react'
import React from 'react'
import { format as dateFnsFormat } from 'date-fns'
import Image from 'next/image'
const EventBanner = ({ event }: { event: Event }) => {
  return (
    <section className="bg-gray-100 py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Left Content - Event Title */}
          <div className="flex flex-col justify-between md:w-5/12 space-y-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-black tracking-tight">
                {event.title || 'Event Title'}
              </h1>
            </div>

            <div className="space-y-3">
              {event.startDatetime && (
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-black" />
                  <div className="text-black">
                    <span className="font-medium">
                      {dateFnsFormat(new Date(event.startDatetime), 'HH:mm')} –&nbsp;
                      {event.endDatetime ? dateFnsFormat(new Date(event.endDatetime), 'HH:mm') : ''}
                    </span>
                    <br />
                    <span>{dateFnsFormat(new Date(event.startDatetime), 'dd-MM, yyyy')}</span>
                  </div>
                </div>
              )}

              {event.eventLocation && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 mt-1 text-black" />
                  <div className="text-black whitespace-pre-line">{event.eventLocation}</div>
                </div>
              )}
            </div>
          </div>

          {/* Right Content - Event Banner Image */}
          <div className="md:w-7/12">
            <div className="relative rounded-lg overflow-hidden aspect-[51/29]">
              <Image
                src={
                  (event.eventBanner as Media)?.url ||
                  (event?.mobileEventBanner as Media)?.url ||
                  '/images/logos/logo-black-adjacent.png'
                }
                fill
                alt={event.title || 'Event'}
                className="object-cover rounded-lg shadow-md hidden md:block"
              />

              <Image
                src={
                  (event.eventBanner as Media)?.url ||
                  (event?.mobileEventBanner as Media)?.url ||
                  '/images/logos/logo-black-adjacent.png'
                }
                fill
                alt={event.title || 'Event'}
                className="object-cover rounded-lg shadow-md md:hidden"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default EventBanner
