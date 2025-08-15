import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { checkUserAuthenticated } from '@/app/(user)/user/actions/authenticated'
import { TICKET_STATUS } from '@/collections/Tickets/constants'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ticketCode: string }> }, // async params in App Router
) {
  try {
    // Auth
    const authData = await checkUserAuthenticated()
    if (!authData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = authData.userInfo.id

    // Params (must await on your setup)
    const { ticketCode } = await params
    if (!ticketCode) {
      return NextResponse.json({ error: 'Missing ticketCode' }, { status: 400 })
    }

    const payload = await getPayload()

    // ---- PASS 1: exact code ----
    const exactRes = await payload.find({
      collection: 'tickets',
      where: {
        and: [
          { user: { equals: userId } },
          { status: { equals: TICKET_STATUS.booked.value } },
          {
            or: [
              { 'giftInfo.isGifted': { equals: false } },
              {
                and: [
                  { 'giftInfo.isGifted': { equals: true } },
                  {
                    'giftInfo.recipientConfirmationExpiresAt': {
                      less_than: new Date().toISOString(),
                    },
                  },
                ],
              },
            ],
          },
          { ticketCode: { equals: ticketCode } },
        ],
      },
      limit: 1,
      pagination: false,
      depth: 2,
    })

    let ticket = exactRes?.docs?.[0] || null

    // ---- PASS 2: uppercase fallback (optional robustness) ----
    if (!ticket && ticketCode !== ticketCode.toUpperCase()) {
      const upperRes = await payload.find({
        collection: 'tickets',
        where: {
          and: [
            { user: { equals: userId } },
            { status: { equals: TICKET_STATUS.booked.value } },
            {
              or: [
                { 'giftInfo.isGifted': { equals: false } },
                {
                  and: [
                    { 'giftInfo.isGifted': { equals: true } },
                    {
                      'giftInfo.recipientConfirmationExpiresAt': {
                        less_than: new Date().toISOString(),
                      },
                    },
                  ],
                },
              ],
            },
            { ticketCode: { equals: ticketCode.toUpperCase() } },
          ],
        },
        limit: 1,
        pagination: false,
        depth: 2,
      })
      ticket = upperRes?.docs?.[0] || null
    }

    // Not found -> return consistent shape
    if (!ticket) {
      return NextResponse.json({
        ticket: null,
        isCheckedIn: false,
        checkedInAt: null,
      })
    }

    // ---- Check-in lookup (handle code & UPPERCASE, ignore soft-deleted) ----
    const candidates = Array.from(new Set([ticketCode, ticketCode.toUpperCase()]))

    const checkinRes = await payload.find({
      collection: 'checkinRecords',
      where: {
        and: [{ ticketCode: { in: candidates } }, { deletedAt: { exists: false } }],
      },
      limit: 1,
      pagination: false,
    })

    const checkinRecord = checkinRes?.docs?.[0] || null
    const isCheckedIn = Boolean(checkinRecord)
    const checkedInAt = checkinRecord?.checkInTime || checkinRecord?.createdAt || null

    return NextResponse.json({ ticket, isCheckedIn, checkedInAt })
  } catch (err) {
    console.error('[GET /api/user/tickets/checkin-status/[ticketCode]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
