import { Menu, ChevronDown, Ticket, User, LogOut, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import type { Header as HeaderType, Media, Page } from '@/payload-types'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslate } from '@/providers/I18n/client'
import { Event } from '@/types/Event'
import LoginForm from '@/components/User/LoginForm'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { logout } from '@/app/(frontend)/user/actions/logout'
import { EVENT_STATUS } from '@/collections/Events/constants/status'
import { usePathname } from 'next/navigation'

const Navbar = ({
  data,
  events,
  authData,
}: {
  data: HeaderType
  events: Event[]
  authData?: any
}) => {
  const navItems = data?.navItems || []
  const logo = data.logo as Media
  const { t } = useTranslate()

  const [isOpen, setIsOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null)

  const pathname = usePathname()
  const eventOpenForSale = events.find(
    (event) => event.status === EVENT_STATUS.published_open_sales.value,
  )
  const eventTicketPath = eventOpenForSale ? `/events/${eventOpenForSale.slug}` : null
  const isOnEventTicketPage = pathname === eventTicketPath
  const isOnSelectTicketPage = pathname.includes('/select-ticket')
  const shouldShowBuyTicketButton = !!eventOpenForSale && eventTicketPath && !isOnEventTicketPage && !isOnSelectTicketPage

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

  const renderNavItemUrl = (link: any) => {
    if ((link.reference?.value as Page)?.slug) {
      return `/${(link.reference?.value as Page)?.slug}`
    }

    return link.url || '#'
  }

  // Helper for safe submenu rendering
  const isArray = Array.isArray

  return (
    <>
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
                } w-auto max-w-[150px]`}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-start flex-1">
            <div className="flex items-center space-x-8">
              {navItems.map(({ link, children }) => (
                <div key={link.url ?? link.label} className="relative group">
                  <Link
                    href={renderNavItemUrl(link)}
                    className="nav-link font-medium text-black/90 hover:underline flex items-center"
                  >
                    {link.label}
                    {!!children?.length && <ChevronDown size={16} className="ml-1" />}
                  </Link>

                  {/* Dropdown for Show menu */}
                  {!!children?.length && (
                    <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-800 overflow-hidden rounded-md shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200">
                      {children.map((linkChild) => (
                        <Link
                          key={linkChild.id}
                          href={renderNavItemUrl(linkChild?.link)}
                          className="block px-4 py-2 text-sm hover:text-white hover:bg-black"
                        >
                          {linkChild.link?.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {navigationItems.map(({ link }) => (
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

          {/* Right aligned items */}
          <div className="flex items-center gap-6">
            {/* Buy Ticket Now (Primary Action) */}
            {shouldShowBuyTicketButton && (
              <Link
                href={eventTicketPath}
                className="md:flex  hidden bg-gray-900 min-w-40 hover:bg-gray-800 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105"
                aria-label={t('navbar.buyTicketNow')}
              >
                {t('navbar.buyTicketNow')}
              </Link>
            )}

            {/* Authenticated: show profile menu */}
            {authData ? (
              <div className="relative group">
                <button className="flex items-center focus:outline-none">
                  <Avatar>
                    <AvatarFallback>👤</AvatarFallback>
                  </Avatar>
                </button>
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50">
                  <Link
                    href="/user/profile"
                    className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                  >
                    {t('navbar.profile')}
                  </Link>
                  <form action={logout}>
                    <button
                      type="submit"
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      {t('navbar.logout')}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <>
                {/* Sign In button (Secondary Action) */}
                <button
                  className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105"
                  onClick={() => setLoginOpen(true)}
                  aria-label={t('navbar.signInSignUp')}
                  title={t('navbar.signInSignUp')}
                >
                  <User size={28} />
                </button>
                {/* Login Modal */}
                <Sheet open={loginOpen} onOpenChange={setLoginOpen}>
                  <SheetContent side="right" className="bg-white border-gray-800 max-w-md w-full">
                    <LoginForm
                      onSuccess={() => {
                        setLoginOpen(false)
                        window.location.href = '/user/profile'
                      }}
                    />
                  </SheetContent>
                </Sheet>
              </>
            )}
            
            {/* Language Switcher (Modern style) - now rightmost on desktop */}
            <div className="hidden md:block">
              <LanguageSwitcher className="flex items-center space-x-2 h-10 px-2 rounded-full border-2 border-gray-300 hover:bg-gray-50 transition-colors duration-200" />
            </div>
            
            {/* Mobile menu button - visible only on mobile */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button className="md:hidden">
                  <Menu size={24} />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white border-gray-800">
                <div className="flex flex-col mt-10 space-y-3 px-2">
                  {/* Navigation links */}
                  {navItems.map(({ link, children }) => {
                    const hasChildren = children && children.length > 0
                    const isSubMenuOpen = openSubMenu === (link.url ?? link.label)
                    return (
                      <div key={link.url ?? link.label}>
                        {hasChildren ? (
                          <button
                            type="button"
                            className="flex items-center justify-between w-full gap-3 px-4 py-3 rounded-xl font-semibold text-base text-black hover:bg-gray-100 transition focus:outline-none"
                            onClick={() =>
                              setOpenSubMenu(isSubMenuOpen ? null : (link.url ?? link.label))
                            }
                          >
                            <span className="flex items-center gap-3">{link.label}</span>
                            <ChevronDown
                              size={18}
                              className={`transition-transform ${isSubMenuOpen ? 'rotate-180' : ''}`}
                            />
                          </button>
                        ) : (
                          <Link
                            href={renderNavItemUrl(link)}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base text-black hover:bg-gray-100 transition"
                          >
                            {link.label}
                          </Link>
                        )}
                        {/* Submenu */}
                        {hasChildren && isSubMenuOpen && isArray(children) && (
                          <div className="flex flex-col space-y-1 pl-8 py-2 bg-gray-50 rounded-lg animate-fade-in">
                            {children.map((child) => (
                              <Link
                                key={child.link?.url ?? child.link?.label}
                                href={renderNavItemUrl(child.link)}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-base text-black hover:bg-gray-200 transition"
                              >
                                <ChevronRight size={16} />
                                {child.link?.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {navigationItems.map(({ link }) =>
                    link.onClick ? (
                      <a
                        key={link.url ?? link.label}
                        href={link.url}
                        onClick={link.onClick}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base text-black hover:bg-gray-100 transition"
                      >
                        {/* Optionally add an icon here if you have one for this nav item */}
                        {link.label}
                      </a>
                    ) : link.isDropdown ? null : (
                      <Link
                        key={link.url ?? link.label}
                        href={link.url || '#'}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base text-black hover:bg-gray-100 transition"
                      >
                        {/* Optionally add an icon here if you have one for this nav item */}
                        {link.label}
                      </Link>
                    ),
                  )}
                  <hr className="my-2 border-gray-200" />
                  {/* User actions */}
                  {authData ? (
                    <>
                      <Link
                        href="/user/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-base text-black hover:bg-gray-100 transition"
                      >
                        <User size={20} />
                        {t('navbar.profile')}
                      </Link>
                      <form action={logout} className="w-full">
                        <button
                          type="submit"
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-base text-red-600 hover:bg-gray-100 transition w-full text-left"
                        >
                          <LogOut size={20} />
                          {t('navbar.logout')}
                        </button>
                      </form>
                    </>
                  ) : (
                    <button
                      className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105"
                      onClick={() => {
                        setIsOpen(false)
                        setLoginOpen(true)
                      }}
                      aria-label={t('navbar.signInSignUp')}
                      title={t('navbar.signInSignUp')}
                    >
                      <User size={24} /> {t('navbar.signInSignUp')}
                    </button>
                  )}
                  <hr className="my-2 border-gray-200" />
                  {/* Language Switcher for mobile */}
                  <div className="flex items-center justify-center py-2">
                    <LanguageSwitcher className="flex items-center space-x-2 h-10 px-4 py-2 rounded-full border-2 border-gray-300 hover:bg-gray-50 transition-colors duration-200" />
                  </div>
                  <hr className="my-2 border-gray-200" />
                  {/* Buy Ticket Now button for mobile */}
                  {shouldShowBuyTicketButton && (
                    <Link
                      href={eventTicketPath}
                      className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105"
                      onClick={() => setIsOpen(false)}
                    >
                      <Ticket size={22} />
                      {t('navbar.buyNow')}
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
      {/* Sticky Buy Ticket Now button for mobile, only when menu is closed */}
      {!isOpen && shouldShowBuyTicketButton && (
        <Link
          href={eventTicketPath}
          className="fixed bottom-4 right-4 z-[100] md:hidden flex gap-2 justify-center items-center bg-gray-900 min-w-40 hover:bg-gray-800 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105"
          style={{ minWidth: '44px', minHeight: '44px' }}
          aria-label="Buy Ticket Now"
        >
          <Ticket size={22} className="inline-block" />
          <span className="pr-1">{t('navbar.buyNow')}</span>
        </Link>
      )}
    </>
  )
}

export default Navbar
