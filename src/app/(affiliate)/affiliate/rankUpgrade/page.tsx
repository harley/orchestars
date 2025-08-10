'use client'

import React, { useState } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AffiliateSidebar } from '@/components/Affiliate/AffiliateSidebar'
import { ProtectedRoute } from '@/components/Affiliate/ProtectedRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AFFILIATE_RANKS } from '@/collections/Affiliate/constants'
import {
  EventAffiliateUserRank,
  AffiliateUserRank,
  EventAffiliateRank,
  AffiliateRank,
} from '@/payload-types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import useFetchData from '@/hooks/useFetchData'

export default function RankUpgradePage() {
  const { data, loading, error } = useFetchData<{
    globalRank: AffiliateRank
    eligibleEvents: { eventId: string; eventTitle: string; oldRank: EventAffiliateRank }[]
  }>(`/api/affiliate/event-rank-upgrade`, { defaultLoading: true })
  const [confirmedEvents, setConfirmedEvents] = useState<Set<string>>(new Set())
  const [termsOpenFor, setTermsOpenFor] = useState<string | null>(null)
  const [confirmingEventId, setConfirmingEventId] = useState<string | null>(null)

  const handleConfirm = async (eventId: string) => {
    try {
      setConfirmingEventId(eventId)

      const selectedEvent = data?.eligibleEvents.find((e) => e.eventId === eventId)
      if (!selectedEvent) return

      const res = await fetch('/api/affiliate/event-rank-upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventID: eventId,
          newRank: data?.globalRank as AffiliateRank,
        }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Unknown error')

      setConfirmedEvents((prev) => new Set([...prev, eventId]))
    } catch (err) {
      console.error(err)
      alert('Có lỗi xảy ra khi nâng hạng. Vui lòng thử lại.')
    } finally {
      setConfirmingEventId(null)
    }
  }

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
                      <div className="grid gap-4 md:grid-cols-2">
                        {notification.eligibleEvents.map((e) => (
                          <>
                            <Card key={e.eventId} className="relative shadow-md max-w-sm">
                              <CardHeader>
                                {confirmedEvents.has(e.eventId) && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
                                    <span className="text-2xl font-bold text-green-600 transform -rotate-12 border-4 border-green-600 px-4 py-2 rounded-lg">
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
                                  onClick={() => setTermsOpenFor(e.eventId)}
                                >
                                  Xem điều khoản
                                </Button>
                              </CardContent>
                            </Card>
                            <Dialog
                              open={!!termsOpenFor}
                              onOpenChange={() => setTermsOpenFor(null)}
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
                                      <li>Phần thưởng: Quà tặng 1</li>
                                      <li>Điểm yêu cầu: 500 điểm</li>
                                    </ul>
                                  </div>
                                  <div>
                                    <h3 className="font-bold mb-2 text-lg">
                                      Hạng mới: {notification.globalRank.rankNameLabel}
                                    </h3>
                                    <ul className="list-disc list-inside space-y-1 text-md">
                                      <li>Phần thưởng: Quà tặng cao cấp</li>
                                      <li>Điểm yêu cầu: 1000</li>
                                    </ul>
                                  </div>
                                </div>
                                <ul className="mt-4 text-sm">
                                  <li>
                                    - Nếu bạn ở lại hạng <strong>Bạc</strong>, bạn sẽ cần đạt thêm{' '}
                                    <strong>200 điểm</strong> nữa để nhận phần thưởng tiếp theo.
                                  </li>
                                  <li>
                                    - Nếu nâng hạng, điểm sẽ được <strong>Reset về 0</strong> và bạn
                                    sẽ <strong>Mất quyền nhận phần thưởng của hạng cũ</strong>. Vui
                                    lòng cân nhắc trước khi nâng hạng.
                                  </li>
                                </ul>
                                <DialogFooter className="mt-6">
                                  <Button
                                    className={`w-full text-white w-xl ${
                                      confirmedEvents.has(e.eventId)
                                        ? 'bg-gray-500 cursor-not-allowed'
                                        : 'bg-blue-500 hover:bg-blue-700'
                                    }`}
                                    disabled={
                                      confirmedEvents.has(e.eventId) ||
                                      confirmingEventId === e.eventId
                                    }
                                    onClick={() => handleConfirm(e.eventId)}
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
                          </>
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
