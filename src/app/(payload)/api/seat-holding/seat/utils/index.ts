import { SeatHolding } from '@/payload-types'
import { sql } from '@payloadcms/db-postgres'
import { BasePayload, Where } from 'payload'

export const getExistingSeatHolding = async ({
  eventId,
  eventScheduleId,
  notEqualSeatHoldingCode,
  inSeats,
  payload,
}: {
  eventId: number
  eventScheduleId: string
  notEqualSeatHoldingCode?: string
  inSeats?: string[]
  payload: BasePayload
}) => {
  const currentTime = new Date().toISOString()
  const conditions: Where = {
    event: { equals: Number(eventId) },
    eventScheduleId: { equals: eventScheduleId },
    closedAt: { exists: false },
    expire_time: { greater_than: currentTime },
  }

  if (notEqualSeatHoldingCode) {
    conditions.code = { not_equals: notEqualSeatHoldingCode }
  }

  if (inSeats?.length) {
    conditions.seatName = { in: inSeats }
  }

  const existingSeats = await payload.db.drizzle
    .execute(
      `
    SELECT sh.id, sh.seat_name as "seatName", sh.code, sh.expire_time
      FROM seat_holdings sh
      WHERE 
        sh.event_id = ${Number(eventId)}
        AND sh.event_schedule_id = '${eventScheduleId}'
        AND sh.closed_at IS NULL
        AND sh.expire_time >= '${currentTime}'
        ${notEqualSeatHoldingCode ? sql` AND sh.code != '${notEqualSeatHoldingCode}'` : ''}
        ${
          inSeats?.length
            ? ` AND EXISTS (
                    SELECT 1 FROM unnest(string_to_array(sh.seat_name, ',')) AS seat(value) 
                    WHERE trim(value) =  ANY('{"${inSeats.join('","')}"}')
                  )`
            : ''
        }   
  `,
    )
    .then((res) => res.rows as unknown as SeatHolding[])
    .catch(() => [])

  return existingSeats
}

export const getSeatHoldings = async ({
  eventId,
  eventScheduleId,
  notEqualSeatHoldingCode,
  payload,
}: {
  eventId: number
  eventScheduleId: string
  notEqualSeatHoldingCode?: string
  payload: BasePayload
}) => {
  const currentTime = new Date().toISOString()
  const conditions: Where = {
    event: { equals: Number(eventId) },
    eventScheduleId: { equals: eventScheduleId },
    closedAt: { exists: false },
    expire_time: { greater_than: currentTime },
  }

  if (notEqualSeatHoldingCode) {
    conditions.code = { not_equals: notEqualSeatHoldingCode }
  }

  const existingSeats = await payload
    .find({
      collection: 'seatHoldings',
      where: conditions,
      select: {
        id: true,
        seatName: true,
        // code: true,
      },
      limit: 1000,
    })
    .then((res) => res.docs)
    .catch((error) => {
      console.error('Error while existingSeats ', error)

      return []
    })

  return existingSeats
    .map((ext) => (ext.seatName || '').split(','))
    .reduce((arr, arrItem) => [...arrItem, ...arr], [])
}
