import { BasePayload, Where } from 'payload'

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
        seatHoldingCode: true,
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
