'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'

export async function getTicketsForSchedule(eventId: string, scheduleId: string) {
  const payload = await getPayload({
    config,
  })

  const result = await payload.find({
    collection: 'tickets',
    where: {
      event: { equals: eventId },
      eventScheduleId: { equals: scheduleId },
    },
  })

  return result.docs
}
