import { Activity, Media } from '@/payload-types'
import { cn } from '@/utilities/ui'
import React, { useEffect, useRef } from 'react'

const ActivitiesSection = ({ activity }: { activity: Activity }) => {
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
    <section className="max-w-6xl mx-auto px-4 py-16">
      {/* Header Section */}
      <div className="grid md:grid-cols-[300px,1fr] gap-3 justify-between mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center font-display">
          {activity?.mainTitle}
        </h2>
        <p className="text-gray-600 mt-4 md:mt-0 text-center md:text-left">
          {activity?.description}
        </p>
      </div>

      {/* Activities List */}
      {/* <div className="absolute left-0 top-0 bottom-0 w-24 z-10"></div>
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10"></div> */}
      <div
        className="flex overflow-x-auto pb-8 gap-8 hide-scrollbar scroll-smooth"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {activity?.list?.map((activity, index) => (
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
                src={(activity.image as Media)?.url as string}
                alt={(activity.image as Media)?.alt || activity.title || ''}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
            </div>

            <h3 className="text-2xl font-bold mb-3 text-black">{activity.title}</h3>
            <p className="text-sm text-muted-foreground/90 leading-relaxed">
              {activity.description}
            </p>
          </div>

          //   <div
          //     key={activity.id}
          //     className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform relative hover:scale-105 p-4"
          //   >
          //     <div className="h-48 relative overflow-hidden">
          //       <img
          //         src={(activity.image as Media)?.url as string}
          //         alt={(activity.image as Media)?.alt || activity.title || ''}
          //         className="w-full h-full object-cover transition-transform duration-300 rounded-xl"
          //       />
          //     </div>
          //     <div className="p-5 text-center">
          //       <h3 className="font-bold text-xl text-gray-800">{activity.title}</h3>
          //       <p className="text-gray-600">{activity.description}</p>
          //     </div>
          //   </div>
        ))}
      </div>
    </section>
  )
}

export default ActivitiesSection
