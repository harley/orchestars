import { Menu } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import type { Header as HeaderType, Media } from '@/payload-types'
import LanguageSwitcher from '@/components/LanguageSwitcher'

const Navbar = ({ data }: { data: HeaderType }) => {
  const navItems = data?.navItems || []
  const logo = data.logo as Media

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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-black text-white w-full transition-all duration-300 ease-in-out ${
        scrolled ? 'py-3' : 'py-4'
      } px-4 md:px-8 lg:px-16`}
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo - left aligned */}
        <div className="flex-shrink-0">
          <Link href="/">
            <img
              src={logo?.url as string}
              alt={logo?.alt || data?.title || ''}
              className={`transition-all duration-300 ease-in-out ${
                scrolled ? 'h-10' : 'h-16'
              } w-auto`}
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-end flex-1">
          <div className="flex items-center space-x-8">
            {navItems.map(({ link }, i) => (
              <Link
                key={i}
                href={link.url || ''}
                className="nav-link font-medium text-white/90 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Language select and mobile menu - right aligned */}
        <div className="flex items-center space-x-4 ml-8">
          <LanguageSwitcher className="mr-3" />

          {/* Mobile menu button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden text-white">
                <Menu size={24} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-black/95 text-white border-gray-800">
              <div className="flex flex-col mt-10 space-y-6">
                {navItems.map(({ link }, i) => (
                  <Link
                    key={i}
                    href={link.url || ''}
                    onClick={() => setIsOpen(false)}
                    className="nav-link font-medium text-white/90 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
