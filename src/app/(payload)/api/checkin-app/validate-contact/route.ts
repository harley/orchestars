import { NextRequest, NextResponse } from 'next/server'
import { findTickets } from '@/lib/checkin/findTickets'
import { getAdminUser } from '@/utilities/getAdminUser'
import { isAdminOrSuperAdminOrEventAdmin } from '@/access/isAdminOrSuperAdmin'
import { handleNextErrorMsgResponse } from '@/utilities/handleNextErrorMsgResponse'
import { sql } from '@payloadcms/db-postgres'
import { getPayload } from '@/payload-config/getPayloadConfig'

const MAX_UNIQUE_USERS = 3

// Sanitize search input for ILIKE queries
const sanitizeSearchTerm = (term: string): string => {
  return term
    .replace(/[%_\\]/g, (match) => '\\' + match) // Escape ILIKE wildcards
    .trim()
    .substring(0, 100) // Limit length
}

// Validate search term
const validateSearchTerm = (term: string): boolean => {
  return term.length >= 2 && term.length <= 100
}

export async function POST(req: NextRequest) {
  try {
    const adminUser = await getAdminUser()

    if (
      !adminUser ||
      !isAdminOrSuperAdminOrEventAdmin({
        req: { user: adminUser },
      })
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { eventId, scheduleId, email, phoneNumber } = await req.json()

    if (!eventId || !scheduleId || (!email && !phoneNumber)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate search terms
    if (email && !validateSearchTerm(email)) {
      return NextResponse.json({ error: 'Email search term must be between 2-100 characters' }, { status: 400 })
    }

    if (phoneNumber && !validateSearchTerm(phoneNumber)) {
      return NextResponse.json({ error: 'Phone search term must be between 2-100 characters' }, { status: 400 })
    }

    // For email searches, check if we should use enhanced ILIKE search
    if (email) {
      const sanitizedEmail = sanitizeSearchTerm(email)
      const payload = await getPayload()

      // First, count unique users that match the email pattern and have tickets for this event
      const uniqueUserCountQuery = sql`
        SELECT COUNT(DISTINCT u.id) as unique_user_count
        FROM users u
        INNER JOIN tickets t ON t.user_id = u.id
        WHERE u.email ILIKE ${'%' + sanitizedEmail + '%'}
          AND t.event_id = ${eventId}
          AND t.event_schedule_id = ${scheduleId}
          AND t.status = 'booked'
      `

      const userCountResult = await payload.db.drizzle.execute(uniqueUserCountQuery)
      const uniqueUserCount = Number((userCountResult as any).rows[0]?.unique_user_count ?? 0)

      if (uniqueUserCount > MAX_UNIQUE_USERS) {
        return NextResponse.json({
          tickets: [],
          tooManyMatches: true,
          matchCount: uniqueUserCount,
          searchTerm: email,
          searchType: 'email'
        })
      }

      // Proceed with actual search if within unique user limit
      // This will return ALL tickets for the matching users (not limited to 3 tickets)
      const tickets = await findTickets({
        email: sanitizedEmail,
        eventId,
        scheduleId,
        useILIKE: true
      })

      if (tickets.length === 0) {
        return NextResponse.json({ error: 'No tickets found for that email' }, { status: 404 })
      }

      return NextResponse.json({ tickets }, { status: 200 })
    }

    // For phone searches, check if we should use enhanced ILIKE search
    if (phoneNumber) {
      const payload = await getPayload()

      // Normalize phone number for digit-only matching (consistent with findTickets.ts)
      const normalizePhoneNumber = (phone: string): string => {
        return phone.replace(/\D/g, '') // Remove all non-digit characters
      }
      const normalizedPhone = normalizePhoneNumber(phoneNumber)
      const sanitizedPhone = sanitizeSearchTerm(normalizedPhone)

      // Count unique users that match the phone pattern and have tickets for this event
      const uniqueUserCountQuery = sql`
        SELECT COUNT(DISTINCT u.id) as unique_user_count
        FROM users u
        INNER JOIN tickets t ON t.user_id = u.id
        WHERE u.phone_number ILIKE ${'%' + sanitizedPhone + '%'}
          AND t.event_id = ${eventId}
          AND t.event_schedule_id = ${scheduleId}
          AND t.status = 'booked'
      `

      const userCountResult = await payload.db.drizzle.execute(uniqueUserCountQuery)
      const uniqueUserCount = Number((userCountResult as any).rows[0]?.unique_user_count ?? 0)

      if (uniqueUserCount > MAX_UNIQUE_USERS) {
        return NextResponse.json({
          tickets: [],
          tooManyMatches: true,
          matchCount: uniqueUserCount,
          searchTerm: phoneNumber,
          searchType: 'phone'
        })
      }

      // Proceed with actual search if within unique user limit
      // This will return ALL tickets for the matching users (not limited to 3 tickets)
      const tickets = await findTickets({
        phoneNumber: sanitizedPhone,
        eventId,
        scheduleId,
        useILIKE: true
      })

      if (tickets.length === 0) {
        return NextResponse.json({ error: 'No tickets found for that phone number' }, { status: 404 })
      }

      return NextResponse.json({ tickets }, { status: 200 })
    }

    return NextResponse.json({ error: 'No search criteria provided' }, { status: 400 })
  } catch (error) {
    console.error('Error validating contact:', error)
    return NextResponse.json({ message: await handleNextErrorMsgResponse(error) }, { status: 500 })
  }
}