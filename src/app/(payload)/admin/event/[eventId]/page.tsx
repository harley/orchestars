import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminEventClient from './page.client'

const AdminEventPage = async ({ params }: { params: { eventId: string } }) => {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')

  if (!token?.value) {
    redirect('/admin/login')
  }

  return <AdminEventClient />
}

export default AdminEventPage
