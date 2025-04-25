'use client'

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SeatAssignment from './components/SeatAssignment'
import { Event } from './types'
import ChangeSeat from './components/ChangeSeat'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Props {
  event: Event
}

const AdminEventClient: React.FC<Props> = ({ event }) => {
  const params = useParams()
  const eventId = params.eventId as string

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{event.title}</h1>
      </div>

      <Tabs defaultValue="seatAssignment">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="seatAssignment">Seat Assignment</TabsTrigger>
          <TabsTrigger value="changeSeat">Change Seat</TabsTrigger>
          <Link href={`/admin/event/${eventId}/stats`} className="w-full">
            <TabsTrigger value="checkinStats" className="w-full">
              Check-in Stats
            </TabsTrigger>
          </Link>
        </TabsList>
        <TabsContent value="seatAssignment">
          <SeatAssignment event={event} />
        </TabsContent>
        <TabsContent value="changeSeat">
          <ChangeSeat event={event} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminEventClient
