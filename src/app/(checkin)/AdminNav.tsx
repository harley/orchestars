'use client'
import React from 'react'
import type { Admin } from '@/payload-types'

import { LogoutButton } from './LogoutButton'
import LanguageSwitcher from '@/components/LanguageSwitcher'

type AdminNavProps = {
  admin: Admin | null
}

export const AdminNav: React.FC<AdminNavProps> = ({ admin }) => {
  return (
    <header className="p-4 flex justify-between items-center bg-gray-800 shadow-md">
      <div className="text-sm">
        {admin ? (
          <span>
            Logged in as: <strong>{admin.email}</strong>
          </span>
        ) : (
          <span>Not logged in</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {admin && <LogoutButton />}
        <LanguageSwitcher className="bg-white text-gray-900 rounded px-3 py-2 hover:bg-gray-100 transition-colors" />
      </div>
    </header>
  )
} 