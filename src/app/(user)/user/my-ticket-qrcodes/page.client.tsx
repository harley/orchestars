'use client'

import { useState, useEffect } from 'react'
import { TicketDetails } from './TicketDetails'
import type { Ticket, Event } from '@/payload-types'
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/pagination'
import { Navigation, Pagination } from 'swiper/modules'
import { getTicketClassColorNoCached } from '@/utilities/getTicketClassColor'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Filter } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslate } from '@/providers/I18n/client'
import './style.css'

interface TicketWithCheckIn {
  ticket: Ticket
  isCheckedIn: boolean
  checkedInAt: string | null
}

// Filter Component
function TicketFilters({
  selectedEventId,
  setSelectedEventId,
  selectedEventDate,
  setSelectedEventDate,
  events,
  eventsLoading,
  uniqueDates,
  filteredTickets,
  tickets,
  onClearFilters,
}: {
  selectedEventId: string
  setSelectedEventId: (value: string) => void
  selectedEventDate: string
  setSelectedEventDate: (value: string) => void
  events: Event[]
  eventsLoading: boolean
  uniqueDates: string[]
  filteredTickets: TicketWithCheckIn[]
  tickets: TicketWithCheckIn[]
  onClearFilters: () => void
}) {
  const { t } = useTranslate()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          {t('userprofile.myTicketQRCodes.filterTickets')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('userprofile.myTicketQRCodes.event')}</label>
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue placeholder={t('userprofile.myTicketQRCodes.selectEvent')} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200">
                <SelectItem value="all" className="hover:bg-gray-50">{t('userprofile.myTicketQRCodes.allEvents')}</SelectItem>
                {eventsLoading ? (
                  <SelectItem value="loading" disabled>{t('userprofile.myTicketQRCodes.loadingEvents')}</SelectItem>
                ) : (
                  events.map((event) => (
                    <SelectItem 
                      key={event.id} 
                      value={event.id.toString()}
                      className="hover:bg-gray-50"
                    >
                      {event.title || `Event ${event.id}`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('userprofile.myTicketQRCodes.eventDate')}</label>
            <Select 
              value={selectedEventDate} 
              onValueChange={setSelectedEventDate}
              disabled={selectedEventId === 'all'}
            >
              <SelectTrigger className="bg-white border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
                <SelectValue placeholder={selectedEventId === 'all' ? t('userprofile.myTicketQRCodes.selectEventFirst') : t('userprofile.myTicketQRCodes.allDates')} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200">
                <SelectItem value="all" className="hover:bg-gray-50">{t('userprofile.myTicketQRCodes.allDates')}</SelectItem>
                {selectedEventId === 'all' ? (
                  <SelectItem value="disabled" disabled className="text-gray-400">
                    {t('userprofile.myTicketQRCodes.selectEventToFilterDates')}
                  </SelectItem>
                ) : uniqueDates.length === 0 ? (
                  <SelectItem value="no-dates" disabled className="text-gray-400">
                    {t('userprofile.myTicketQRCodes.noScheduledDates')}
                  </SelectItem>
                ) : (
                  uniqueDates.map((date) => (
                    <SelectItem 
                      key={date} 
                      value={date}
                      className="hover:bg-gray-50"
                    >
                      {date}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedEventId === 'all' && (
              <p className="text-xs text-gray-500">
                {t('userprofile.myTicketQRCodes.selectEventToFilterDates')}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {selectedEventId === 'all' ? (
              t('userprofile.myTicketQRCodes.selectEventToViewTickets')
            ) : (
              <>
                {t('userprofile.myTicketQRCodes.showingTickets', { filtered: filteredTickets.length, total: tickets.length })}
                <span className="ml-2">
                  • {t('userprofile.myTicketQRCodes.eventLabel', { eventTitle: events.find(e => e.id.toString() === selectedEventId)?.title || 'Unknown' })}
                </span>
                {selectedEventDate !== 'all' && (
                  <span className="ml-2">
                    • {t('userprofile.myTicketQRCodes.dateLabel', { date: selectedEventDate })}
                  </span>
                )}
              </>
            )}
          </span>
          {(selectedEventId !== 'all' || selectedEventDate !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
            >
              {t('userprofile.myTicketQRCodes.clearAllFilters')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Header Component
function PageHeader({ showFilters, setShowFilters }: { showFilters: boolean; setShowFilters: (value: boolean) => void }) {
  const { t } = useTranslate()
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">{t('userprofile.myTicketQRCodes.title')}</h1>
        <p className="text-gray-600 mt-2">
          {t('userprofile.myTicketQRCodes.subtitle')}
        </p>
      </div>
      
      <Button
        onClick={() => setShowFilters(!showFilters)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Filter className="w-4 h-4" />
        {showFilters ? t('userprofile.myTicketQRCodes.hideFilters') : t('userprofile.myTicketQRCodes.showFilters')}
      </Button>
    </div>
  )
}

// Loading Component
function LoadingSpinner() {
  const { t } = useTranslate()
  
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">{t('userprofile.myTicketQRCodes.loadingTickets')}</p>
      </div>
    </div>
  )
}

// Welcome Message Component
function WelcomeMessage() {
  const { t } = useTranslate()
  
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="pt-6">
        <div className="text-center">
          <p className="text-blue-800 mb-3">
            {t('userprofile.myTicketQRCodes.welcomeMessage')}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// No Tickets Message Component
function NoTicketsMessage({ message, showClearButton, onClearFilters }: { 
  message: string; 
  showClearButton?: boolean; 
  onClearFilters?: () => void 
}) {
  const { t } = useTranslate()
  
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-bold mb-4">{message}</h1>
      <p className="text-gray-600 mb-6">
        {showClearButton ? t('userprofile.myTicketQRCodes.tryAdjustingFilters') : t('userprofile.myTicketQRCodes.noTicketsForEvent')}
      </p>
      {showClearButton && onClearFilters && (
        <Button onClick={onClearFilters}>
          {t('userprofile.myTicketQRCodes.clearFilters')}
        </Button>
      )}
    </div>
  )
}

// Ticket Navigation Component
function TicketNavigation({
  current,
  totalTickets,
  inputValue,
  onPrev,
  onNext,
  onInputChange,
  onInputCommit,
}: {
  current: number
  totalTickets: number
  inputValue: string
  onPrev: () => void
  onNext: () => void
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onInputCommit: () => void
}) {
  const { t } = useTranslate()
  
  return (
    <div className="ticket-index-bar-ui flex items-center justify-center gap-2 w-full p-1 sm:p-2 rounded-t-lg bg-white text-base sm:text-lg z-10">
      <Button
        onClick={onPrev}
        disabled={current === 0}
        variant="ghost"
        size="icon"
        className={`nav-btn ${current === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
        aria-label={t('userprofile.myTicketQRCodes.previousTicket')}
      >
        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </Button>
      <input
        type="text"
        value={inputValue}
        onChange={onInputChange}
        onBlur={onInputCommit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            ;(e.target as HTMLInputElement).blur()
          }
        }}
        className="ticket-index-input w-10 sm:w-12 text-center border border-gray-300 focus:border-primary outline-none transition-all duration-200 bg-transparent text-base sm:text-lg font-semibold rounded focus:bg-gray-100 mx-1"
        style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
        aria-label={t('userprofile.myTicketQRCodes.goToTicketNumber')}
        inputMode="numeric"
        pattern="[0-9]*"
      />
      <span className="text-gray-500 text-base sm:text-lg">/ {totalTickets}</span>
      <Button
        onClick={onNext}
        disabled={current === totalTickets - 1}
        variant="ghost"
        size="icon"
        className={`nav-btn ${current === totalTickets - 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
        aria-label={t('userprofile.myTicketQRCodes.nextTicket')}
      >
        <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </Button>
    </div>
  )
}

// Ticket Viewer Component
function TicketViewer({
  filteredTickets,
  current,
  setSwiperInstance,
  setCurrent,
}: {
  filteredTickets: TicketWithCheckIn[]
  current: number
  setSwiperInstance: (swiper: SwiperClass) => void
  setCurrent: (index: number) => void
}) {
  const currentTicket = filteredTickets[current]
  const ticketClassColor = getTicketClassColorNoCached(currentTicket?.ticket?.ticketPriceInfo)

  return (
    <div
      className="flex flex-col items-center w-full h-full py-6 sm:py-10 min-h-[600px] relative rounded-lg"
      style={{
        backgroundColor: ticketClassColor?.color || '#6B7280',
      }}
    >
      <div className="w-full max-w-md mx-auto bg-white rounded-b-md shadow-md py-4">
        <div className="relative w-full sm:pt-6 sm:px-8 pt-3 px-3 pb-3 bg-white rounded-b-md">
          <Swiper
            modules={[Pagination, Navigation]}
            pagination={{ clickable: true, type: 'progressbar' }}
            spaceBetween={16}
            slidesPerView={1}
            onSlideChange={(swiper) => setCurrent(swiper.activeIndex)}
            className="w-full flex-1 flex items-center justify-center pt-2"
            navigation={false}
            onSwiper={setSwiperInstance}
            speed={300}
          >
            {filteredTickets.map((ticketData, idx) => (
              <SwiperSlide key={ticketData.ticket.id + idx} className="w-full flex justify-center">
                <TicketDetails
                  ticket={ticketData.ticket}
                  isCheckedIn={ticketData.isCheckedIn}
                  checkedInAt={ticketData.checkedInAt}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  )
}

// Ticket Summary Component
function TicketSummary({ tickets }: { tickets: TicketWithCheckIn[] }) {
  const { t } = useTranslate()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('userprofile.myTicketQRCodes.ticketSummary')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{tickets.length}</div>
            <div className="text-sm text-gray-600">{t('userprofile.myTicketQRCodes.totalTickets')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {tickets.filter(t => t.isCheckedIn).length}
            </div>
            <div className="text-sm text-gray-600">{t('userprofile.myTicketQRCodes.checkedIn')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {tickets.filter(t => !t.isCheckedIn).length}
            </div>
            <div className="text-sm text-gray-600">{t('userprofile.myTicketQRCodes.pending')}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MyTicketQRCodesPageClient() {
  const { t, locale } = useTranslate()
  const [tickets, setTickets] = useState<TicketWithCheckIn[]>([])
  const [filteredTickets, setFilteredTickets] = useState<TicketWithCheckIn[]>([])
  const [loading, setLoading] = useState(false)
  const [current, setCurrent] = useState(0)
  const [swiperInstance, setSwiperInstance] = useState<SwiperClass | null>(null)
  const [inputValue, setInputValue] = useState('1')
  
  // Filter states - always show filters by default
  const [selectedEventId, setSelectedEventId] = useState<string>('all')
  const [selectedEventDate, setSelectedEventDate] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(true)

  // Events state
  const [events, setEvents] = useState<Event[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)

  // Get unique dates for filtering from selected event schedules
  const getUniqueDatesFromSelectedEvent = () => {
    if (selectedEventId === 'all') return []
    
    const selectedEvent = events.find(event => event.id.toString() === selectedEventId)
    if (!selectedEvent || !selectedEvent.schedules) return []
    
    // Create a map of scheduleId to formatted date for easy lookup
    const scheduleDateMap = new Map<string, string>()
    
    selectedEvent.schedules.forEach(schedule => {
      if (schedule.id && schedule.date) {
        const formattedDate = new Date(schedule.date).toLocaleDateString(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        scheduleDateMap.set(schedule.id, formattedDate)
      }
    })
    
    // Return unique dates sorted chronologically
    const uniqueDates = [...new Set(scheduleDateMap.values())].sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    )
    
    return uniqueDates
  }

  const uniqueDates = getUniqueDatesFromSelectedEvent()

  // Helper function to get schedule ID from date
  const getScheduleIdFromDate = (dateString: string): string | null => {
    if (selectedEventId === 'all') return null
    
    const selectedEvent = events.find(event => event.id.toString() === selectedEventId)
    if (!selectedEvent || !selectedEvent.schedules) return null
    
    const schedule = selectedEvent.schedules.find(schedule => {
      if (schedule.id && schedule.date) {
        const formattedDate = new Date(schedule.date).toLocaleDateString(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        return formattedDate === dateString
      }
      return false
    })
    
    return schedule?.id || null
  }

  // Fetch user events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setEventsLoading(true)
        const response = await fetch('/api/user/events')
        
        if (response.ok) {
          const data = await response.json()
          setEvents(data.data?.docs || [])
        } else {
          console.error('Failed to fetch events:', response.statusText)
        }
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setEventsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Fetch user tickets
  useEffect(() => {
    const fetchTickets = async () => {
      if (selectedEventId === 'all') {
        setTickets([])
        setFilteredTickets([])
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        const response = await fetch(`/api/user/tickets/${selectedEventId}`)
        
        if (response.ok) {
          const data = await response.json()
          setTickets(data.tickets)
          setFilteredTickets(data.tickets)
        } else {
          console.error('Failed to fetch tickets:', response.statusText)
          setTickets([])
          setFilteredTickets([])
        }
      } catch (error) {
        console.error('Error fetching tickets:', error)
        setTickets([])
        setFilteredTickets([])
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [selectedEventId])

  // Reset date filter when event changes
  useEffect(() => {
    setSelectedEventDate('all')
  }, [selectedEventId])

  // Apply filters
  useEffect(() => {
    let filtered = [...tickets]

    if (selectedEventDate !== 'all') {
      // Get the schedule ID for the selected date
      const scheduleId = getScheduleIdFromDate(selectedEventDate)
      
      if (!scheduleId) {
        console.log('No schedule ID found for selected date:', selectedEventDate)
        setFilteredTickets([])
        return
      }
      
      // Filter tickets by eventScheduleId
      filtered = filtered.filter(t => {
        const matches = t.ticket.eventScheduleId === scheduleId
        console.log(`Ticket ${t.ticket.id}: eventScheduleId ${t.ticket.eventScheduleId} matches ${scheduleId}? ${matches}`)
        return matches
      })
    }

    setFilteredTickets(filtered)
    setCurrent(0)
    setInputValue('1')
  }, [tickets, selectedEventDate, locale, selectedEventId, events])

  // Navigation handlers
  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1)
  }

  const handleNext = () => {
    if (current < filteredTickets.length - 1) setCurrent(current + 1)
  }

  // Sync inputValue with current
  useEffect(() => {
    setInputValue((current + 1).toString())
  }, [current])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '')
    setInputValue(val)
  }

  // Handle input blur or Enter
  const handleInputCommit = () => {
    let num = parseInt(inputValue, 10)
    if (isNaN(num) || num < 1) num = 1
    if (num > filteredTickets.length) num = filteredTickets.length
    setCurrent(num - 1)
  }

  // Swiper slide change
  useEffect(() => {
    if (swiperInstance) {
      swiperInstance.slideTo(current)
    }
  }, [current, swiperInstance])

  // Clear filters handler
  const handleClearFilters = () => {
    setSelectedEventId('all')
    setSelectedEventDate('all')
  }

  return (
    <div className="space-y-6">
      <PageHeader showFilters={showFilters} setShowFilters={setShowFilters} />

      {/* Always show filters */}
      <TicketFilters
        selectedEventId={selectedEventId}
        setSelectedEventId={setSelectedEventId}
        selectedEventDate={selectedEventDate}
        setSelectedEventDate={setSelectedEventDate}
        events={events}
        eventsLoading={eventsLoading}
        uniqueDates={uniqueDates}
        filteredTickets={filteredTickets}
        tickets={tickets}
        onClearFilters={handleClearFilters}
      />

      {/* Show loading only when fetching tickets, not the full page */}
      {loading && selectedEventId !== 'all' ? (
        <LoadingSpinner />
      ) : selectedEventId === 'all' ? (
        <WelcomeMessage />
      ) : !tickets.length ? (
        <NoTicketsMessage message={t('userprofile.myTicketQRCodes.noTicketsFound')} />
      ) : !filteredTickets.length ? (
        <NoTicketsMessage 
          message={t('userprofile.myTicketQRCodes.noTicketsMatchFilters')} 
          showClearButton={true} 
          onClearFilters={handleClearFilters}
        />
      ) : (
        <>
          {/* Ticket Viewer with Navigation */}
          <div className="w-full max-w-md mx-auto bg-white rounded-b-md shadow-md py-4">
            <TicketNavigation
              current={current}
              totalTickets={filteredTickets.length}
              inputValue={inputValue}
              onPrev={handlePrev}
              onNext={handleNext}
              onInputChange={handleInputChange}
              onInputCommit={handleInputCommit}
            />
            <TicketViewer
              filteredTickets={filteredTickets}
              current={current}
              setSwiperInstance={setSwiperInstance}
              setCurrent={setCurrent}
            />
          </div>

          {/* Ticket Summary */}
          <TicketSummary tickets={tickets} />
        </>
      )}
    </div>
  )
}
