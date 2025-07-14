// GET /api/checkin-app/event-stats?eventId=X&scheduleId=Y
// Returns statistics for checkins for a specific event and schedule
// - Personal checkins (by current admin)
// - Total checkins for that event/schedule

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { getAdminUser } from '@/utilities/getAdminUser'
import { isAdminOrSuperAdminOrEventAdmin } from '@/access/isAdminOrSuperAdmin'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload()
    const adminUser = await getAdminUser()

    // Authentication check
    if (
      !adminUser ||
      !isAdminOrSuperAdminOrEventAdmin({
        req: { user: adminUser },
      })
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('eventId')
    const scheduleId = searchParams.get('scheduleId')

    if (!eventId) {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 })
    }

    // Build base query conditions
    const baseWhere: any = {
      event: { equals: eventId },
      deletedAt: { equals: null },
    }

    // Add scheduleId filter if provided
    if (scheduleId) {
      baseWhere.eventScheduleId = { equals: scheduleId }
    }

    // Get total checkins for this event/schedule
    const totalCheckins = await payload.find({
      collection: 'checkinRecords',
      where: baseWhere,
      limit: 0, // We only want the count
    })

    // Get checkins by current admin for this event/schedule
    const adminCheckins = await payload.find({
      collection: 'checkinRecords',
      where: {
        ...baseWhere,
        checkedInBy: { equals: adminUser.id },
      },
      limit: 0, // We only want the count
    })

    return NextResponse.json({
      eventId,
      scheduleId,
      stats: {
        totalCheckins: totalCheckins.totalDocs,
        adminCheckins: adminCheckins.totalDocs,
      },
    })
  } catch (error) {
    console.error('Event stats error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 