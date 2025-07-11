'use client'

import React, { useEffect, Dispatch, SetStateAction } from 'react'

interface HistoryItem {
  code: string
  status: 'success' | 'error'
  time: Date
}

interface HistorySectionProps {
  history: HistoryItem[]
  setHistory: Dispatch<SetStateAction<HistoryItem[]>>
}

const HistorySection: React.FC<HistorySectionProps> = ({ history, setHistory }) => {
  // Fetch initial recent check-ins
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/checkin-app/history-checkin-record')
        if (res.ok) {
          const data = (await res.json()) as { docs: { ticketCode: string; createdAt: string }[] }
          setHistory(
            data.docs.slice(0, 20).map((d) => ({
              code: d.ticketCode,
              status: 'success' as const,
              time: new Date(d.createdAt),
            })),
          )
        }
      } catch (err) {
        console.error('Fetch history error', err)
      }
    })()
  }, [setHistory])

  const timeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime()
    const sec = Math.floor(diff / 1000)
    if (sec < 60) return `${sec}s ago`
    const min = Math.floor(sec / 60)
    if (min < 60) return `${min}m ago`
    const hr = Math.floor(min / 60)
    if (hr < 24) return `${hr}h ago`
    const d = Math.floor(hr / 24)
    return `${d}d ago`
  }

  return (
    <div className="mt-6 w-full max-w-md">
      <h2 className="text-lg font-semibold mb-2">Recent Check-ins</h2>
      <ul className="space-y-1 text-sm">
        {history.length === 0 && <li className="text-gray-400">No scans yet</li>}
        {history.map((h, idx) => (
          <li key={idx} className="flex justify-between bg-white/10 px-3 py-2 rounded">
            <span>{h.code}</span>
            <span className="flex gap-2 items-center">
              <span className={h.status === 'success' ? 'text-emerald-400' : 'text-red-400'}>
                {h.status}
              </span>
              <span className="text-gray-400 text-xs">{timeAgo(h.time)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default HistorySection 