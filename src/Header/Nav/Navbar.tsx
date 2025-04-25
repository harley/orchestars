import { Menu, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import type { Header as HeaderType, Media } from '@/payload-types'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslate } from '@/providers/I18n/client'
import { Event } from '@/types/Event'

const Navbar = ({ data, events }: { data: HeaderType; events: Event[] }) => {
  const navItems = data?.navItems || []
  const logo = data.logo as Media

  const { t } = useTranslate()

  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Scroll to footer function
  const scrollToFooter = (e: React.MouseEvent) => {
    e.preventDefault()
    const footer = document.querySelector('footer')
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' })
      setIsOpen(false)
    }
  }

  // Fixed navigation items based on requirements
  const navigationItems = [
    { link: { label: t('home.shows'), url: '#', isDropdown: true } },
    { link: { label: t('home.contact'), url: '#contact', onClick: scrollToFooter } },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white shadow-md text-black w-full transition-all duration-300 ease-in-out ${
        scrolled ? 'py-1' : 'py-0'
      } px-4 md:px-8 lg:px-16`}
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo - left aligned */}
        <div className="flex-shrink-0 mr-10">
          <Link href="/">
            <img
              src={logo?.url as string}
              alt={logo?.alt || data?.title || ''}
              className={`transition-all duration-300 ease-in-out ${
                scrolled ? 'h-10 md:h-12' : 'h-20 md:h-24'
              } w-auto`}
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-start flex-1">
          <div className="flex items-center space-x-8">
            {navItems.map(({ link }, i) => (
              <Link
                key={link.url ?? link.label}
                href={link.url || ''}
                className="nav-link font-medium text-black/90 hover:text-black"
              >
                {link.label}
              </Link>
            ))}
            {navigationItems.map(({ link }, i) => (
              <div key={link.url ?? link.label} className="relative group">
                {link.onClick ? (
                  <a
                    href={link.url}
                    onClick={link.onClick}
                    className="nav-link font-medium text-black/90 hover:underline flex items-center"
                  >
                    {link.label}
                    {link.isDropdown && <ChevronDown size={16} className="ml-1" />}
                  </a>
                ) : (
                  <Link
                    href={link.url || '#'}
                    className="nav-link font-medium text-black/90 hover:underline flex items-center"
                  >
                    {link.label}
                    {link.isDropdown && <ChevronDown size={16} className="ml-1" />}
                  </Link>
                )}

                {/* Dropdown for Show menu */}
                {link.isDropdown && (
                  <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-800 overflow-hidden rounded-md shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200">
                    {events && events.length > 0 ? (
                      events.map((event) => (
                        <Link
                          key={event.id}
                          href={`/events/${event.slug}`}
                          className="block px-4 py-2 text-sm hover:text-white hover:bg-black"
                        >
                          {event.title}
                        </Link>
                      ))
                    ) : (
                      <div className="block px-4 py-2 text-sm text-black/90">
                        {t('home.noShows')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Language select - right aligned */}
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />

          {/* Mobile menu button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden">
                <Menu size={24} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white border-gray-800">
              <div className="flex flex-col mt-10 space-y-6">
                {navItems.map(({ link }, i) => (
                  <Link
                    key={link.url ?? link.label}
                    href={link.url || ''}
                    onClick={() => setIsOpen(false)}
                    className="nav-link font-medium text-black/90 hover:text-black"
                  >
                    {link.label}
                  </Link>
                ))}
                {navigationItems.map(({ link }, i) =>
                  link.onClick ? (
                    <a
                      key={link.url ?? link.label}
                      href={link.url}
                      onClick={link.onClick}
                      className="nav-link font-medium text-black/90 hover:text-white"
                    >
                      {link.label}
                    </a>
                  ) : link.isDropdown ? (
                    <div key={link.url ?? link.label} className="space-y-2">
                      <div className="nav-link font-medium text-black/90">{link.label}</div>
                      <div className="pl-4 space-y-3">
                        {events && events.length > 0 ? (
                          events.map((event) => (
                            <Link
                              key={event.id}
                              href={`/events/${event.slug}`}
                              onClick={() => setIsOpen(false)}
                              className="block text-sm text-black hover:underline"
                            >
                              {event.title}
                            </Link>
                          ))
                        ) : (
                          <div className="text-sm text-black/90"> {t('home.noShows')}</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={link.url ?? link.label}
                      href={link.url || '#'}
                      onClick={() => setIsOpen(false)}
                      className="nav-link font-medium text-black/90 hover:text-black"
                    >
                      {link.label}
                    </Link>
                  ),
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
