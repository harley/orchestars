import React from 'react'
interface Performer {
  id: number
  name: string
  image: string
  genre: string
}

const performers: Performer[] = [
  {
    id: 1,
    name: 'Maya Rivers',
    image: 'https://images.unsplash.com/photo-1475850313866-696e8076ac0a',
    genre: 'Pop/R&B',
  },
  {
    id: 2,
    name: 'Electric Pulse',
    image: 'https://images.unsplash.com/photo-1554324601-d44b71641356',
    genre: 'Electronic',
  },
  {
    id: 3,
    name: 'The Resonants',
    image: 'https://images.unsplash.com/photo-1529333752647-3a0633f6429d',
    genre: 'Alternative Rock',
  },
  {
    id: 4,
    name: 'DJ Harmony',
    image: 'https://images.unsplash.com/photo-1603559822934-c01e9aa89708',
    genre: 'EDM',
  },
]

const FeaturedPerformers = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Performers</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {performers.map((performer) => (
            <div
              key={performer.id}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={performer.image}
                  alt={performer.name}
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
