import React, { useEffect, useRef } from 'react'
import { Calendar, MapPin, Users } from 'lucide-react'
import CustomButton from '../ui/custom-button'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface Concert {
  id: number
  name: string
  date: string
  time: string
  location: string
  attendees: number
  description: string
  image: string
}

interface ConcertListProps {
  concerts: Concert[]
  title: string
}

const ConcertList: React.FC<ConcertListProps> = ({ concerts, title }) => {
  const elementsRef = useRef<(HTMLDivElement | null)[]>([])
  const router = useRouter()

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

  const handleGetTickets = (id: number) => {
    router.push(`/concerts/${id}`)
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-6 md:px-10">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-12 text-center">{title}</h2>

        <div className="space-y-20">
          {concerts.map((concert, index) => (
            <div
              key={concert.id}
              ref={(el) => (elementsRef.current[index] = el) as any}
              className={cn(
                'grid md:grid-cols-2 gap-6 md:gap-10 animate-on-scroll',
                index % 2 === 0 ? 'md:grid-flow-col' : '',
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image section */}
              <div
                className={cn(
                  'rounded-lg overflow-hidden h-[300px] md:h-full shadow-md',
                  index % 2 === 0 ? 'md:order-1' : 'md:order-2',
                )}
              >
                <img
                  src={concert.image}
                  alt={concert.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>

              {/* Content section */}
              <div
                className={cn(
                  'flex flex-col justify-center',
                  index % 2 === 0 ? 'md:order-2' : 'md:order-1',
                )}
              >
                <h3 className="text-2xl md:text-3xl font-display font-bold mb-3">{concert.name}</h3>

                <div className="flex flex-col sm:flex-row gap-4 text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      {concert.date}, {concert.time}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">{concert.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="text-sm">{concert.attendees.toLocaleString()} attendees</span>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6">{concert.description}</p>

                <div>
                  <CustomButton variant="primary" onClick={() => handleGetTickets(concert.id)}>
                    Get Tickets
                  </CustomButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ConcertList
