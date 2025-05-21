import React from 'react'
import { useTranslate } from '@/providers/I18n/client'
import { User } from '@/payload-types'

type Section = 'tickets' | 'account' | 'events'

const Sidebar: React.FC<{
    activeSection: Section
    setActiveSection: (section: Section) => void
    user?: User
}> = ({ activeSection, setActiveSection, user }) => {
    const { t } = useTranslate()
    return (
        <aside className="w-64 bg-gray-900 text-white p-6 space-y-4">
            <div className="text-sm text-gray-400">{t('userprofile.sidebar.accountOf')}</div>
            <div className="flex items-center gap-2">
                <div className="text-lg font-bold">{user?.firstName || ''} {user?.lastName || ''}</div>
            </div>
            <nav className="mt-6 space-y-2">
                <button onClick={() => setActiveSection('account')} className="block w-full text-left hover:text-green-400">{t('userprofile.sidebar.accountSettings')}</button>
                <button onClick={() => setActiveSection('tickets')} className={`block w-full text-left ${activeSection === 'tickets' ? 'text-green-400' : 'hover:text-green-400'}`}>{t('userprofile.sidebar.purchasedTickets')}</button>
                <button onClick={() => setActiveSection('events')} className="block w-full text-left hover:text-green-400">{t('userprofile.sidebar.myEvents')}</button>
            </nav>
        </aside>
    )
}

export default Sidebar
