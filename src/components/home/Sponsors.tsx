
import React, { useRef, useEffect } from 'react';

interface Sponsor {
  id: number;
  name: string;
  logo: string;
}

interface SponsorsProps {
  sponsors: Sponsor[];
}

const Sponsors: React.FC<SponsorsProps> = ({ sponsors }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const sponsorsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
          sectionRef.current.classList.add('visible');
        }
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-20 animate-on-scroll"
    >
      <div className="container mx-auto px-6 md:px-10">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-10 text-center">
          Our Sponsors & Partners
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 justify-items-center">
          {sponsors.map((sponsor, index) => (
            <div
              key={sponsor.id}
              ref={(el) => (sponsorsRef.current[index] = el)}
              className="w-full flex items-center justify-center p-4"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <img 
                src={sponsor.logo} 
                alt={sponsor.name} 
                className="max-h-16 w-auto object-contain sponsor-logo"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Sponsors;
