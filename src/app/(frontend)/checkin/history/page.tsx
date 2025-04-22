'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/CheckIn/useAuth'
import { Clock3, X } from 'lucide-react'

interface CheckinRecord {
  id: string
  ticketCode: string
  attendeeName: string
  eventTitle: string
  ticket: { seat?: string }
  checkInTime: string
  checkedInBy: { email: string }
}

export default function HistoryPage() {
  const [checkins, setCheckins] = useState<CheckinRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { isHydrated, token, setToken } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return
    try {
      const response = await fetch(`/api/checkin-app/checkin/${id}/delete-checkin`, {
        method: 'POST',
        headers: {
          Authorization: `JWT ${token}`,
        },
      })
      if (!response.ok) {
        const error = await response.json()
        alert(error.message || 'Failed to delete record')
        return
      }
      setCheckins((prev) => prev.filter((item) => item.id !== id))
      alert('Record deleted successfully')
    } catch (_err) {
      alert('Failed to delete record')
    }
  }
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/checkin-app/history-checkin-record`, {
          headers: {
            Authorization: `JWT ${token}`,
          },
        })

        if (response.status === 401) {
          setToken('')
        }

        const data = await response.json()
        setCheckins(data.records || [])
      } catch (err) {
        console.error('Failed to load history', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [token])

  const filteredCheckins = checkins.filter((item) => {
    const matchesSearch =
      item.ticketCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ticket?.seat?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })


  useEffect(() => {
    if (!isHydrated) return
    if (!token) {
      router.replace('/checkin')
      return
    }

  }, [isHydrated, token, router])
  return (
    <div className="min-h-screen bg-white pt-16 px-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Check-In History</h1>
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full border border-gray-900 flex items-center justify-center"
        >
          <X className="text-gray-900 w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <input
          type="text"
          placeholder="Search by ticket code or seat..."
          className="w-full md:w-1/2 border border-gray-300 rounded-full px-4 py-2 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 px-4 py-3 rounded-xl border-2 border-gray-900 text-gray-900 hover:bg-gray-100 transition"
      >
        Back
      </button>

      {/* History List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center mt-20 text-gray-900">
            <Clock3 className="mx-auto mb-3 animate-spin" size={32} />
            <p>Loading check-in history...</p>
          </div>
        ) : filteredCheckins?.length === 0 ? (
          <p className="text-center text-gray-400 mt-16">No records found</p>
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
                <p className="text-sm text-gray-600">Seat: {item.ticket?.seat || 'N/A'}</p>
                <p className="text-sm text-gray-600">
                  Checked in: {item.checkInTime.split('T')[0]}
                </p>
                <p className="text-sm text-gray-600">Checked in by: {item.checkedInBy.email}</p>
                <button
                  className="mt-2 text-sm text-red-500 hover:underline outline-red-500"
                  onClick={() => handleDelete(item.ticketCode)}
                >
                  <X className="inline-block mr-1" size={16} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
