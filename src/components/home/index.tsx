'use client'

import React, { useEffect } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ConcertBanner from '@/components/home/ConcertBanner'
import ConcertList from '@/components/home/ConcertList'
import PastConcerts from '@/components/home/PastConcerts'
import PerformersSection from '@/components/home/PerformersSection'
import Sponsors from '@/components/home/Sponsors'
import { initScrollAnimation } from '@/utils/scrollAnimation'
import { PaginatedDocs } from 'payload'

const pastConcerts = [
  {
    id: 1,
    name: 'Rock Revolution Tour',
    date: 'May 18, 2023',
    location: 'Madison Square Garden, NY',
    attendees: 20000,
    image:
      'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    name: 'Electronic Dreams Festival',
    date: 'April 5, 2023',
    location: 'Sunset Park, Miami',
    attendees: 15000,
    image:
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    name: 'Folk Traditions',
    date: 'March 22, 2023',
    location: 'Heritage Hall, Nashville',
    attendees: 3500,
    image:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 4,
    name: 'Hip Hop Heroes',
    date: 'February 10, 2023',
    location: 'Urban Arena, Atlanta',
    attendees: 18000,
    image:
      'https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 5,
    name: 'Opera Gala Night',
    date: 'January 15, 2023',
    location: 'Opera House, Vienna',
    attendees: 2800,
    image:
      'https://images.unsplash.com/photo-1580809361436-42a7ec5b1f1e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 6,
    name: 'Pop Sensations Live',
    date: 'December 12, 2022',
    location: 'Staples Center, LA',
    attendees: 22000,
    image:
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80',
  },
]

const sponsors = [
  {
    id: 1,
    name: 'SoundWave Audio',
    logo: 'https://placehold.co/200x80/f5f5f5/333333?text=SoundWave',
  },
  {
    id: 2,
    name: 'Rhythm Records',
    logo: 'https://placehold.co/200x80/f5f5f5/333333?text=Rhythm',
  },
  {
    id: 3,
    name: 'Crystal Acoustics',
    logo: 'https://placehold.co/200x80/f5f5f5/333333?text=Crystal',
  },
  {
    id: 4,
    name: 'Melody Media',
    logo: 'https://placehold.co/200x80/f5f5f5/333333?text=Melody',
  },
  {
    id: 5,
    name: 'Harmony Productions',
    logo: 'https://placehold.co/200x80/f5f5f5/333333?text=Harmony',
  },
  {
    id: 6,
    name: 'Beat Masters',
    logo: 'https://placehold.co/200x80/f5f5f5/333333?text=Beat',
  },
  {
    id: 7,
    name: 'Echo Entertainment',
    logo: 'https://placehold.co/200x80/f5f5f5/333333?text=Echo',
  },
  {
    id: 8,
    name: 'Sonic Solutions',
    logo: 'https://placehold.co/200x80/f5f5f5/333333?text=Sonic',
  },
  {
    id: 9,
    name: 'Tune Technologies',
    logo: 'https://placehold.co/200x80/f5f5f5/333333?text=Tune',
  },
  {
    id: 10,
    name: 'Symphony Sponsors',
    logo: 'https://placehold.co/200x80/f5f5f5/333333?text=Symphony',
  },
]

const Index = ({
  bannerDocs,
  onGoingPaginatedDocs,
}: {
  bannerDocs: PaginatedDocs['docs']
  onGoingPaginatedDocs: PaginatedDocs
}) => {
  useEffect(() => {
    const cleanup = initScrollAnimation()
    return cleanup
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <ConcertBanner events={bannerDocs} />
        <ConcertList
          onGoingPaginatedDocs={onGoingPaginatedDocs}
          title="Ongoing & Upcoming Concerts"
        />
        <PerformersSection />
        <PastConcerts concerts={pastConcerts} />
        <Sponsors sponsors={sponsors} />
      </main>

      <Footer />
    </div>
  )
}

export default Index