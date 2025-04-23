'use client'

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SeatAssignment from './components/SeatAssignment'
import { Event } from './types'
import ChangeSeat from './components/ChangeSeat'

interface Props {
  event: Event
}

const AdminEventClient: React.FC<Props> = ({ event }) => {
  return (
    <Tabs defaultValue="seatAssignment" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="seatAssignment" style={{ padding: '20px 40px', marginRight: '20px' }}>
          Seat Assignment
        </TabsTrigger>
        <TabsTrigger value="changeSeat" style={{ padding: '20px 40px' }}>
          Change Seat
        </TabsTrigger>
      </TabsList>
      <TabsContent value="seatAssignment">
        <SeatAssignment event={event} />
      </TabsContent>
      <TabsContent value="changeSeat">
        <ChangeSeat event={event} />
      </TabsContent>
    </Tabs>
  )
}

export default AdminEventClient
