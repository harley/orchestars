import { NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { revalidateTag } from 'next/cache'
import { handleNextErrorMsgResponse } from '@/utilities/handleNextErrorMsgResponse'

// Utility function to extract ID from relationship field
const getRelationshipId = (field: any): number | null => {
  if (!field) return null
  if (typeof field === 'string' || typeof field === 'number') return Number(field)
  if (typeof field === 'object' && field?.id) return field.id
  return null
}

export async function POST(request: Request) {
  try {
    const { ticketCodes, adminId } = await request.json()

    // Validate inputs
    if (!Array.isArray(ticketCodes) || ticketCodes.length === 0 || !adminId) {
      throw new Error('GIVENTICKET001')
    }

    const payload = await getPayload()
    const isValidUsherId = (usherId: any) =>
      !isNaN(Number(usherId)) && Number(usherId) >= 0 && Number(usherId) <= 10
    if (!isValidUsherId(adminId)) {
      throw new Error('GIVENTICKET002')
    }

    // Get tickets for all provided codes with related event data
    const [tickets, existingCheckins] = await Promise.all([
      payload
        .find({
          collection: 'tickets',
          depth: 0,
          limit: ticketCodes.length,
          where: {
            ticketCode: { in: ticketCodes },
          },
          select: {
            id: true,
            event: true,
            eventDate: true,
            eventScheduleId: true,
            seat: true,
            ticketCode: true,
            user: true,
          },
        })
        .then((res) => res.docs),
      payload.find({
        collection: 'checkinRecords',
        depth: 0,
        limit: ticketCodes.length,
        where: {
          ticketCode: { in: ticketCodes },
          deletedAt: { equals: null },
        },
      }),
    ])

    // Verify all tickets belong to the same user
    const userIds = new Set(tickets.map((ticket) => getRelationshipId(ticket.user)).filter(Boolean))
    if (userIds.size > 1) {
      throw new Error('GIVENTICKET003')
    }

    // Create map of ticket codes to ticket objects
    const ticketMap = new Map(tickets.map((ticket) => [ticket.ticketCode, ticket]))

    const existingCheckinsMap = new Map(
      existingCheckins.docs.map((checkin) => [checkin.ticketCode, checkin]),
    )

    const operations: Promise<any>[] = []
    const results: Array<{ ticketCode: string; status: 'updated' | 'not_found' | 'created' }> = []

    // Process each ticket code
    for (const code of ticketCodes) {
      const existingCheckin = existingCheckinsMap.get(code)
      const ticket = ticketMap.get(code)

      if (existingCheckin) {
        // Update existing check-in record
        operations.push(
          payload.update({
            collection: 'checkinRecords',
            id: existingCheckin.id,
            depth: 0,
            data: {
              ticketGivenTime: new Date().toISOString(),
              ticketGivenBy: adminId,
            },
          }),
        )
        results.push({ ticketCode: code, status: 'updated' })
      } else if (ticket) {
        // Extract and validate required fields
        const eventId = getRelationshipId(ticket.event)
        const ticketId = getRelationshipId(ticket) || ticket.id
        const userIdFromTicket = getRelationshipId(ticket.user)
        const ticketCode = ticket.ticketCode

        // Validate required fields
        if (!eventId || !ticketId || !userIdFromTicket || !ticketCode || !ticket.seat) {
          results.push({ ticketCode: code, status: 'not_found' })
          continue
        }

        operations.push(
          payload.create({
            collection: 'checkinRecords',
            depth: 0,
            data: {
              event: eventId,
              seat: ticket.seat,
              eventDate: ticket.eventDate || null,
              user: userIdFromTicket,
              ticket: ticketId,
              ticketCode: ticketCode,
              eventScheduleId: ticket.eventScheduleId,
              checkInTime: new Date().toISOString(),
              ticketGivenTime: new Date().toISOString(),
              ticketGivenBy: adminId,
            },
          }),
        )
        results.push({ ticketCode: code, status: 'updated' })
      } else {
        results.push({ ticketCode: code, status: 'not_found' })
      }
    }

    await Promise.all(operations)

    revalidateTag('checkin-history')

    return NextResponse.json({
      message: 'Bulk mark-given complete',
      data: { updatedGivenTicketCode: results },
    })
  } catch (error) {
    console.error('Bulk mark-given error:', error)
    return NextResponse.json({ message: await handleNextErrorMsgResponse(error) }, { status: 400 })
  }
}
