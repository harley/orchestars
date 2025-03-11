import React, { useState, useEffect } from 'react'
import { Calendar, MapPin, Users } from 'lucide-react'
import CustomButton from '../ui/custom-button'
import { useRouter } from 'next/navigation'
import { format as dateFnsFormat } from 'date-fns'

interface EventBannerProps {
  events: Record<string, any>[]
}

const ConcertBanner: React.FC<EventBannerProps> = ({ events }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [events.length])

  const handleDotClick = (index: number) => {
    setCurrentIndex(index)
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + events.length) % events.length)
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length)
  }

  const handleTicketClick = (evt: Record<string, any>) => {
    router.push(`/events/${evt.slug}`)
  }

  return (
    <div className="relative h-[600px] sm:h-[650px] md:h-[700px] overflow-hidden">
      {events.map((evt, index) => (
        <div
          key={evt.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
        >
          <div className="absolute inset-0 bg-black/30 z-10" />
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${evt?.eventBanner?.url})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </div>

          <div className="relative z-20 h-full flex items-end">
            <div className="container mx-auto px-6 md:px-10 pb-20 md:pb-24">
              <div className="max-w-3xl">
                {evt.sponsor && (
                  <div className="inline-block px-3 py-1 mb-3 border border-white/30 rounded-full backdrop-blur text-xs text-white/90">
                    Powered by <span className="font-semibold">{evt.sponsor}</span>
                  </div>
                )}

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-4 animate-fade-in">
                  {evt.title}
                </h1>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-white/90 mb-8">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>
                      {dateFnsFormat(new Date(evt.startDatetime), 'dd/MM/yyyy HH:mm a')} -{' '}
                      {dateFnsFormat(new Date(evt.endDatetime), 'dd/MM/yyyy HH:mm a')}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{evt.eventLocation}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    <span>{'-/300'} attendees</span>
                  </div>
                </div>

                <CustomButton
                  variant="interested"
                  size="lg"
                  className="shadow-lg"
                  onClick={() => handleTicketClick(evt)}
                >
                  {"I'm Interested"}
                </CustomButton>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={handlePrev}
        className="absolute top-1/2 left-4 z-30 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur text-white hover:bg-white/30 transition-all"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        onClick={handleNext}
        className="absolute top-1/2 right-4 z-30 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur text-white hover:bg-white/30 transition-all"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-2">
        {events.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`h-2 rounded-full transition-all ${index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default ConcertBanner
