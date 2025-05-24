import { Event } from '@/payload-types'
import EventCard from './EventCard'

interface MyEventsProps {
  events: Event[]
}

const MyEvents = ({ events }: MyEventsProps) => {
  if (!events?.length) {
    return <div className="text-gray-500">⭐ Sự kiện của tôi – đang phát triển…</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Sự kiện của tôi</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}

export default MyEvents
