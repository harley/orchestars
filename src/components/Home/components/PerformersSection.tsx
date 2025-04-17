'use client'

import React from 'react'
import { Music, Users } from 'lucide-react'
import { Performer } from '@/types/Performer'
import { cn } from '@/utilities/ui'
import { useTranslate } from '@/providers/I18n/client'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
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

      {performer.genre && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground/80 mb-2">
          <Music className="w-4 h-4" />
          <span>{performer.genre}</span>
        </div>
      )}
      {performer.role && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground/80 mb-4">
          <Users className="w-4 h-4" />
          <span>{performer.role}</span>
        </div>
      )}

      <p className="text-sm text-muted-foreground/90 leading-relaxed">{performer.description}</p>
    </div>
  )
}

const PerformersSection = ({
  performers,
  className,
}: {
  performers: Performer[]
  className?: string
}) => {
  const { t } = useTranslate()

  return (
    <section className={`py-20 relative overflow-hidden ${className || ''}`}>
      <div
        className="absolute -z-10"
        style={
          {
            // maskImage: 'radial-gradient(circle at center, black, transparent)',
          }
        }
      />

      <div className="container mx-auto px-4">
        <div className="mb-12">
          <div className="text-center mb-4">
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-gray-700 to-gray-950 bg-clip-text text-transparent">
              {t('home.outstandingPerformers')}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gray-950 to-gray-700 mx-auto mt-4 rounded-full" />
          </div>
          <p className="mt-5 md:mt-0 text-muted-foreground text-center mb-8 max-w-2xl mx-auto text-lg">
            {t('home.outstandingPerformersDescription')}
          </p>
        </div>

        <Carousel className="w-full relative">
          <CarouselContent className="">
            {(performers || []).map((performer, index) => (
              <CarouselItem key={performer.id} className="basis-1/1 lg:basis-1/3">
                <PerformerCard key={performer.id} performer={performer} index={index} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  )
}

export default PerformersSection
