import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { CheckinRecord } from '@/payload-types'
import { useTranslate } from '@/providers/I18n/client'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { categories } from '../EventDetail/data/seat-maps/categories'
import { Loader2 } from 'lucide-react'

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

interface CheckInResultProps {
  data: CheckInResponse['data']
  confirmed: boolean
  onReset: () => void
  onConfirm: () => void
  confirmLoading?: boolean
}

const CheckInResult: React.FC<CheckInResultProps> = ({
  data,
  confirmed,
  onReset,
  onConfirm,
  confirmLoading,
}) => {
  const [selectedCodes, setSelectedCodes] = useState<string[]>([])
  const [bulkMode, setBulkMode] = useState<'none' | 'given'>('none')
  const { toast } = useToast()
  const { t } = useTranslate()
  const zoneCategory = (zoneId: string | undefined) => {
    return categories.find((cat) => cat.id === zoneId)
  }

  const [markGivenResult, setMarkGivenResult] = useState<string[]>([])

  const toggleSelection = (code: string) => {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    )
  }

  const [bulkLoading, setBulkLoading] = useState(false)
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
      setBulkLoading(true)
      const res = await fetch('/api/checkin-app/customer-checkin/given-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCodes: selectedCodes, email: data?.email, adminId }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast({
          variant: 'destructive',
          title: t('error.bulkMarkGivenFailed'),
          description: json.message || t('error.bulkMarkGivenFailed'),
        })
        return
      }
      toast({
        title: t('customerCheckinTicket.success'),
        description: t('customerCheckinTicket.markedSelectedTicketsAsGiven'),
      })

      setMarkGivenResult((prev) => [
        ...prev,
        ...json.data.updatedGivenTicketCode
          .filter((item: { status: string; ticketCode: string }) => item.status === 'updated')
          .map((item: { status: string; ticketCode: string }) => item.ticketCode),
      ])

      setSelectedCodes([])
      setBulkMode('none')
    } catch {
      toast({
        variant: 'destructive',
        title: t('error.bulkMarkGivenFailed'),
        description: t('error.bulkMarkGivenFailed'),
      })
    } finally {
      setBulkLoading(false)
    }
  }
  const shouldShowCheckbox = (sisterTicketCode: string) =>
    bulkMode === 'given' && !markGivenResult.includes(sisterTicketCode)

  const [loadingSisterTickets, setLoadingSisterTickets] = useState(true)
  const [sisterTicketsData, setSisterTicketsData] = useState<SisterTicket[]>([])
  const loadSisterTickets = useCallback(async () => {
    try {
      setLoadingSisterTickets(true)
      const qsStr = new URLSearchParams({
        ticketCode: data?.ticketCode || '',
      }).toString()

      const res = await fetch(`/api/checkin-app/customer-checkin/sister-checkin?${qsStr}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        const json = await res.json()
        setSisterTicketsData(json.data.sisterTickets)
      }
    } catch (error) {
      console.error('Error loading sister tickets:', error)
    } finally {
      setLoadingSisterTickets(false)
    }
  }, [data?.ticketCode])

  useEffect(() => {
    loadSisterTickets()
  }, [loadSisterTickets])

  const sisterTickets = useMemo(() => {
    const groupByZone = categories.reduce(
      (obj, cate) => {
        const seatsByZone = sisterTicketsData?.filter((sister) => sister.zoneId === cate.id) || []
        if (seatsByZone.length) {
          obj[cate.id] = {
            zoneName: seatsByZone[0]?.zoneName || '',
            seats: seatsByZone,
          }
        }

        return obj
      },
      {} as Record<string, { zoneName: string; seats: SisterTicket[] }>,
    )

    return groupByZone
  }, [sisterTicketsData])

  const areAllSisterTicketsCheckedIn = useMemo(() => {
    // If there are no sister tickets, return false
    if (Object.keys(sisterTickets).length === 0) {
      return false
    }

    // Check if all tickets in all zones have checkinRecord
    for (const zoneId in sisterTickets) {
      const zone = sisterTickets[zoneId]
      for (const seat of zone?.seats || []) {
        if (!seat.checkinRecord && !markGivenResult.includes(seat.ticketCode || '')) {
          return false
        }
      }
    }

    // All tickets have checkinRecord
    return true
  }, [sisterTickets, markGivenResult])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6 mb-6 pt-14">
      {/* Colored info panel */}
      {data && (
        <div
          className="w-full max-w-md md:max-w-6xl p-6 rounded-lg shadow-lg"
          style={{
            backgroundColor: zoneCategory(data.zoneId)?.color,
            background: markGivenResult.includes(data?.ticketCode || '')
              ? zoneCategory(data.zoneId)?.color
              : `linear-gradient(to bottom, ${zoneCategory(data.zoneId)?.color}80 0%, ${zoneCategory(data.zoneId)?.color}30 100%)`,
          }}
        >
          <div className="text-center space-y-4 bg-white p-6 rounded-lg">
            <div
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
              style={{ backgroundColor: zoneCategory(data.zoneId)?.color }}
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

            <h2 className="text-2xl font-bold">
              {confirmed
                ? t('customerCheckinTicket.confirmedSuccessfully')
                : t('customerCheckinTicket.checkInSuccessful')}
            </h2>

            <div className="space-y-2 text-gray-600">
              <div className="flex items-center justify-between p-2 rounded bg-gray-50">
                <span className="font-medium">{t('customerCheckinTicket.zone')}</span>
                <span className="font-bold" style={{ color: zoneCategory(data.zoneId)?.color }}>
                  {data.zoneName}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded">
                <span className="font-medium">{t('customerCheckinTicket.ticketCode')}</span>
                <span>{data?.ticketCode}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded">
                <span className="font-medium">{t('customerCheckinTicket.seat')}</span>
                <span>{data?.seat}</span>
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
              {!confirmed && (
                <Button
                  onClick={onConfirm}
                  className="w-full text-white"
                  disabled={
                    confirmLoading ||
                    bulkLoading ||
                    markGivenResult.includes(data?.ticketCode || '')
                  }
                  style={{ backgroundColor: zoneCategory(data.zoneId)?.color }}
                >
                  {confirmLoading && (
                    <Loader2 className={'my-28 h-16 w-16 text-primary/60 animate-spin'} />
                  )}
                  {t('customerCheckinTicket.confirmValidTicket')}
                </Button>
              )}

              <Button
                onClick={onReset}
                className="w-full bg-white text-black"
                style={{ borderColor: zoneCategory(data.zoneId)?.color, borderWidth: 1 }}
                disabled={confirmLoading || bulkLoading}
              >
                {t('customerCheckinTicket.checkInAnotherTicket')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sister Tickets Panel */}
      <div className="w-full max-w-md md:max-w-6xl bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-2">{t('customerCheckinTicket.sisterTickets')}</h3>
        {sisterTicketsData.length > 0 && bulkMode !== 'given' && !areAllSisterTicketsCheckedIn && (
          <div className="w-full flex mb-4">
            <Button variant="outline" onClick={() => setBulkMode('given')} className="flex-1">
              {t('customerCheckinTicket.bulkMarkGiven')}
            </Button>
          </div>
        )}

        <div className="flex flex-row space-x-2">
          {bulkMode === 'given' && (
            <Button
              variant="secondary"
              onClick={bulkMarkGiven}
              disabled={bulkLoading || confirmLoading}
              className="ml-auto w-full mb-4 flex justify-center items-center"
            >
              {bulkLoading && (
                <Loader2 className={'my-28 h-16 w-16 text-primary/60 animate-spin'} />
              )}
              {t('customerCheckinTicket.markSelectedAsGiven')}
            </Button>
          )}
        </div>

        {loadingSisterTickets ? (
          <div>Loading...</div>
        ) : (
          <>
            {Object.entries(sisterTickets).map(([zoneId, zone]) => {
              return (
                <React.Fragment key={zoneId}>
                  <div className="">
                    <h3 className="text-lg font-semibold mb-2">{zone.zoneName}</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {zone.seats.map((sister) => {
                        return (
                          <button
                            key={sister.ticketCode}
                            className="w-full max-w-md p-4 rounded-lg shadow-lg"
                            style={{
                              backgroundColor: zoneCategory(sister.zoneId)?.color,
                              background:
                                sister.checkinRecord ||
                                markGivenResult.includes(sister.ticketCode || '')
                                  ? zoneCategory(sister.zoneId)?.color
                                  : `linear-gradient(to bottom, ${zoneCategory(sister.zoneId)?.color}80 0%, ${zoneCategory(sister.zoneId)?.color}30 100%)`,
                            }}
                            disabled={
                              !!sister.checkinRecord ||
                              markGivenResult.includes(sister.ticketCode || '')
                            }
                            onClick={() => toggleSelection(sister.ticketCode)}
                          >
                            <div className="text-left bg-white p-2 rounded-lg">
                              <span className="flex items-center justify-between pr-2">
                                <div className="flex items-center">
                                  {sister.ticketCode &&
                                    !sister.checkinRecord &&
                                    shouldShowCheckbox(sister.ticketCode) && (
                                      <input
                                        type="checkbox"
                                        checked={selectedCodes.includes(sister.ticketCode)}
                                        onChange={(e) => toggleSelection(sister.ticketCode)}
                                        className="w-4 h-4 inline-flex cursor-pointer"
                                      />
                                    )}

                                  <span className="pl-2">
                                    <span>{sister.attendeeName || 'Unnamed'}</span>
                                    <br />
                                    <b>{sister.ticketCode}</b>
                                    <br />
                                    {sister.seat && (
                                      <span className="text-sm">
                                        {' '}
                                        (Seat: <b>{sister.seat}</b>)
                                      </span>
                                    )}
                                  </span>
                                </div>

                                {(sister.checkinRecord ||
                                  markGivenResult.includes(sister.ticketCode || '')) && (
                                  <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{
                                      backgroundColor: zoneCategory(sister.zoneId)?.color,
                                    }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={2}
                                      stroke="white"
                                      className="w-10 h-10"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4.5 12.75l6 6 9-13.5"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <Separator className="my-6" />
                </React.Fragment>
              )
            })}
            {!sisterTicketsData?.length && (
              <div className="p-2 text-sm text-gray-500">
                {t('customerCheckinTicket.noSisterTickets')}
              </div>
            )}
          </>
        )}
      </div>
      {/* Bulk action toggles & buttons */}
    </div>
  )
}

export default CheckInResult
