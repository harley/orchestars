'use client'
import { useRouter } from 'next/navigation'
import React from 'react'

export function LogoutButton() {
  const router = useRouter()

  const logout = async () => {
    try {
      const req = await fetch('/api/admins/logout', {
        method: 'POST',
      })
      if (req.ok) {
        router.push('/admin/login')
      } else {
        // Handle error
        console.error('Logout failed')
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <button
      type="button"
      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
      onClick={logout}
    >
      Logout
    </button>
  )
} 