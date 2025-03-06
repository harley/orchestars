
import React, { useRef, useEffect } from 'react';
import { MapPin, Users } from 'lucide-react';

interface PastConcert {
  id: number;
  name: string;
  date: string;
  location: string;
  attendees: number;
  image: string;
}

interface PastConcertsProps {
  concerts: PastConcert[];
}

const PastConcerts: React.FC<PastConcertsProps> = ({ concerts }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const rect = scrollContainerRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
          scrollContainerRef.current.classList.add('visible');
        }
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current: container } = scrollContainerRef;
      const scrollAmount = container.clientWidth * 0.75;
      
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-6 md:px-10">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl md:text-4xl font-display font-bold">
            Past Concerts
          </h2>
          
          <div className="flex space-x-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-white shadow-subtle hover:shadow-md transition-all"
              aria-label="Scroll left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-white shadow-subtle hover:shadow-md transition-all"
              aria-label="Scroll right"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
        
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto space-x-6 pb-6 hide-scrollbar animate-on-scroll"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {concerts.map((concert, index) => (
            <div
              key={concert.id}
              ref={(el) => (cardsRef.current[index] = el)}
              className="flex-shrink-0 w-[280px] bg-white rounded-lg overflow-hidden shadow-subtle hover:shadow-md transition-all"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="h-[180px] overflow-hidden">
                <img 
                  src={concert.image} 
                  alt={concert.name} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{concert.name}</h3>
                <p className="text-muted-foreground text-sm mb-3">{concert.date}</p>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-primary/70" />
                    <span className="text-muted-foreground line-clamp-1">{concert.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-primary/70" />
                    <span className="text-muted-foreground">{concert.attendees.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PastConcerts;
