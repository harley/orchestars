import { sql } from '@payloadcms/db-postgres'
import { getPayload } from '@/payload-config/getPayloadConfig'

export interface TicketDTO {
  id: number
  attendeeName: string
  email: string | null
  phoneNumber: string | null
  ticketCode: string
  seat: string
  status: string
  ticketPriceInfo: any
  ticketPriceName: string | null
  orderCode: string | null
  isCheckedIn: boolean
  checkinRecord: {
    checkInTime: string | null
    checkedInBy: {
      email: string | null
    } | null
    ticketGivenTime: string | null
    ticketGivenBy: string | null
  } | null
}

/**
 * Unified ticket finder for check-in flows.
 * At least one of ticketCode or seatNumber must be provided.
 */
export const findTickets = async (opts: {
  ticketCode?: string
  seatNumber?: string
  eventId?: string
  scheduleId?: string
}): Promise<TicketDTO[]> => {
  const { ticketCode, seatNumber, eventId, scheduleId } = opts

  if (!ticketCode && !seatNumber) {
    throw new Error('findTickets requires ticketCode or seatNumber')
  }

  const payload = await getPayload()

  const query = sql`
    SELECT
      t.id,
      t.ticket_code,
      t.attendee_name,
      t.seat,
      t.ticket_price_info,
      t.ticket_price_name,
      t.event_schedule_id,
      t.status,
      u.email,
      u.phone_number,
      o.order_code,
      CASE WHEN cr.id IS NOT NULL THEN true ELSE false END as is_checked_in,
      cr.check_in_time,
      cr.checked_in_by_id,
      cr.ticket_given_time,
      cr.ticket_given_by,
      a.email as checked_in_by_email
    FROM tickets t
    LEFT JOIN users u ON t.user_id = u.id
    LEFT JOIN orders o ON t.order_id = o.id
    LEFT JOIN checkin_records cr ON cr.ticket_code = t.ticket_code AND cr.deleted_at IS NULL
    LEFT JOIN admins a ON cr.checked_in_by_id = a.id
    WHERE
      ${ticketCode ? sql`t.ticket_code = ${ticketCode.toUpperCase()}` : sql`TRUE`}
      ${seatNumber ? sql`AND UPPER(t.seat) = ${seatNumber.toUpperCase()}` : sql``}
      ${eventId ? sql`AND t.event_id = ${eventId}` : sql``}
      ${scheduleId ? sql`AND t.event_schedule_id = ${scheduleId}` : sql``}
      AND t.status = 'booked'
    ORDER BY t.created_at DESC
  `

  const ticketResult = await payload.db.drizzle.execute(query)
  const rows = (ticketResult as { rows: any[] }).rows || []

  return rows.map((r): TicketDTO => ({
    id: r.id,
    attendeeName: r.attendee_name,
    email: r.email,
    phoneNumber: r.phone_number,
    ticketCode: r.ticket_code,
    seat: r.seat,
    status: r.status,
    ticketPriceInfo: r.ticket_price_info,
    ticketPriceName: r.ticket_price_name,
    orderCode: r.order_code,
    isCheckedIn: r.is_checked_in,
    checkinRecord: r.is_checked_in
      ? {
          checkInTime: r.check_in_time,
          checkedInBy: { email: r.checked_in_by_email },
          ticketGivenTime: r.ticket_given_time,
          ticketGivenBy: r.ticket_given_by,
        }
      : null,
  }))
} 