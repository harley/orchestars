'use client'

import React, { useState } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AffiliateSidebar } from '@/components/Affiliate/AffiliateSidebar'
import { ProtectedRoute } from '@/components/Affiliate/ProtectedRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    type: string
    rank: string
    eligibleEvents: { eventId: string; oldRank: string; newRank: string }[]
    timestamp: number
  }>(`/api/affiliate/event-rank-upgrade`, { defaultLoading: true })
  console.log(data)
  const [confirmedEvents, setConfirmedEvents] = useState<Set<string>>(new Set())
  const [termsOpenFor, setTermsOpenFor] = useState<string | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState<Set<string>>(new Set())
  const [confirmingEventId, setConfirmingEventId] = useState<string | null>(null)

  const handleAcceptTerms = (eventId: string) => {
    setAcceptedTerms((prev) => new Set([...prev, eventId]))
    setTermsOpenFor(null)
  }

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
          newRank: data?.rank,
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
                      <h1 className="text-2xl font-bold mb-4">
                        🎉 Bạn đã được nâng lên hạng {notification.rank}
                      </h1>
                      <div className="grid gap-4 md:grid-cols-2">
                        {notification.eligibleEvents.length === 0 && (
                          <p>Không có sự kiện nào đủ điều kiện nâng hạng.</p>
                        )}
                        {notification.eligibleEvents.map((e) => (
                          <Card key={e.eventId} className="shadow-md">
                            <CardHeader>
                              <CardTitle>Sự kiện: {e.eventId}</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                Hạng cũ: {e.oldRank} → Hạng mới: {notification.rank}
                              </p>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <Button
                                className="w-full bg-blue-500 border text-white hover:bg-gray-200"
                                onClick={() => setTermsOpenFor(e.eventId)}
                              >
                                Xem điều khoản thưởng
                              </Button>
                              <Button
                                className={`w-full text-white ${
                                  confirmedEvents.has(e.eventId)
                                    ? 'bg-gray-500 cursor-not-allowed'
                                    : acceptedTerms.has(e.eventId)
                                      ? 'bg-blue-500 hover:bg-blue-700'
                                      : 'bg-gray-500 cursor-not-allowed'
                                }`}
                                disabled={
                                  confirmedEvents.has(e.eventId) ||
                                  !acceptedTerms.has(e.eventId) ||
                                  confirmingEventId === e.eventId
                                }
                                onClick={() => handleConfirm(e.eventId)}
                              >
                                {confirmedEvents.has(e.eventId)
                                  ? 'Đã xác nhận'
                                  : confirmingEventId === e.eventId
                                    ? 'Đang gửi...'
                                    : acceptedTerms.has(e.eventId)
                                      ? 'Xác nhận nâng hạng'
                                      : 'Hãy đọc điều khoản trước'}
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <Dialog open={!!termsOpenFor} onOpenChange={() => setTermsOpenFor(null)}>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>📜 Điều khoản nâng hạng</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm text-muted-foreground">
                            <div>
                              <h3 className="font-semibold mb-2">🎖 Hạng cũ: Bạc</h3>
                              <ul className="list-disc list-inside space-y-1">
                                <li>Phần thưởng: Quà tặng 1</li>
                                <li>Điểm yêu cầu: 500 điểm</li>
                              </ul>
                            </div>
                            <div>
                              <h3 className="font-semibold mb-2">🏆 Hạng mới: Vàng</h3>
                              <ul className="list-disc list-inside space-y-1">
                                <li>Phần thưởng: Quà tặng cao cấp</li>
                                <li>Điểm yêu cầu: 800 điểm</li>
                              </ul>
                            </div>
                          </div>
                          <ul className="mt-4 text-sm">
                            <li>
                              - Nếu bạn ở lại hạng <strong>Bạc</strong>, bạn sẽ cần đạt thêm{' '}
                              <strong>200 điểm</strong> nữa để nhận phần thưởng tiếp theo.
                            </li>
                            <li>
                              - Nếu nâng hạng, điểm sẽ được <strong>reset về 0</strong> và bạn sẽ{' '}
                              <strong>mất quyền nhận phần thưởng của hạng cũ</strong>. Vui lòng cân
                              nhắc trước khi nâng hạng
                            </li>
                          </ul>
                          <DialogFooter className="mt-6">
                            <Button
                              className="w-50% bg-blue-500 border text-white hover:bg-gray-200"
                              onClick={() => handleAcceptTerms(termsOpenFor!)}
                            >
                              Tôi đã hiểu
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
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
