import { Partner } from '@/types/Partner'
import React, { useRef, useEffect, useState } from 'react'

interface SponsorsProps {
  partners: Partner[]
}

const Sponsors: React.FC<SponsorsProps> = ({ partners = [] }) => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const sponsorsPerPage = 5
  const totalPages = Math.max(1, Math.ceil((partners?.length || 0) / sponsorsPerPage))

  // Animation for section entrance
  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect()
        if (rect.top < window.innerHeight - 100) {
          sectionRef.current.classList.add('visible')
        }
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Auto scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages)
    }, 4000)

    return () => clearInterval(interval)
  }, [totalPages])

  const handleDotClick = (index: number) => {
    setCurrentPage(index)
  }

  return (
    <section ref={sectionRef} className="py-20 animate-on-scroll bg-gray-100">
      <div className="container mx-auto px-6 md:px-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-gray-700 to-gray-950 bg-clip-text text-transparent">
            Nhà Tài Trợ Và Đối Tác
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-gray-950 to-gray-700 mx-auto mt-4 rounded-full" />
        </div>

        <div className="overflow-hidden">
          <div
            className="transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${(currentPage * 100) / totalPages}%)`,
              display: 'flex',
              width: `${totalPages * 100}%`,
            }}
          >
            {Array.from({ length: totalPages }).map((_, pageIndex) => (
              <div
                key={pageIndex}
                className="flex justify-center"
                style={{ width: `${100 / totalPages}%` }}
              >
                <div className="flex justify-center gap-8">
                  {partners
                    .slice(pageIndex * sponsorsPerPage, (pageIndex + 1) * sponsorsPerPage)
                    .map((partner) => (
                      <a
                        key={partner.id}
                        href={partner.link}
                        rel={'noreferrer'}
                        target="_blank"
                        className="cursor-pointer"
                      >
                        <div className="bg-white p-4 h-44 w-44 flex items-center justify-center rounded-lg shadow-sm transform transition-all duration-300 hover:shadow-md">
                          <img
                            src={partner.logo?.url}
                            alt={partner.logo?.alt || partner.name}
                            className="max-h-24 max-w-32 object-contain transition-transform duration-300 hover:scale-110"
                          />
                        </div>
                      </a>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${currentPage === index ? 'bg-black' : 'bg-gray-300'}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Sponsors
