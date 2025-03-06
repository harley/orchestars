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

// Mock data
const bannerConcerts = [
  {
    id: 1,
    name: 'Summer Melody Festival 2023',
    sponsor: 'SoundWave Audio',
    date: 'July 15, 2023',
    time: '6:00 PM',
    location: 'Central Park, New York',
    attendees: 25000,
    image:
      'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?auto=format&fit=crop&w=1800&q=80',
  },
  {
    id: 2,
    name: 'Harmony Nights: Under the Stars',
    sponsor: 'Crystal Acoustics',
    date: 'August 5, 2023',
    time: '7:30 PM',
    location: 'Riverfront Amphitheater, Chicago',
    attendees: 18000,
    image:
      'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=1800&q=80',
  },
  {
    id: 3,
    name: 'Urban Beats Festival',
    sponsor: 'Rhythm Records',
    date: 'September 10, 2023',
    time: '5:00 PM',
    location: 'Downtown Arena, Los Angeles',
    attendees: 22000,
    image:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1800&q=80',
  },
]

const upcomingConcerts = [
  {
    id: 1,
    name: 'Acoustic Nights: Unplugged Sessions',
    date: 'October 5, 2023',
    time: '8:00 PM',
    location: 'The Grand Theater, Boston',
    attendees: 5000,
    description:
      'Experience the raw talent of acoustic artists in an intimate setting. This special unplugged session brings together the finest voices and instrumentalists for an unforgettable night.',
    image:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    name: 'Classical Symphony Orchestra',
    date: 'October 12, 2023',
    time: '7:00 PM',
    location: 'Symphony Hall, San Francisco',
    attendees: 3500,
    description:
      'The renowned Classical Symphony Orchestra presents an evening of timeless masterpieces from Beethoven, Mozart, and Bach. Conducted by Maestro James Richardson.',
    image:
      'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    name: 'Jazz & Blues Festival',
    date: 'November 2, 2023',
    time: '6:30 PM',
    location: 'Blue Note Club, New Orleans',
    attendees: 2000,
    description:
      "A celebration of America's most iconic musical genres. Featuring top jazz and blues artists from around the country performing their signature pieces and improvised sets.",
    image:
      'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&w=800&q=80',
  },
]

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

const Index = () => {
  useEffect(() => {
    const cleanup = initScrollAnimation()
    return cleanup
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <ConcertBanner concerts={bannerConcerts} />
        <ConcertList concerts={upcomingConcerts} title="Ongoing & Upcoming Concerts" />
        <PerformersSection />
        <PastConcerts concerts={pastConcerts} />
        <Sponsors sponsors={sponsors} />
      </main>

      <Footer />
    </div>
  )
}

export default Index
