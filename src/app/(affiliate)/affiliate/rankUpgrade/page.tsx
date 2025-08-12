'use client'

import React, { useState } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AffiliateSidebar } from '@/components/Affiliate/AffiliateSidebar'
import { ProtectedRoute } from '@/components/Affiliate/ProtectedRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EventAffiliateRank, AffiliateRank } from '@/payload-types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import useFetchData from '@/hooks/useFetchData'
import { useToast } from '@/components/ui/use-toast'
import { formatMoney } from '@/utilities/formatMoney'

type EligibleEvent = {
  eventId: number
  eventTitle: string
  oldRank: EventAffiliateRank
  oldRankGlobal: AffiliateRank
  newEventAffRank: EventAffiliateRank
}
type Reward = {
  commissionRate?: number | null
  minTickets?: number | null
  maxTickets?: number | null
  minRevenue?: number | null
  maxRevenue?: number | null
  rewardTickets?: number | null
}
type RewardBag =
  | {
      commissionRewards?: Reward[] | null
      ticketRewards?: Reward[] | null
    }
  | null
  | undefined

export default function RankUpgradePage() {
  const { toast } = useToast()
  const { data, loading, error } = useFetchData<{
    globalRank: AffiliateRank
    eligibleEvents: EligibleEvent[]
  }>(`/api/affiliate/event-rank-upgrade`, { defaultLoading: true })

  const [confirmedEvents, setConfirmedEvents] = useState<Set<number>>(new Set())
  const [termsOpenFor, setTermsOpenFor] = useState<number | null>(null)
  const [confirmingEventId, setConfirmingEventId] = useState<number | null>(null)

  const handleConfirm = async (eventId: number, eventName: string) => {
    try {
      setConfirmingEventId(eventId)
      const res = await fetch('/api/affiliate/event-rank-upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventID: Number(eventId),
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        toast({
          variant: 'destructive',
          title: 'Có lỗi xảy ra khi nâng hạng. Vui lòng thử lại.',
          description: `Sự kiện: ${eventName}`,
        })
        throw new Error(result.error || 'Unknown error')
      }
      toast({
        variant: 'success',
        title: 'Nâng hạng thành công!',
        description: `Sự kiện: ${eventName}`,
      })
      setConfirmedEvents((prev) => new Set([...prev, eventId]))
    } catch (err) {
      console.error(err)
      toast({
        variant: 'destructive',
        title: 'Có lỗi xảy ra khi nâng hạng. Vui lòng thử lại.',
        description: `Sự kiện: ${eventName}`,
      })
    } finally {
      setConfirmingEventId(null)
      setTermsOpenFor(null)
    }
  }
  const pickRewardsArray = (eventRewards: RewardBag, globalRewards: RewardBag): Reward[] => {
    const eComm = eventRewards?.commissionRewards ?? []
    const eTick = eventRewards?.ticketRewards ?? []
    const gComm = globalRewards?.commissionRewards ?? []
    const gTick = globalRewards?.ticketRewards ?? []

    if (eComm.length) return eComm
    if (eTick.length) return eTick
    if (gComm.length) return gComm
    if (gTick.length) return gTick
    return []
  }

  const getTickets = (r: Reward) => r?.rewardTickets ?? r?.minTickets ?? 'N/A'

  const getMinRevenue = (eventRewards: RewardBag, globalRewards: RewardBag): number | null => {
    const arr = pickRewardsArray(eventRewards, globalRewards)
    const values = arr
      .map((r) => (typeof r.minRevenue === 'number' ? r.minRevenue : null))
      .filter((v): v is number => v != null)
    return values.length ? Math.min(...values) : null
  }

  const {
    data: revenueCardMetrics,
    loading: loadingMetrics,
    error: errorMetrics,
    refetch: refetchMetrics,
  } = useFetchData(`/api/affiliate/revenue-card-metrics`, {
    defaultLoading: true,
  })

  const notification = data

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AffiliateSidebar />
          <SidebarInset className="flex-1">
            <div className="flex flex-col gap-4 p-4 pt-0">
              <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
                <div className="p-6">
                  {loading && <p>Đang tải thông báo...</p>}
                  {error && <p>Đã xảy ra lỗi khi tải thông báo.</p>}

                  {!loading && notification && (
                    <>
                      <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight">
                          Bạn đã đạt hạng tổng {notification.globalRank.rankNameLabel}!
                        </h1>
                        {notification.eligibleEvents.length !== 0 && (
                          <p className="text-muted-foreground">
                            Dưới đây là các sự kiện bạn có thể nâng hạng
                          </p>
                        )}
                        {notification.eligibleEvents.length === 0 && (
                          <p className="text-muted-foreground mt-5">
                            Bạn không có sự kiện nào đủ điều kiện nâng hạng.
                          </p>
                        )}
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        {notification.eligibleEvents.map((e) => (
                          <React.Fragment key={e.eventId}>
                            <Card className="relative shadow-md max-w-sm">
                              <CardHeader>
                                {confirmedEvents.has(e.eventId) && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                                    <span className="text-2xl font-bold text-green-600 -rotate-12 border-4 border-green-600 px-4 py-2 rounded-lg">
                                      Đã Nâng Hạng
                                    </span>
                                  </div>
                                )}
                                <CardTitle className="text-2xl">Sự kiện: {e.eventTitle}</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                  Hạng cũ: {e.oldRank.rankNameLabel} → Hạng mới:{' '}
                                  {notification.globalRank.rankNameLabel}
                                </p>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <Button
                                  className="w-lg bg-blue-400 border text-white hover:bg-gray-200"
                                  onClick={() => setTermsOpenFor(e.eventId)} // set selected
                                >
                                  Xem điều khoản
                                </Button>
                              </CardContent>
                            </Card>

                            {/* open only when this card is selected */}
                            <Dialog
                              open={termsOpenFor === e.eventId}
                              onOpenChange={(open) => !open && setTermsOpenFor(null)}
                            >
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>Điều khoản nâng hạng</DialogTitle>
                                </DialogHeader>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm text-muted-foreground">
                                  <div>
                                    <h3 className="font-bold mb-2 text-lg">
                                      Hạng cũ: {e.oldRank.rankNameLabel}
                                    </h3>
                                    <ul className="list-disc list-inside space-y-1 text-md">
                                      <li>
                                        Phần thưởng:{' '}
                                        {pickRewardsArray(
                                          e.oldRank.eventRewards,
                                          e.oldRankGlobal.rewards,
                                        ).length
                                          ? pickRewardsArray(
                                              e.oldRank.eventRewards,
                                              e.oldRankGlobal.rewards,
                                            ).map((reward, idx) => {
                                              const parts: string[] = []
                                              const tickets = getTickets(reward)
                                              if (tickets !== 'N/A') parts.push(`${tickets} Vé`)
                                              if (reward.commissionRate != null)
                                                parts.push(`${reward.commissionRate}% hoa hồng`)

                                              return (
                                                <span key={idx}>
                                                  {parts.join(', ')}
                                                  {idx <
                                                    pickRewardsArray(
                                                      e.newEventAffRank.eventRewards,
                                                      notification.globalRank.rewards,
                                                    ).length -
                                                      1 && '; '}
                                                </span>
                                              )
                                            })
                                          : 'Không có phần thưởng.'}
                                      </li>
                                      <li>
                                        Doanh thu tối thiểu:{' '}
                                        {formatMoney(
                                          getMinRevenue(
                                            e.oldRank.eventRewards,
                                            e.oldRankGlobal.rewards,
                                          ) || 0,
                                        )}
                                      </li>
                                    </ul>
                                  </div>
                                  <div className="mb-1">
                                    <h3 className="font-bold mb-2 text-lg">
                                      Hạng mới: {notification.globalRank.rankNameLabel}
                                    </h3>
                                    <ul className="list-disc list-inside space-y-1 text-md">
                                      <li>
                                        Phần thưởng:{' '}
                                        {pickRewardsArray(
                                          e.newEventAffRank.eventRewards,
                                          notification.globalRank.rewards,
                                        ).length
                                          ? pickRewardsArray(
                                              e.newEventAffRank.eventRewards,
                                              notification.globalRank.rewards,
                                            ).map((reward, idx) => {
                                              const parts: string[] = []
                                              const tickets = getTickets(reward)
                                              if (tickets !== 'N/A') parts.push(`${tickets} Vé`)
                                              if (reward.commissionRate != null)
                                                parts.push(`${reward.commissionRate}% hoa hồng`)

                                              return (
                                                <span key={idx}>
                                                  {parts.join(', ')}
                                                  {idx <
                                                    pickRewardsArray(
                                                      e.newEventAffRank.eventRewards,
                                                      notification.globalRank.rewards,
                                                    ).length -
                                                      1 && '; '}
                                                </span>
                                              )
                                            })
                                          : 'Không có phần thưởng.'}
                                      </li>
                                      <li>
                                        Doanh thu tối thiểu:{' '}
                                        {formatMoney(
                                          getMinRevenue(
                                            e.newEventAffRank.eventRewards,
                                            notification.globalRank.rewards,
                                          ) || 0,
                                        )}
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                                <ul className="list-decimal list-inside space-y-1 text-sm">
                                  <li>
                                    Nếu bạn ở lại hạng {e.oldRank.rankNameLabel}, bạn sẽ cần đạt
                                    thêm{' '}
                                    {/* <strong>
                                      {notification.globalRank.minPoints -
                                        e.oldRankGlobal.minPoints}{' '}
                                      điểm
                                    </strong> */}
                                    {(() => {
                                      const minRev = getMinRevenue(
                                        e.oldRank.eventRewards,
                                        e.oldRankGlobal.rewards,
                                      )
                                      return minRev == null ? null : Number(
                                          revenueCardMetrics?.netRevenue,
                                        ) < minRev ? (
                                        <>
                                          {' '}
                                          <strong>
                                            {formatMoney(minRev - revenueCardMetrics?.netRevenue)}{' '}
                                            doanh thu
                                          </strong>
                                        </>
                                      ) : (
                                        <>
                                          <strong>{formatMoney(0)} doanh thu</strong>
                                        </>
                                      )
                                    })()}{' '}
                                    nữa để nhận phần thưởng.
                                  </li>
                                  <li>
                                    Nếu nâng hạng, doanh thu sẽ được <strong>Reset về 0</strong> và
                                    bạn sẽ{' '}
                                    <strong>
                                      Mất quyền nhận phần thưởng của hạng cũ (
                                      {e.oldRank.rankNameLabel})
                                    </strong>
                                    .
                                  </li>
                                </ul>

                                <DialogFooter className="mt-6">
                                  <Button
                                    className={`w-full text-white w-xl ${confirmedEvents.has(e.eventId) ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'}`}
                                    disabled={
                                      confirmedEvents.has(e.eventId) ||
                                      confirmingEventId === e.eventId
                                    }
                                    onClick={() => handleConfirm(e.eventId, e.eventTitle)}
                                  >
                                    {confirmedEvents.has(e.eventId)
                                      ? 'Đã xác nhận'
                                      : confirmingEventId === e.eventId
                                        ? 'Đang gửi...'
                                        : 'Xác nhận nâng hạng'}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </React.Fragment>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
