'use client'

import { useEffect, useState } from 'react'

type EventUpgradeNotification = {
  type: 'event-rank-upgrade'
  rank: string
  eligibleEvents: { eventId: string; oldRank: string }[]
  timestamp: number
}

export default function AffiliateRankUpgradeNotification() {
  const [notifications, setNotifications] = useState<EventUpgradeNotification[]>([])
  const [confirmedEvents, setConfirmedEvents] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchNotifications = async () => {
      const res = await fetch(`/api/notify-event-rank-upgrade`)
      const json = await res.json()
      if (json.notifications) {
        setNotifications(json.notifications)
      }
    }

    fetchNotifications()
  }, [])

  const handleConfirm = async (eventId: string, rank: string) => {
    try {
      const res = await fetch('/api/confirm-event-rank-upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventIds: [eventId], newRank: rank }),
      })

      const json = await res.json()

      if (json.success) {
        setConfirmedEvents((prev) => new Set([...prev, eventId]))
      } else {
        alert('Có lỗi xảy ra khi xác nhận.')
      }
    } catch (err) {
      console.error(err)
      alert('Không thể gửi xác nhận. Vui lòng thử lại.')
    }
  }

  if (!notifications.length) return null

  return (
    <div className="p-4 mb-4 border border-blue-400 bg-blue-100 text-blue-800 rounded">
      {notifications.map((notif, i) => (
        <div key={i} className="mb-4">
          <p className="font-semibold">
            🎉 Bạn đã được nâng lên hạng <strong>{notif.rank} cho hạng tổng !</strong>
          </p>
          <p>Các sự kiện đủ điều kiện nâng cấp:</p>
          <ul className="list-disc list-inside mt-2 space-y-2">
            {notif.eligibleEvents.map((e, idx) => (
              <li key={idx} className="flex justify-between items-center gap-4">
                <span>
                  Sự kiện ID: <strong>{e.eventId}</strong> (hạng cũ: {e.oldRank})
                </span>
                <button
                  onClick={() => handleConfirm(e.eventId, notif.rank)}
                  disabled={confirmedEvents.has(e.eventId)}
                  className={`px-3 py-1 rounded text-white text-sm ${
                    confirmedEvents.has(e.eventId)
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {confirmedEvents.has(e.eventId) ? 'Đã xác nhận' : 'Xác nhận'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
