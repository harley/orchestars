import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { addQueueEmail } from '@/collections/Emails/utils'
import { EMAIL_QR_EVENT_GUIDELINE_URL, EMAIL_QR_EVENT_MAP_STAGE } from '@/config/email'
import { toZonedTime, format as tzFormat } from 'date-fns-tz'
import { generateEventTicketEmailHtml } from '@/mail/templates/EventTicketEmail'
import { getServerSideURL } from '@/utilities/getURL'
import { EVENT_STATUS } from '@/collections/Events/constants/status'
import { TICKET_STATUS } from '@/collections/Tickets/constants'
import { ORDER_STATUS } from '@/collections/Orders/constants'
import { sql } from '@payloadcms/db-postgres'
import { EMAIL_TYPE } from '@/collections/Emails/constant'
import { checkAuthorizedCronJob } from '@/utilities/checkAuthorizedCronJob'

export const dynamic = 'force-dynamic'
export const maxDuration = 120 // 2 minutes max duration

export async function GET(req: NextRequest) {
  try {
    console.log('--> executing Send QR Ticket Code\n')
    if (!checkAuthorizedCronJob(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const batchSize = 20

    // Initialize Payload
    const payload = await getPayload()

    // get the event only that will show before 30 hours to event start time
    const now = new Date()
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)

    const event = await payload
      .find({
        collection: 'events',
        where: {
          startDatetime: {
            less_than_equal: twoDaysFromNow.toISOString(),
          },
          endDatetime: {
            greater_than_equal: now.toISOString(),
          },
          status: {
            in: [EVENT_STATUS.published_upcoming.value, EVENT_STATUS.published_open_sales.value],
          },
        },
        sort: 'startDatetime',
        limit: 1,
      })
      .then((res) => res.docs[0])

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const queryCompletedOrders = await payload.db.drizzle.execute(sql`
      SELECT * FROM (
        SELECT DISTINCT ON (ord.id)
          ord.id,
          ord.user_id,
          ord.order_code,
          tk.event_id AS event_id,
          e.start_datetime AS event_start_time,
          e.end_datetime AS event_end_time,          
          es.date AS event_date,
          (es.date::date + (e.start_datetime::time at time zone 'UTC')) at time zone 'UTC' as full_current_event_date_time,
          usr.email AS user_email
        FROM orders ord
        LEFT JOIN users usr ON ord.user_id = usr.id
        LEFT JOIN tickets tk ON ord.id = tk.order_id AND tk.status = ${TICKET_STATUS.booked.value}
        LEFT JOIN events_schedules es ON tk.event_schedule_id = es.id
        LEFT JOIN events e ON tk.event_id = e.id
        LEFT JOIN emails em ON ord.id = em.order_id AND em.type = ${EMAIL_TYPE.qr_event_ticket.value}
        WHERE ord.status = ${ORDER_STATUS.completed.value}
          AND tk.event_id = ${event.id}
          AND em.id IS NULL
          ORDER BY ord.id, es.date ASC
      ) AS completed_orders
      WHERE completed_orders.full_current_event_date_time <= ${twoDaysFromNow.toISOString()} 
      AND completed_orders.full_current_event_date_time >= ${now.toISOString()}
      ORDER BY completed_orders.event_date ASC
      LIMIT ${batchSize}
    `)

    const orders = (queryCompletedOrders as { rows: any[] }).rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      orderCode: row.order_code,
      eventId: row.event_id,
      eventDate: row.event_date,
      fullCurrentEventDateTime: row.full_current_event_date_time,
      userEmail: row.user_email,
      eventStartTime: row.event_start_time,
      eventEndTime: row.event_end_time,
    }))

    // Format event date/time information
    const startTime = event?.startDatetime
      ? tzFormat(toZonedTime(new Date(event.startDatetime), 'Asia/Ho_Chi_Minh'), 'HH:mm')
      : ''
    const endTime = event?.endDatetime
      ? tzFormat(toZonedTime(new Date(event.endDatetime), 'Asia/Ho_Chi_Minh'), 'HH:mm')
      : ''
    const eventLocation = event?.eventLocation as string

    // Process each user's tickets
    let emailsQueued = 0
    const baseUrl = getServerSideURL() || ''

    await Promise.all(
      orders.map(async (order) => {
        try {
          const orderId = order.id
          const orderCode = order?.orderCode || 'N/A'
          const ticketUrl = `${baseUrl}/tickets/${orderCode}`

          const eventDate = order.eventDate
            ? tzFormat(toZonedTime(new Date(order.eventDate), 'Asia/Ho_Chi_Minh'), 'dd/MM/yyyy')
            : ''

          let eventStartTime = ''
          let eventEndTime = ''
          if (startTime && eventDate) {
            const [day, month, year] = eventDate.split('/')
            eventStartTime = new Date(`${year}-${month}-${day}T${startTime}:00+07:00`).toISOString()
          }

          if (endTime && eventDate) {
            const [day, month, year] = eventDate.split('/')
            eventEndTime = new Date(`${year}-${month}-${day}T${endTime}:00+07:00`).toISOString()
          }

          // Generate email HTML
          const html = generateEventTicketEmailHtml({
            eventName: event.title || '',
            eventDate: `${startTime || 'N/A'} - ${endTime || 'N/A'}, ${eventDate || 'N/A'} (Giờ Việt Nam | Vietnam Time, GMT+7)`,
            eventLocation,
            ticketUrl,
            eventStartTimeCalendar: eventStartTime,
            eventEndTimeCalendar: eventEndTime,
            orderCode,
            guidelineUrl: EMAIL_QR_EVENT_GUIDELINE_URL,
            zoneMapUrl: EMAIL_QR_EVENT_MAP_STAGE,
          })

          // Queue email
          await addQueueEmail({
            payload,
            resendMailData: {
              to: order.userEmail,
              // cc: EMAIL_CC,
              subject: `✨ Step Into the Story – Your ${event.title} Tickets Are Here`,
              html,
            },
            emailData: {
              user: order.userId,
              event: event.id,
              order: orderId,
              type: EMAIL_TYPE.qr_event_ticket.value,
            },
          })

          emailsQueued++
        } catch (error) {
          console.error(`Failed to queue email for order ${order.orderCode}:`, error)
        }
      }),
    )

    return NextResponse.json({
      message: `Queued ${emailsQueued} emails successfully`,
      orders,
    })
  } catch (error) {
    console.error('Error sending event ticket emails:', error)
    return NextResponse.json(
      {
        error: 'Failed to process ticket emails',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
