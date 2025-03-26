import React from 'react'
import AdminEventClient from './page.client'

const AdminEventPage = ({ params }: { params: { eventId: string } }) => {
  return <AdminEventClient />
}

export default AdminEventPage
