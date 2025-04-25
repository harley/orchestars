'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { useTranslate } from '@/providers/I18n/client'
import { CheckinRecord } from '@/payload-types'
import CheckInResult from '@/components/CheckInResult'

type SisterTicket = {
  ticketCode: string
  attendeeName?: string
  seat?: string
  zoneId: string
  zoneName: string
  checkinRecord?: CheckinRecord
}

// Response type from backend
export type CheckInResponse = {
  success: boolean
  message: string
  data?: {
    zoneId: string
    zoneName: string
    email: string
    ticketCode: string
    checkedInAt?: string
    attendeeName?: string
    eventName?: string
    sisterTickets?: SisterTicket[]
    seat: string
  }
}

export default function CustomerCheckInPage() {
  const [email, setEmail] = useState('')
  const [ticketCode, setTicketCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [checkedInData, setCheckedInData] = useState<CheckInResponse['data']>()
  const [ticketGivenConfirmed, setTicketGivenConfirmed] = useState(false)
  const { toast } = useToast()
  const { t } = useTranslate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('/api/checkin-app/customer-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), ticketCode: ticketCode.trim() }),
      })
      if (response.ok) {
        const res: CheckInResponse = await response.json()
        setCheckedInData(res.data)
        toast({
          title: res.message,
          description: t('customerCheckinTicket.showTicket'),
        })
      } else {
        const err: CheckInResponse = await response.json()
        toast({
          variant: 'destructive',
          title: t('error.failedToCheckIn'),
          description: err.message,
        })
      }
    } catch (error: any) {
      console.error('error, ', error)
      const messageError = error?.response?.data?.message || t('message.errorOccurred')
      toast({
        title: t('error.failedToCheckIn'),
        description: messageError,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setCheckedInData(undefined)
    setEmail('')
    setTicketCode('')
    setTicketGivenConfirmed(false)
  }

  const [loadingTicketGiven, setLoadingTicketGiven] = useState(false)
  const handleTicketGiven = async () => {
    const adminId = window.prompt('Enter admin ID:')
    if (!adminId) return

    try {
      setLoadingTicketGiven(true)
      const response = await fetch('/api/checkin-app/customer-checkin/given-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCodes: [checkedInData?.ticketCode], adminId }),
      })
      if (response.ok) {
        setTicketGivenConfirmed(true)
        toast({
          title: t('customerCheckinTicket.success'),
          description: t('customerCheckinTicket.confirmed'),
        })
      } else {
        const err: CheckInResponse = await response.json()
        toast({
          variant: 'destructive',
          title: t('error.failedToCheckIn'),
          description: err.message,
        })
      }
    } catch (error: any) {
      console.error('error, ', error)
      const messageError = error?.response?.data?.message || t('message.errorOccurred')
      toast({
        title: t('message.operationFailed'),
        description: messageError,
        variant: 'destructive',
      })
    } finally {
      setLoadingTicketGiven(false)
    }
  }
  if (checkedInData) {
    return (
      <CheckInResult
        data={checkedInData}
        confirmed={ticketGivenConfirmed}
        onReset={resetForm}
        onConfirm={handleTicketGiven}
        confirmLoading={loadingTicketGiven}
      />
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 space-y-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">
          {t('customerCheckinTicket.ticketCheckIn')}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('customerCheckinTicket.enterYourEmail')}
            required
          />
          <Input
            type="text"
            value={ticketCode}
            onChange={(e) => setTicketCode(e.target.value)}
            placeholder={t('customerCheckinTicket.enterYourTicketCode')}
            required
          />
          <Button type="submit" className="w-full" variant="outline" disabled={isLoading}>
            {isLoading ? t('customerCheckinTicket.checkingIn') : t('customerCheckinTicket.checkIn')}
          </Button>
        </form>
      </div>
    </div>
  )
}
