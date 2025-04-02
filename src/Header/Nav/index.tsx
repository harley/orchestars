'use client'

import React, { useEffect, useState } from 'react'

import type { Header as HeaderType, Media } from '@/payload-types'

import Link from 'next/link'
import { cn } from '@/utilities/ui'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const logo = data.logo as Media

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
        scrolled ? ` backdrop-blur-md shadow-lg py-3` : ' py-4',
      )}
      style={{
        transform: scrolled ? 'translateY(0)' : 'translateY(0)',
        transition: 'transform 0.3s ease, background-color 0.3s ease, padding 0.3s ease',
        backgroundColor: scrolled ? `rgba(26, 31, 44, ${headerOpacity})` : '#1A1F2C',
      }}
    >
      <div className="container mx-auto px-6 md:px-10 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-display font-semibold tracking-tight flex items-center gap-2 text-white transition-all duration-300"
          style={{ transform: scrolled ? 'scale(0.95)' : 'scale(1)' }}
        >
          {logo?.url && (
            <div
              className={cn(
                'flex items-center justify-center transition-all duration-300',
                scrolled ? 'h-8' : 'h-10',
              )}
            >
              <img
                src={logo?.url}
                alt={logo?.alt || data?.title || ''}
                className={cn(
                  'transition-all duration-300 object-contain rounded-md',
                  scrolled ? 'h-8' : 'h-10',
                )}
              />
            </div>
          )}
          <span className="ml-1">{data?.title}</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-10">
          {navItems.map(({ link }, i) => (
            <Link
              key={i}
              href={link.url || ''}
              className="nav-link font-medium text-white/90 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <LanguageSwitcher className="mr-3" />
        </nav>
        <div className="flex items-center md:hidden">
          <LanguageSwitcher className="mr-4" />
          <button
            className="text-white focus:outline-none"
            aria-label="Toggle menu"
            aria-expanded="false"
          >
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
      </div>
    </header>
  )
}
