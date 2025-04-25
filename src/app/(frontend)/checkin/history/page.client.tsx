'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/CheckIn/useAuth'
import { Clock3, X } from 'lucide-react'
import { useTranslate } from '@/providers/I18n/client'
import { useToast } from '@/hooks/use-toast'

interface CheckinRecord {
  id: string
  ticketCode: string
  attendeeName: string
  eventTitle: string
  ticket: { seat?: string }
  checkInTime: string
  checkedInBy: { email: string }
}

export default function HistoryClientPage({ history = [] }: { history: CheckinRecord[] }) {
  const [checkins, setCheckins] = useState<CheckinRecord[]>(history)
  const router = useRouter()
  const { isHydrated, token } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const { t } = useTranslate()
  const { toast } = useToast()

  useEffect(() => {
    if (!isHydrated) return
    if (!token) {
      router.replace('/checkin')
      return
    }
  }, [isHydrated, token, router])

  const handleDelete = async (id: string) => {
    if (!confirm(t('checkin.confirmDeleteRecord'))) return
    try {
      const response = await fetch(`/api/checkin-app/checkin/${id}/delete-checkin`, {
        method: 'POST',
        headers: {
          Authorization: `JWT ${token}`,
        },
      })
      if (!response.ok) {
        const error = await response.json()
        toast({
          title: t('message.operationFailed'),
          description: error.message || t('checkin.failedToDeleteRecord'),
          variant: 'destructive',
        })
        return
      }
      setCheckins((prev) => prev.filter((item) => item.id !== id))
      alert(t('checkin.recordDeletedSuccessfully'))
    } catch (error: any) {
      alert(t('checkin.failedToDeleteRecord'))
      console.error('error, ', error)
      const messageError = error?.response?.data?.message || t('message.errorOccurred')
      toast({
        title: t('message.operationFailed'),
        description: messageError,
        variant: 'destructive',
      })
    }
  }

  const filteredCheckins = checkins.filter((item) => {
    const matchesSearch =
      item.ticketCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ticket?.seat?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  const goBack = () => {
    const eventId = localStorage.getItem('selectedEventId')
    const eventScheduleId = localStorage.getItem('selectedScheduleId')

    router.push(`/checkin/validates?eventId=${eventId}&scheduleId=${eventScheduleId}`)
  }

  return (
    <div className="min-h-screen bg-white pt-16 px-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('checkin.checkInHistory')}</h1>
        <button
          onClick={goBack}
          className="w-9 h-9 rounded-full border border-gray-900 flex items-center justify-center"
        >
          <X className="text-gray-900 w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <input
          type="text"
          placeholder={t('checkin.searchByTicketCodeOrSeat')}
          className="w-full md:w-1/2 border border-gray-300 rounded-full px-4 py-2 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <button
        type="button"
        onClick={goBack}
        className="mb-4 px-4 py-3 rounded-xl border-2 border-gray-900 text-gray-900 hover:bg-gray-100 transition"
      >
        {t('checkin.back')}
      </button>

      {/* History List */}
      <div className="space-y-4">
        {filteredCheckins?.length === 0 ? (
          <p className="text-center text-gray-400 mt-16">{t('checkin.noRecordsFound')}</p>
        ) : (
          filteredCheckins?.map((item) => (
            <div
              key={item.id}
              className="flex p-4 rounded-lg bg-gray-100 border-l-4 border-gray-900 shadow-sm"
            >
              <div className="flex-shrink-0 mt-1">
                <Clock3 className="text-gray-900" size={24} />
              </div>
              <div className="ml-4 py-2">
                <h3 className="text-sm font-semibold text-gray-800">
                  {item.ticketCode} — {item.attendeeName}
                </h3>
                <p className="text-sm text-gray-600">{item.eventTitle}</p>
                <p className="text-sm text-gray-600">
                  {t('checkin.seat')} {item.ticket?.seat || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  {t('checkin.checkedIn')} {item.checkInTime?.split('T')[0]}
                </p>
                <p className="text-sm text-gray-600">
                  {t('checkin.by')} {item.checkedInBy?.email}
                </p>
                <button
                  className="mt-2 text-sm text-red-500 hover:underline outline-red-500"
                  onClick={() => handleDelete(item.ticketCode)}
                >
                  <X className="inline-block mr-1" size={16} /> {t('checkin.delete')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
