import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import AdminEventClient from './page.client'

type Props = {
  params: Promise<{ eventId: string }>
}

const AdminEventPage = async ({ params }: Props) => {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')

  if (!token?.value) {
    redirect('/admin/login')
  }

  const { eventId } = await params
  const payload = await getPayload({ config })

  // Find event by slug
  const event = await payload
    .find({
      collection: 'events',
      where: {
        slug: {
          equals: eventId,
        },
      },
      depth: 2, // To populate relations like media
    })
    .then((res) => res.docs[0])

  if (!event) {
    return <div className="p-4">Event not found</div>
  }

  return <AdminEventClient event={event} />
}

export default AdminEventPage
