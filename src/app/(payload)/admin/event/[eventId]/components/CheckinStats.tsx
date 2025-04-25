'use client'

import React, { useState } from 'react'
import { Event } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDistanceToNow, format } from 'date-fns'
import { getCheckinStats } from '../actions'
import useSWR from 'swr'

interface CheckinStats {
  totalTickets: number
  totalCheckins: number
  checkinsLast30Min: number
  checkinsByZone: Record<string, number>
  selfCheckins: number
  adminCheckins: number
  avgCheckinTime: number | null
}

interface Props {
  event: Event
}

const CheckinStats: React.FC<Props> = ({ event }) => {
  // Set default to first schedule
  const defaultSchedule = event.schedules?.[0]
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    defaultSchedule?.id ?? null,
  )
  const selectedSchedule = event.schedules?.find((s) => s.id === selectedScheduleId)

  const {
    data: stats,
    error,
    isLoading,
  } = useSWR<CheckinStats>(
    `checkin-stats-${event.id}-${selectedScheduleId || ''}`,
    () => getCheckinStats(event.id, selectedScheduleId || undefined),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      onError: (err) => {
        console.error('SWR error:', err)
      },
    },
  )

  if (isLoading) {
    return <div className="p-4">Loading statistics...</div>
  }

  if (error) {
    console.error('Error in CheckinStats:', error)
    return (
      <div className="p-4 text-red-500">
        Failed to load statistics. Please try refreshing the page.
        {process.env.NODE_ENV === 'development' && (
          <pre className="mt-2 text-xs">{error.message}</pre>
        )}
      </div>
    )
  }

  if (!stats) {
    return <div className="p-4">No statistics available</div>
  }

  const averageCheckinTime = stats.avgCheckinTime
    ? formatDistanceToNow(Date.now() - Number(stats.avgCheckinTime) * 1000, { addSuffix: true })
    : 'N/A'

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)' }}>
      {/* Sidebar */}
      <div
        style={{
          width: '300px',
          borderRight: '1px solid #ddd',
          padding: '1rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ flex: 1 }}>
          <div className="space-y-6">
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Dates</h2>
              <p>
                Start:{' '}
                {event.startDatetime ? new Date(event.startDatetime).toLocaleString() : 'N/A'}
              </p>
              <p>End: {event.endDatetime ? new Date(event.endDatetime).toLocaleString() : 'N/A'}</p>
            </div>

            {event.schedules && event.schedules.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Schedules</h2>
                  {selectedSchedule && (
                    <div className="text-sm font-medium text-gray-500">
                      Showing stats for {format(new Date(selectedSchedule.date), 'dd/MM')}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {event.schedules.map((schedule) => (
                    <button
                      key={schedule.id}
                      onClick={() => setSelectedScheduleId(schedule.id)}
                      className={`p-4 text-base font-medium rounded-lg transition-colors ${
                        selectedScheduleId === schedule.id
                          ? 'bg-gray-900 text-white shadow-lg transform scale-105'
                          : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {format(new Date(schedule.date), 'dd/MM/yyyy')}
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedScheduleId(null)}
                    className={`p-4 text-base font-medium rounded-lg transition-colors ${
                      selectedScheduleId === null
                        ? 'bg-gray-900 text-white shadow-lg transform scale-105'
                        : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    All Dates
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Check-ins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalCheckins} / {stats.totalTickets}
              </div>
              <div className="text-sm text-muted-foreground">
                {stats.totalTickets > 0
                  ? `${Math.round((stats.totalCheckins / stats.totalTickets) * 100)}% checked in`
                  : 'No tickets available'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Check-ins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.checkinsLast30Min}</div>
              <div className="text-sm text-muted-foreground">in last 30 minutes</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Check-in Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Self Check-in:</span>
                  <span className="font-bold">{stats.selfCheckins}</span>
                </div>
                <div className="flex justify-between">
                  <span>Admin Check-in:</span>
                  <span className="font-bold">{stats.adminCheckins}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Average Check-in Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageCheckinTime}</div>
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Check-ins by Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(stats.checkinsByZone).length > 0 ? (
                  Object.entries(stats.checkinsByZone).map(([zone, count]) => (
                    <div key={zone} className="text-center">
                      <div className="text-lg font-bold">{count}</div>
                      <div className="text-sm text-muted-foreground">{zone}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center col-span-full text-muted-foreground">
                    No zone data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CheckinStats
