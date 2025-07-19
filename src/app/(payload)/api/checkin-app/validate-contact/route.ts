import { NextRequest, NextResponse } from 'next/server'
import { findTickets } from '@/lib/checkin/findTickets'
import { getAdminUser } from '@/utilities/getAdminUser'
import { isAdminOrSuperAdminOrEventAdmin } from '@/access/isAdminOrSuperAdmin'
import { handleNextErrorMsgResponse } from '@/utilities/handleNextErrorMsgResponse'

const MAX_PARTIAL_MATCH_RESULTS = 3

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
      
      // First, count potential matches to determine if we should show results
      const matchCount = await findTickets({ 
        email: sanitizedEmail, 
        eventId, 
        scheduleId, 
        useILIKE: true, 
        countOnly: true 
      })

      if (matchCount.length > MAX_PARTIAL_MATCH_RESULTS) {
        return NextResponse.json({
          tickets: [],
          tooManyMatches: true,
          matchCount: matchCount.length,
          searchTerm: email,
          searchType: 'email'
        })
      }

      // Proceed with actual search if within limit
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
      const sanitizedPhone = sanitizeSearchTerm(phoneNumber)
      
      // First, count potential matches
      const matchCount = await findTickets({ 
        phoneNumber: sanitizedPhone, 
        eventId, 
        scheduleId, 
        useILIKE: true, 
        countOnly: true 
      })

      if (matchCount.length > MAX_PARTIAL_MATCH_RESULTS) {
        return NextResponse.json({
          tickets: [],
          tooManyMatches: true,
          matchCount: matchCount.length,
          searchTerm: phoneNumber,
          searchType: 'phone'
        })
      }

      // Proceed with actual search if within limit
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