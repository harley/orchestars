'use client'
import React, { useState } from 'react'
import { User } from '@/payload-types'
import Sidebar from '@/components/User/UserProfileSidebar/Sidebar'
import TicketBought from '@/components/User/TicketBought'
import AccountSettings from '@/components/User/AccountSettings'

import MyEvents from '@/components/User/MyEvents'

type Section = 'tickets' | 'account' | 'events'

const UserProfilePageClient: React.FC<{ userData: User }> = ({ userData }) => {
  const [activeSection, setActiveSection] = useState<Section>('tickets')

  return (
    <div className="flex flex-1 min-h-0 bg-gray-100">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} user={userData} />
      <main className="flex-1 p-6">
        <TicketBought className={activeSection === 'tickets' ? '' : 'hidden'} />
        <AccountSettings
          userData={userData}
          className={activeSection === 'account' ? '' : 'hidden'}
        />
        <MyEvents className={activeSection === 'events' ? '' : 'hidden'} />
      </main>
    </div>
  )
}

export default UserProfilePageClient
