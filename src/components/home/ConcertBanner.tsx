import React, { useState, useEffect } from 'react'
import { Calendar, MapPin, Users } from 'lucide-react'
import CustomButton from '../ui/custom-button'

interface ConcertBannerProps {
  concerts: {
    id: number
    name: string
    sponsor: string
    date: string
    time: string
    location: string
    attendees: number
    image: string
  }[]
}

const ConcertBanner: React.FC<ConcertBannerProps> = ({ concerts }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % concerts.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [concerts.length])

  const handleDotClick = (index: number) => {
    setCurrentIndex(index)
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + concerts.length) % concerts.length)
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % concerts.length)
  }

  return (
    <div className="relative h-[600px] sm:h-[650px] md:h-[700px] overflow-hidden">
      {concerts.map((concert, index) => (
        <div
          key={concert.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="absolute inset-0 bg-black/30 z-10" />
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${concert.image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </div>

          <div className="relative z-20 h-full flex items-end">
            <div className="container mx-auto px-6 md:px-10 pb-20 md:pb-24">
              <div className="max-w-3xl">
                <div className="inline-block px-3 py-1 mb-3 border border-white/30 rounded-full backdrop-blur text-xs text-white/90">
                  Powered by <span className="font-semibold">{concert.sponsor}</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-4 animate-fade-in">
                  {concert.name}
                </h1>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-white/90 mb-8">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>
                      {concert.date}, {concert.time}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{concert.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    <span>{concert.attendees.toLocaleString()} attendees</span>
                  </div>
                </div>

                <CustomButton variant="interested" size="lg" className="shadow-lg">
                  {"I'm Interested"}
                </CustomButton>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation buttons */}
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

      {/* Dots navigation */}
      <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-2">
        {concerts.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default ConcertBanner
