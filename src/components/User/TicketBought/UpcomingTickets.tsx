import React, { useEffect } from 'react'
import { TicketCard } from './TicketCard'
import { useTickets } from '@/components/User/hooks/useTickets'
import { Loader2 } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useTranslate } from '@/providers/I18n/client'

const UpcomingTickets = ({ className }: { className?: string }) => {
  const { t } = useTranslate()
  const {
    tickets,
    isLoading,
    error,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
  } = useTickets({ type: 'upcoming' })

  useEffect(() => {
    void nextPage()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      <div className="grid gap-6 transition-opacity duration-200 ease-in-out">
        {tickets?.map((ticket) => (
          <div
            key={ticket.id}
            className={`transform transition-all duration-200 ease-in-out ${
              isLoading ? 'opacity-50' : 'opacity-100'
            }`}
          >
            <TicketCard ticket={ticket} />
          </div>
        ))}

        {isLoading && tickets.length === 0 && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8" />
          </div>
        )}

        {!isLoading && tickets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {t('userprofile.noUpcomingTickets')}
          </div>
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

export default UpcomingTickets
