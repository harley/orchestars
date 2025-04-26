'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/providers/CheckIn/useAuth'
import { CheckCircle, XCircle } from 'lucide-react'
import { useState } from 'react'
import { categories } from '@/components/EventDetail/data/seat-maps/categories'
import { useTranslate } from '@/providers/I18n/client'
import { useToast } from '@/hooks/use-toast'

export default function TicketDetailsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { token } = useAuth()
  const { t } = useTranslate()
  const { toast } = useToast()
  const [isCheckingIn, setIsCheckingIn] = useState(false)

  const ticket = searchParams?.get('ticket')
  const checkinRecord = searchParams?.get('checkinRecord')

  const ticketData = ticket ? JSON.parse(decodeURIComponent(ticket)) : null
  const checkinData = checkinRecord ? JSON.parse(decodeURIComponent(checkinRecord)) : null
  const alreadyCheckedIn = !!checkinData

  const handleCheckIn = async () => {
    if (!ticketData?.code) return
    setIsCheckingIn(true)
    try {
      const res = await fetch(`/api/checkin-app/checkin/${ticketData.code}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${token}`,
        },
        body: JSON.stringify({ eventDate: ticketData.eventTime }),
      })
      if (!res.ok) {
        const err = await res.json()

        toast({
          title: 'Failed',
          description: err.message || t('error.failedToCheckIn'),
          variant: 'destructive',
        })

        return
      }
      toast({
        title: t('checkin.success'),
        description: t('checkin.ticketCheckedInSuccessfully'),
      })
      setTimeout(() => {
        router.back()
      }, 1500)
    } catch (err: any) {
      toast({
        title: 'Failed',
        description: err.message || t('error.failedToCheckIn'),
        variant: 'destructive',
      })
    } finally {
      setIsCheckingIn(false)
    }
  }

  if (!ticketData) {
    return (
      <div className="p-6 text-center text-red-500 font-semibold">
        {t('checkin.invalidTicketData')}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 px-4 py-3 rounded-xl border-2 border-gray-900 text-gray-900 hover:bg-gray-100 transition"
      >
        {t('checkin.back')}
      </button>

      <div
        className={`max-w-xl mx-auto rounded-xl p-6 text-white text-center ${
          alreadyCheckedIn && 'bg-red-500'
        }`}
        style={{
          backgroundColor: categories.find((c) => c.id === ticketData.ticketPriceInfo.key)?.color,
        }}
      >
        {alreadyCheckedIn ? (
          <XCircle size={60} className="mx-auto mb-2" />
        ) : (
          <CheckCircle size={60} className="mx-auto mb-2" />
        )}
        <h1 className="text-2xl font-bold mb-1">
          {alreadyCheckedIn ? t('checkin.ticketUsed') : t('checkin.validTicket')}
        </h1>
        <p className="text-lg font-semibold mb-4">#{ticketData.code}</p>

        {alreadyCheckedIn && (
          <div className="bg-white text-gray-800 rounded-md p-4 mb-4 text-left">
            <p>
              <strong>{t('checkin.checkedInAt')}</strong> {checkinData.checkInTime}
            </p>
            <p>
              <strong>{t('checkin.by')}</strong> {checkinData.checkedInBy?.email || 'N/A'}
            </p>
          </div>
        )}

        <div className="bg-white text-gray-800 rounded-md p-4 text-left mb-4">
          <h2 className="font-bold text-base mb-2">{t('checkin.ticketDetails')}</h2>
          <p>
            <strong>{t('checkin.name')}</strong> {ticketData.attendeeName}
          </p>
          <p>
            <strong>{t('checkin.event')}</strong> {ticketData.eventName}
          </p>
          <p>
            <strong>{t('checkin.date')}</strong> {ticketData.eventTime}
          </p>
          <p>
            <strong>{t('checkin.emailLabel')}</strong> {ticketData.email}
          </p>
          <p>
            <strong>{t('checkin.phoneNumber')}</strong> {ticketData.phoneNumber}
          </p>
          <p>
            <strong>{t('checkin.ticketType')}</strong> {ticketData.ticketPriceInfo.name}
          </p>
          <p>
            <strong>{t('checkin.seat')}</strong> {ticketData.seat || 'N/A'}
          </p>
        </div>

        <button
          onClick={handleCheckIn}
          disabled={alreadyCheckedIn || isCheckingIn}
          className={`w-full py-2 rounded-lg font-bold transition ${
            alreadyCheckedIn
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-white text-green-600 hover:bg-gray-100'
          }`}
        >
          {alreadyCheckedIn
            ? t('checkin.alreadyCheckedIn')
            : isCheckingIn
              ? t('checkin.checkingIn')
              : t('checkin.checkInNow')}
        </button>
      </div>
    </div>
  )
}
