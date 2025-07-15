import { NextRequest, NextResponse } from 'next/server'
import { findTickets } from '@/lib/checkin/findTickets'
import { getAdminUser } from '@/utilities/getAdminUser'
import { isAdminOrSuperAdminOrEventAdmin } from '@/access/isAdminOrSuperAdmin'
import { handleNextErrorMsgResponse } from '@/utilities/handleNextErrorMsgResponse'

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

    const tickets = await findTickets({ email, phoneNumber, eventId, scheduleId })

    if (tickets.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    return NextResponse.json({ tickets }, { status: 200 })
  } catch (error) {
    console.error('Error validating contact:', error)
    return NextResponse.json({ message: await handleNextErrorMsgResponse(error) }, { status: 500 })
  }
} 