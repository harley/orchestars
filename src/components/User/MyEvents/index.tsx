import EventCard from './EventCard'
import { useUserEvents } from '@/components/User/hooks/useUserEvents'
import { Loader2 } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useEffect } from 'react'
import { useTranslate } from '@/providers/I18n/client'

const MyEvents = ({ className }: { className?: string }) => {
  const { t } = useTranslate()
  const {
    events,
    isLoading,
    error,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
  } = useUserEvents()

  useEffect(() => {
    // Initial fetch
    void nextPage()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  return (
    <div className={`bg-white min-h-screen text-black font-sans p-6 ${className || ''}`}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold my-4">{t('userprofile.myEvents')}</h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-200 ease-in-out">
          {events?.map((event) => (
            <div
              key={event.id}
              className={`transform transition-all duration-200 ease-in-out ${
                isLoading ? 'opacity-50' : 'opacity-100'
              }`}
            >
              <EventCard event={event} />
            </div>
          ))}

          {isLoading && events.length === 0 && (
            <div className="flex justify-center py-8 col-span-full">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          )}

          {!isLoading && events.length === 0 && (
            <div className="text-center py-8 text-gray-500 col-span-full">
              {t('userprofile.noEvents')}
            </div>
          )}
        </div>

        {(hasNextPage || hasPrevPage) && (
          <Pagination>
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
    </div>
  )
}

export default MyEvents
