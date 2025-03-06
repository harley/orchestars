import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Ticket } from 'lucide-react'
import CustomButton from '../ui/custom-button'

const Header = () => {
  const [scrolled, setScrolled] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY
      setScrollPosition(position)

      const isScrolled = position > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [scrolled])

  // Calculate opacity based on scroll position (max 100px)
  const calculateOpacity = () => {
    const minOpacity = 0.7
    const maxOpacity = 0.95
    const maxScroll = 100

    const opacity =
      scrollPosition > maxScroll
        ? maxOpacity
        : minOpacity + (scrollPosition / maxScroll) * (maxOpacity - minOpacity)

    return opacity.toFixed(2)
  }

  const headerOpacity = calculateOpacity()

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? `bg-[#1A1F2C]/${headerOpacity} backdrop-blur-md shadow-lg py-3`
          : 'bg-[#1A1F2C] py-4',
      )}
      style={{
        transform: scrolled ? 'translateY(0)' : 'translateY(0)',
        transition: 'transform 0.3s ease, background-color 0.3s ease, padding 0.3s ease',
      }}
    >
      <div className="container mx-auto px-6 md:px-10 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-display font-semibold tracking-tight flex items-center gap-2 text-white transition-all duration-300"
          style={{ transform: scrolled ? 'scale(0.95)' : 'scale(1)' }}
        >
          <div
            className={cn(
              'w-8 h-8 rounded-lg bg-[#D946EF] flex items-center justify-center transition-all duration-300',
              scrolled ? 'w-7 h-7' : 'w-8 h-8',
            )}
          >
            <Ticket
              className={cn(
                'text-white transition-all duration-300',
                scrolled ? 'w-4 h-4' : 'w-5 h-5',
              )}
            />
          </div>
          Harmony Live
        </Link>

        <nav className="hidden md:flex items-center space-x-10">
          <Link href="/" className="nav-link font-medium text-white/90 hover:text-white">
            Home
          </Link>
          <Link href="/about" className="nav-link font-medium text-white/90 hover:text-white">
            About Us
          </Link>
          <Link href="/venue" className="nav-link font-medium text-white/90 hover:text-white">
            Venue
          </Link>
          <Link href="/blog" className="nav-link font-medium text-white/90 hover:text-white">
            Blog
          </Link>
          <Link href="/contact" className="nav-link font-medium text-white/90 hover:text-white">
            Contact Us
          </Link>

          <CustomButton
            variant="interested"
            size="sm"
            className={cn(
              'bg-[#D946EF] hover:bg-[#D946EF]/90 text-white transition-all duration-300',
              scrolled ? 'px-5 py-1' : 'px-6 py-1.5',
            )}
          >
            <Ticket className="w-4 h-4 mr-2" />
            Buy Ticket
          </CustomButton>
        </nav>

        <button className="md:hidden text-white focus:outline-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </header>
  )
}

export default Header
