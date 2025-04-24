import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

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
      return NextResponse.json(
        { message: 'Admin ID and at least one ticket code are required' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })
    const isValidUsherId = (usherId: any) =>
      !isNaN(Number(usherId)) && Number(usherId) >= 0 && Number(usherId) <= 10
    if (!adminId || !isValidUsherId(adminId)) {
      return NextResponse.json({ message: 'Admin not found' }, { status: 404 })
    }

    const results: Array<{ ticketCode: string; status: 'updated' | 'not_found' | 'created' }> = []

    // Get tickets for all provided codes with related event data
    const tickets = await payload
      .find({
        collection: 'tickets',
        where: {
          ticketCode: { in: ticketCodes },
        },
        depth: 2, // Ensure we get related event and user data
      })
      .then((res) => res.docs)

    // Verify all tickets belong to the same user
    const userIds = new Set(tickets.map((ticket) => getRelationshipId(ticket.user)).filter(Boolean))
    if (userIds.size > 1) {
      return NextResponse.json(
        { message: 'All ticket codes must belong to the same user' },
        { status: 400 },
      )
    }

    const userId = userIds.values().next().value

    // Create map of ticket codes to ticket objects
    const ticketMap = new Map(tickets.map((ticket) => [ticket.ticketCode, ticket]))

    // Process each ticket code
    for (const code of ticketCodes) {
      const existingCheckin = await payload
        .find({
          collection: 'checkinRecords',
          where: {
            ticketCode: { equals: code },
            deletedAt: { equals: null },
          },
        })
        .then((res) => res.docs[0])

      if (existingCheckin) {
        // Update existing check-in record
        await payload.update({
          collection: 'checkinRecords',
          id: existingCheckin.id,
          data: {
            ticketGivenTime: new Date().toISOString(),
            ticketGivenBy: adminId,
          },
        })
        results.push({ ticketCode: code, status: 'updated' })
      } else if (ticketMap.has(code)) {
        // Create new check-in record for valid ticket
        const ticket = ticketMap.get(code)

        // Extract and validate required fields
        const eventId = getRelationshipId(ticket?.event)
        const ticketId = getRelationshipId(ticket) || ticket?.id
        const userIdFromTicket = getRelationshipId(ticket?.user)
        const ticketCode = ticket?.ticketCode

        // Validate required fields
        if (!eventId || !ticketId || !userIdFromTicket || !ticketCode || !ticket?.seat) {
          results.push({ ticketCode: code, status: 'not_found' })
          continue
        }

        await payload.create({
          collection: 'checkinRecords',
          data: {
            event: eventId,
            seat: ticket?.seat,
            eventDate: ticket.eventDate || null,
            user: userIdFromTicket,
            ticket: ticketId,
            ticketCode: ticketCode,
            eventScheduleId: ticket?.eventScheduleId,
            checkInTime: new Date().toISOString(),
            ticketGivenTime: new Date().toISOString(),
            ticketGivenBy: adminId,
          },
        })
        results.push({ ticketCode: code, status: 'updated' })
      } else {
        results.push({ ticketCode: code, status: 'not_found' })
      }
    }

    return NextResponse.json({
      message: 'Bulk mark-given complete',
      data: { updatedGivenTicketCode: results },
    })
  } catch (error) {
    console.error('Bulk mark-given error:', error)
    return NextResponse.json(
      { message: 'An error occurred while processing your request' },
      { status: 500 },
    )
  }
}
