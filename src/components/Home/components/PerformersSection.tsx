import React, { useRef, useEffect } from 'react'
import { Music, Users } from 'lucide-react'
import { Performer } from '@/types/Performer'
import { cn } from '@/utilities/ui'

const PerformerCard: React.FC<{ performer: Performer; index: number }> = ({ performer, index }) => {
  return (
    <div
      className={cn(
        'glass-card p-6 rounded-xl transition-all duration-500 hover:scale-105 hover:shadow-xl',
        'animate-on-scroll translate-y-4 flex-shrink-0',
        'w-[280px] md:w-[320px] backdrop-blur-sm',
      )}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="relative mb-6 aspect-square rounded-xl overflow-hidden border-2 border-white/30 group">
        <img
          src={performer.avatar?.url}
          alt={performer.avatar?.alt || performer.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
      </div>

      <h3 className="text-2xl font-bold mb-3 text-black">{performer.name}</h3>

      <div className="flex items-center gap-2 text-sm text-muted-foreground/80 mb-2">
        <Music className="w-4 h-4" />
        <span>{performer.genre}</span>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground/80 mb-4">
        <Users className="w-4 h-4" />
        <span>{performer.role}</span>
      </div>

      <p className="text-sm text-muted-foreground/90 leading-relaxed">{performer.description}</p>
    </div>
  )
}

const PerformersSection = ({ performers }: { performers: Performer[] }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto scroll animation
    const container = scrollContainerRef.current
    if (!container) return
    // Make the performers visible initially
    const cards = container.querySelectorAll('.animate-on-scroll')
    cards.forEach((card) => {
      card.classList.add('visible')
    })
    // Set up auto-scrolling
    let animationId: number
    let isPaused = false
    const scroll = () => {
      if (container && !isPaused) {
        // If we've scrolled to the end (with a buffer), jump back to start
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 200) {
          container.scrollTo({ left: 0, behavior: 'auto' })
        } else {
          // Otherwise, scroll a bit to the right
          container.scrollBy({ left: 1, behavior: 'auto' })
        }
      }
      animationId = requestAnimationFrame(scroll)
    }
    // Start auto-scrolling
    animationId = requestAnimationFrame(scroll)
    // Pause scrolling when user interacts with the container
    const pauseScrolling = () => {
      isPaused = true
    }
    const resumeScrolling = () => {
      // Add a short delay before resuming
      setTimeout(() => (isPaused = false), 2000)
    }
    container.addEventListener('mouseenter', pauseScrolling)
    container.addEventListener('mouseleave', resumeScrolling)
    container.addEventListener('touchstart', pauseScrolling)
    container.addEventListener('touchend', resumeScrolling)
    // Manual scrolling should also pause auto-scroll
    container.addEventListener('wheel', pauseScrolling)
    // Clean up
    return () => {
      cancelAnimationFrame(animationId)
      container.removeEventListener('mouseenter', pauseScrolling)
      container.removeEventListener('mouseleave', resumeScrolling)
      container.removeEventListener('touchstart', pauseScrolling)
      container.removeEventListener('touchend', resumeScrolling)
      container.removeEventListener('wheel', pauseScrolling)
    }
  }, [])

  return (
    <section className="py-24 relative overflow-hidden bg-gray-100">
      <div
        className="absolute -z-10"
        style={
          {
            // maskImage: 'radial-gradient(circle at center, black, transparent)',
          }
        }
      />

      <div className="container mx-auto px-6 md:px-10">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-center bg-clip-text text-black">
          Nghệ Sĩ Nổi Bật
        </h2>
        <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto text-lg">
          Trải nghiệm những màn trình diễn đáng nhớ từ các nghệ sĩ tài năng, mang đến âm thanh độc
          đáo và năng lượng cuốn hút trên sân khấu của chúng tôi.
        </p>

        <div className="relative">
          {/* Scroll shadow indicators */}
          {/* <div className="absolute left-0 top-0 bottom-0 w-24 z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10"></div> */}

          <div
            // ref={scrollContainerRef}
            className="flex overflow-x-auto pb-8 gap-8 hide-scrollbar scroll-smooth justify-center"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {performers?.map((performer, index) => (
              <PerformerCard key={performer.id} performer={performer} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default PerformersSection
