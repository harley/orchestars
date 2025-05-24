'use client'
import React, { useState } from 'react'
import { Ticket } from '@/types/Ticket'
import { User } from '@/payload-types'
import { Event } from '@/payload-types'

import Sidebar from '@/components/UserProfileSidebar/Sidebar'
import TicketBought from '@/components/TicketBought'
import AccountSettings from '@/components/AccountSettings'

import MyEvents from '@/components/MyEvents'

type Section = 'tickets' | 'account' | 'events'

const UserProfilePageClient: React.FC<{ userTickets: Ticket[], events: Event[], userData: User }> = ({ userTickets, events, userData }) => {
  const [activeSection, setActiveSection] = useState<Section>('tickets')

  const renderContent = () => {
    switch (activeSection) {
      case 'tickets':
        return <TicketBought userTickets={userTickets} />
      case 'account':
        return <AccountSettings userData={userData} />
      case 'events':
        return <MyEvents events={events} />
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection}  user={userData}/>
      <main className="flex-1 p-6">
        {renderContent()}
      </main>
    </div>
  )
}

export default UserProfilePageClient