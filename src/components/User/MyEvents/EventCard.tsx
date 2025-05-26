import { Event, Media } from '@/payload-types'
import { format } from 'date-fns'
import { Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'

interface EventCardProps {
  event: Event
}

const EventCard = ({ event }: EventCardProps) => {
  const eventDate = event.startDatetime ? new Date(event.startDatetime) : null
  const formattedDate = eventDate ? format(eventDate, 'dd/MM/yyyy') : 'TBA'
  const formattedTime = eventDate ? format(eventDate, 'HH:mm') : ''

  return (
    <Link href={`/event/${event.slug}`} className="block">
      <div className="group relative overflow-hidden rounded-lg bg-white shadow-md transition-all hover:shadow-lg">
        <div className="aspect-[16/9] relative">
          {(event?.eventThumbnail as Media)?.url || (event?.eventBanner as Media)?.url ? (
            <img
              src={(event?.eventThumbnail as Media)?.url || (event?.eventBanner as Media)?.url || ''}
              alt={(event?.eventThumbnail as Media)?.alt || event.title || ''}
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gray-200" />
          )}
        </div>
        <div className="p-4">
          <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2">{event.title}</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {formattedDate} {formattedTime && `• ${formattedTime}`}
              </span>
            </div>
            {event.eventLocation && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="line-clamp-1">{event.eventLocation}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default EventCard
