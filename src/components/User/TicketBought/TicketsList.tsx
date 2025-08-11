import React, { useState } from 'react'
import { TicketCard } from './TicketCard'
import { Loader2 } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useTranslate } from '@/providers/I18n/client'
import { Ticket } from '@/types/Ticket'
import { GiftModal } from './GiftModal'

interface TicketProps {
  tickets: Ticket[]
  isLoading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  nextPage: () => void
  prevPage: () => void
  refresh: (page?: number, options?: { forceFetch?: boolean }) => void
}

const TicketsList = ({
  tickets,
  isLoading,
  error,
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  nextPage,
  prevPage,
  refresh,
}: TicketProps) => {
  const { t } = useTranslate()

  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  const onSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsGiftModalOpen(true)
  }

  const handleSuccessGiftTicket = () => {
    refresh(1, { forceFetch: true })
    setSelectedTicket(null)
    setIsGiftModalOpen(false)
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  return (
    <div>
      {/* Gift Modal */}
      {isGiftModalOpen && selectedTicket && (
        <GiftModal
          isOpen={isGiftModalOpen}
          onClose={() => setIsGiftModalOpen(false)}
          onSuccess={handleSuccessGiftTicket}
          ticketId={selectedTicket.id}
          ticket={selectedTicket}
        />
      )}

      <div className="grid gap-6 transition-opacity duration-200 ease-in-out">
        {tickets?.map((ticket) => (
          <div
            key={ticket.id}
            className={`transform transition-all duration-200 ease-in-out ${
              isLoading ? 'opacity-50' : 'opacity-100'
            }`}
          >
            <TicketCard ticket={ticket} onSelectTicket={onSelectTicket} />
          </div>
        ))}

        {isLoading && tickets.length === 0 && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}

        {!isLoading && tickets.length === 0 && (
          <div className="text-center py-8 text-gray-500">{t('userprofile.noTickets')}</div>
        )}
      </div>

      {(hasNextPage || hasPrevPage) && (
        <Pagination className="pt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={prevPage}
                disabled={!hasPrevPage || isLoading}
                aria-disabled={!hasPrevPage || isLoading}
              />
            </PaginationItem>
            {currentPage !== 0 && (
              <PaginationItem>
                <span className="flex h-9 items-center justify-center text-sm">
                  {t('userprofile.page', { current: currentPage, total: totalPages })}
                </span>
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext
                onClick={nextPage}
                disabled={!hasNextPage || isLoading}
                aria-disabled={!hasNextPage || isLoading}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

export default TicketsList
