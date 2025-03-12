import { Performer } from '@/types/Performer'
import React from 'react'

const FeaturedPerformers = ({ performers }: { performers: Performer[] }) => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Nghệ Sĩ Nổi Bật</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {performers.map((performer) => (
            <div
              key={performer.id}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={performer.avatar?.url}
                  alt={performer.avatar?.alt || performer.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg">{performer.name}</h3>
                <p className="text-gray-600">{performer.genre}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedPerformers
