'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { categories } from '@/components/EventDetail/data/seat-maps/categories'
import { useTranslate } from '@/providers/I18n/client'


// Response type from backend
export type CheckInResponse = {
  success: boolean
  message: string
  data?: {
    zoneId: string
    email: string
    ticketCode: string
    checkedInAt?: string
    attendeeName?: string
    eventName?: string
    sisterTickets?: {
      ticketCode: string
      attendeeName?: string
      seat?: string
    }[]
  }
}

interface CheckInResultProps {
  data: CheckInResponse['data']
  confirmed: boolean
  onReset: () => void
  onConfirm: () => void
}

const CheckInResult: React.FC<CheckInResultProps> = ({ data, confirmed, onReset, onConfirm }) => {
  const [selectedCodes, setSelectedCodes] = useState<string[]>([])
  const [bulkMode, setBulkMode] = useState<'none' | 'checkin' | 'given'>('none')
  const { toast } = useToast()
  const { t } = useTranslate()
  const zoneCategory = categories.find(cat => cat.id === data?.zoneId)
  const [ sisterCheckInResult, setSisterCheckInResult] = useState<string[]>([])
  const [ markGivenResult, setMarkGivenResult] = useState<string[]>([])

  const toggleSelection = (code: string) => {
    setSelectedCodes(prev => (prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]))
  }

  const bulkCheckIn = async () => {
    if (!selectedCodes.length) {
      toast({
        variant: 'destructive',
        title: t('customerCheckinTicket.noSelection'),
        description: t('customerCheckinTicket.selectAtLeastOneSisterTicket'),
      })
      return
    }
    try {
      const res = await fetch('/api/checkin-app/customer-checkin/sister-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCodeList: selectedCodes, email: data?.email }),
      })
      const json = await res.json()
      console.log('json', json)
      setSisterCheckInResult((prev) => [
        ...prev, 
        ...json.data.checkIns.map((item: {seat: string, ticketCode: string}) => item.ticketCode)
      ] )
      
      toast({
        title: t('customerCheckinTicket.bulkCheckInSuccess'),
        description: json.message || t('customerCheckinTicket.checkedInSelectedTickets'),
      })
      setSelectedCodes([])
      setBulkMode('none')
    } catch {
      toast({
        variant: 'destructive',
        title: t('error.bulkCheckInFailed'),
        description: t('error.bulkCheckInFailed'),
      })
    }
  }

  const bulkMarkGiven = async () => {
    if (!selectedCodes.length) {
      toast({
        variant: 'destructive',
        title: t('customerCheckinTicket.noSelection'),
        description: t('customerCheckinTicket.selectAtLeastOneTicket'),
      })
      return
    }
    const adminId = window.prompt('Enter admin ID:')
    if (!adminId) return
    try {
      const res = await fetch('/api/checkin-app/customer-checkin/given-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCodes: selectedCodes, email: data?.email, adminId }),
      })
      const json = await res.json()
      toast({
        title: t('customerCheckinTicket.bulkMarkGivenSuccess'),
        description: json.message || t('customerCheckinTicket.markedSelectedTicketsAsGiven'),
      })

      setMarkGivenResult((prev) => [
        ...prev, 
        ...json.data.updatedGivenTicketCode.map((item: {status: string, ticketCode: string}) => item.ticketCode)
      ])

      setSelectedCodes([])
      setBulkMode('none')
    } catch {
      toast({
        variant: 'destructive',
        title: t('error.bulkMarkGivenFailed'),
        description: t('error.bulkMarkGivenFailed'),
      })
    }
  }
  const shouldShowCheckbox = (sisterTicketCode: string) => (
    (bulkMode === 'checkin' && !sisterCheckInResult.includes(sisterTicketCode)) ||
    (bulkMode === 'given' && !markGivenResult.includes(sisterTicketCode))
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6 mb-6">
      {/* Colored info panel */}
      <div
        className="w-full max-w-md p-6 rounded-lg shadow-lg"
        style={{
          backgroundColor: zoneCategory?.color,
          background: confirmed
            ? zoneCategory?.color
            : `linear-gradient(to bottom, ${zoneCategory?.color}80 0%, ${zoneCategory?.color}30 100%)`,
        }}
      >
        <div className="text-center space-y-4 bg-white p-6 rounded-lg">
          <div
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
            style={{ backgroundColor: zoneCategory?.color }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="white"
              className="w-10 h-10"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">{t('customerCheckinTicket.checkInSuccessful')}</h2>
          <div className="space-y-2 text-gray-600">
            <div className="flex items-center justify-between p-2 rounded bg-gray-50">
              <span className="font-medium">{t('customerCheckinTicket.zone')}</span>
              <span className="font-bold" style={{ color: zoneCategory?.color }}>
                {zoneCategory?.name}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded">
              <span className="font-medium">{t('customerCheckinTicket.ticketCode')}</span>
              <span>{data?.ticketCode}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-gray-50">
              <span className="font-medium">{t('customerCheckinTicket.eventName')}</span>
              <span>{data?.eventName}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded">
              <span className="font-medium">{t('customerCheckinTicket.email')}</span>
              <span>{data?.email}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-gray-50">
              <span className="font-medium">{t('customerCheckinTicket.attendeeName')}</span>
              <span>{data?.attendeeName}</span>
            </div>
            {data?.checkedInAt && (
              <div className="flex items-center justify-between p-2 rounded">
                <span className="font-medium">{t('customerCheckinTicket.checkedInAt')}</span>
                <span>{new Date(data?.checkedInAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 text-center space-y-2 rounded-lg">
          <div className=" flex flex-col space-y-2">
            {!data?.sisterTickets && (
              <Button
                onClick={onConfirm}
                className="w-full text-white"
                style={{ backgroundColor: zoneCategory?.color }}
              >
                {t('customerCheckinTicket.ticketGiven')}
              </Button>
            )}
            <Button
              onClick={onReset}
              className="w-full bg-white text-black"
              style={{ borderColor: zoneCategory?.color, borderWidth: 1 }}
            >
              {t('customerCheckinTicket.checkInAnotherTicket')}
            </Button>
          </div>
        </div>
      </div>
      {/* Sister Tickets Panel */}
      <div className="w-full max-w-md bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-2">{t('customerCheckinTicket.sisterTickets')}</h3>
        {data?.sisterTickets && data?.sisterTickets.length > 0 && (
          <div className="w-full max-w-md flex gap-2 p-2 m-2">
            <Button
              variant="outline"
              onClick={() => setBulkMode('checkin')}
              className="flex-1"
            >
              {t('customerCheckinTicket.bulkCheckIn')}
            </Button>
            <Button
              variant="outline"
              onClick={() => setBulkMode('given')}
              className="flex-1"
            >
              {t('customerCheckinTicket.bulkMarkGiven')}
            </Button>
          </div>
        )}
        <ul className="space-y-2">
          {/* Original ticket always listed, checkbox only in 'given' */}
          <li className="flex items-center rounded">
            {bulkMode === 'given' && data?.ticketCode && !markGivenResult.includes(data?.ticketCode) && (
              <div
                className="w-full max-w-md p-6 rounded-lg shadow-lg"
                style={{
                  backgroundColor: zoneCategory?.color,
                  background: confirmed
                    ? zoneCategory?.color
                    : `linear-gradient(to bottom, ${zoneCategory?.color}80 0%, ${zoneCategory?.color}30 100%)`,
                }}
              >
                <div className=" space-y-4 bg-white p-6 rounded-lg">
                <span className=" inline-flex">
                  <input
                    type="checkbox"
                    checked={selectedCodes.includes(data?.ticketCode || '')}
                    onChange={() => toggleSelection(data?.ticketCode || '')}
                    className="w-4 h-4 inline-flex"
                  />
                  <span className="pl-2">
                    <strong>{data?.attendeeName || 'Unnamed'}</strong> – {data?.ticketCode}

                  </span>
                </span>
              </div>
              </div>
            )}
        </li>
        {/* List all sibling tickets, checkbox only in bulkMode */}
        {data?.sisterTickets &&
          data.sisterTickets.map(sister => (
            <li key={sister.ticketCode} className="flex items-center rounded">
              <div
                className="w-full max-w-md p-6 rounded-lg shadow-lg"
                style={{
                  backgroundColor: zoneCategory?.color,
                  background: confirmed
                    ? zoneCategory?.color
                    : `linear-gradient(to bottom, ${zoneCategory?.color}80 0%, ${zoneCategory?.color}30 100%)`,
                }}
              >
                <div className=" space-y-4 bg-white p-6 rounded-lg">
                  <span className="inline-flex">
                    { sister.ticketCode && shouldShowCheckbox(sister.ticketCode) && (
                      <input
                        type="checkbox"
                        checked={selectedCodes.includes(sister.ticketCode)}
                        onChange={() => toggleSelection(sister.ticketCode)}
                        className="w-4 h-4 inline-flex"
                      />
                    )}
                    <span className="pl-2">
                      <strong>{sister.attendeeName || 'Unnamed'}</strong> – {sister.ticketCode}
                      {sister.seat && <span className="text-xs"> (Seat: {sister.seat})</span>}
                    </span>
                  </span>
                </div>
              </div>
            </li>
          ))}
        {!data?.sisterTickets?.length && (
          <li className="p-2 text-sm text-gray-500">{t('customerCheckinTicket.noSisterTickets')}</li>
        )}
      </ul>
    </div>
      {/* Bulk action toggles & buttons */ }
  {
    bulkMode === 'checkin' && (
      <Button variant="secondary" onClick={bulkCheckIn} className="w-full max-w-md">
        {t('customerCheckinTicket.checkInSelected')}
      </Button>
    )
  }
  {
    bulkMode === 'given' && (
      <Button variant="secondary" onClick={bulkMarkGiven} className="w-full max-w-md">
        {t('customerCheckinTicket.markSelectedAsGiven')}
      </Button>
    )
  }
  {
    bulkMode !== 'none' && (
      <Button
        variant="outline"
        onClick={() => setBulkMode('none')}
        className="w-full max-w-md"
      >
        {t('customerCheckinTicket.cancelBulk')}
      </Button>
    )
  }
    </div >
  )
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
          title: t('customerCheckinTicket.checkInSuccessful'),
          description: t('customerCheckinTicket.checkInSuccessful'),
        })
      } else {
        const err: CheckInResponse = await response.json()
        toast({
          variant: 'destructive',
          title: t('error.failedToCheckIn'),
          description: err.message,
        })
      }
    } catch {
      toast({
        variant: 'destructive',
        title: t('error.failedToCheckIn'),
        description: t('error.failedToCheckIn'),
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

  const handleTicketGiven = async () => {
    const adminId = window.prompt('Enter admin ID:')
    if (!adminId) return
    const confirm = window.confirm(
      t('customerCheckinTicket.confirmTicketGiven', { adminId })
    )
    if (!confirm) return
    try {
      const response = await fetch('/api/checkin-app/customer-checkin/given-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCode: checkedInData?.ticketCode, adminId }),
      })
      if (response.ok) {
        setTicketGivenConfirmed(true)
        const res: CheckInResponse = await response.json()
        toast({
          title: t('customerCheckinTicket.confirmed'),
          description: res.message,
        })
      } else {
        const err: CheckInResponse = await response.json()
        toast({
          variant: 'destructive',
          title: t('error.failedToCheckIn'),
          description: err.message,
        })
      }
    } catch {
      toast({
        variant: 'destructive',
        title: t('error.unexpectedError'),
        description: t('error.unexpectedError'),
      })
    }
  }

  if (checkedInData) {
    return (
      <CheckInResult
        data={checkedInData}
        confirmed={ticketGivenConfirmed}
        onReset={resetForm}
        onConfirm={handleTicketGiven}
      />
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 space-y-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">{t('customerCheckinTicket.ticketCheckIn')}</h1>
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