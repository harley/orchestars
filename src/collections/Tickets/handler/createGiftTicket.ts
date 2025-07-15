import { PayloadRequest } from 'payload'
import { NextResponse } from 'next/server'
import { TICKET_STATUS } from '../constants'
import { USER_ROLE } from '@/collections/Users/constants'
import { TransactionID } from '@/types/TransactionID'
import { sendGiftTicketAndAccountSetupMail } from '../helper/sendGiftTicketAndAccountSetupMail'
import { User } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { setUserResetPasswordToken } from '@/collections/Users/utils/setUserResetPasswordToken'
import { toZonedTime, format as tzFormat } from 'date-fns-tz'

interface CreateGiftTicketRequest {
  ownerId: number
  ticketIds: number[]
  recipientFirstName: string
  recipientLastName: string
  recipientEmail: string
  recipientPhone?: string
  message?: string
}

interface CreateOrFindUserResult {
  userId: number
  isNewUser: boolean
  user?: User
  error?: string
}

/**
 * Create or find user account for gift recipient
 */
async function createOrFindRecipientUser(
  email: string,
  firstName: string,
  lastName: string,
  phone: string | undefined,
  payload: any,
  transactionID?: string | number,
): Promise<CreateOrFindUserResult> {
  try {
    // First, try to find existing user
    const existingUsers = await payload.find({
      collection: 'users',
      where: { email: { equals: String(email).toLowerCase().trim() } },
      limit: 1,
      showHiddenFields: true,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        salt: true,
      },
    })

    if (existingUsers.docs.length > 0) {
      return {
        userId: existingUsers.docs[0].id,
        user: existingUsers.docs[0],
        isNewUser: false,
      }
    }

    // Create new user account
    const newUser = await payload.create({
      collection: 'users',
      data: {
        email,
        firstName,
        lastName,
        phoneNumber: phone || '',
        ...(phone
          ? { phoneNumbers: [{ phone, createdAt: new Date().toISOString(), isUsing: true }] }
          : {}),
        role: USER_ROLE.user.value,
      },
      req: transactionID ? { transactionID } : undefined,
    })

    return {
      userId: newUser.id,
      user: newUser,
      isNewUser: true,
    }
  } catch (error: any) {
    console.error('Error creating/finding recipient user:', error)
    return {
      userId: 0,
      isNewUser: false,
      error: `Failed to create/find user: ${error.message}`,
    }
  }
}

/**
 * Validate if tickets can be gifted
 */
async function validateTicketsForGifting(
  ticketIds: number[],
  ownerId: number,
  payload: any,
): Promise<{ valid: boolean; errors: string[]; tickets: any[] }> {
  const errors: string[] = []

  try {
    // Check if tickets exist and belong to owner
    const tickets = await payload.find({
      collection: 'tickets',
      where: {
        id: { in: ticketIds },
        user: { equals: ownerId },
        status: { equals: TICKET_STATUS.booked.value },
      },
      depth: 1,
      limit: ticketIds.length,
    })

    if (tickets.docs.length !== ticketIds.length) {
      errors.push('Some tickets are not found, not owned by user, or not in booked status')
    }

    // Check if any tickets are from past events
    const now = new Date()
    for (const ticket of tickets.docs) {
      if (ticket?.event?.startDatetime && new Date(ticket?.event?.startDatetime) < now) {
        errors.push(`Ticket ${ticket.ticketCode} is for a past event and cannot be gifted`)
      }
    }

    // Check if any tickets are already checked in
    const checkedInTickets = await payload.find({
      collection: 'checkinRecords',
      where: {
        ticket: { in: ticketIds },
        deletedAt: { equals: null },
      },
      limit: ticketIds.length,
    })

    if (checkedInTickets.docs.length > 0) {
      errors.push('Some tickets have already been checked in and cannot be gifted')
    }

    // Check if any tickets are already gifted
    const giftedTickets = tickets.docs.filter((ticket: any) => ticket.giftInfo?.isGifted)
    if (giftedTickets.length > 0) {
      errors.push('Some tickets have already been gifted')
    }

    return {
      valid: errors.length === 0,
      errors,
      tickets: tickets.docs,
    }
  } catch (error) {
    console.error('Error validating tickets for gifting:', error)
    return {
      valid: false,
      errors: [`Validation failed: ${(error as Error).message}`],
      tickets: [],
    }
  }
}

/**
 * Transfer tickets to recipient and mark as gifted
 */
async function transferTicketsToRecipient(
  ticketIds: number[],
  recipientUserId: number,
  recipientName: string,
  payload: any,
  transactionID?: TransactionID,
): Promise<{ success: boolean; errors: string[] }> {
  try {
    // Update each ticket
    await payload.update({
      collection: 'tickets',
      where: {
        id: { in: ticketIds },
      },
      data: {
        giftInfo: {
          isGifted: true,
          attendeeName: recipientName,
          giftRecipient: recipientUserId,
          giftDate: new Date().toISOString(),
        },
      },
      req: transactionID ? { transactionID } : undefined,
    })

    return { success: true, errors: [] }
  } catch (error) {
    console.error('Error transferring tickets:', error)
    return {
      success: false,
      errors: [`Transfer failed: ${(error as Error).message}`],
    }
  }
}

export const createGiftTicket = async (req: PayloadRequest): Promise<Response> => {
  try {
    if (!req.user || !['admin', 'super-admin'].includes(req.user.role)) {
      throw new Error('UNAUTHORIZED')
    }

    const body = ((await req.json?.()) || {}) as CreateGiftTicketRequest

    const {
      ownerId,
      ticketIds,
      recipientFirstName,
      recipientLastName,
      recipientEmail,
      recipientPhone,
    } = body

    // Validate required fields
    if (
      !ownerId ||
      !ticketIds?.length ||
      !recipientFirstName ||
      !recipientLastName ||
      !recipientEmail
    ) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 })
    }

    const payload = req.payload

    // Verify owner exists

    const owner = await payload
      .findByID({
        collection: 'users',
        id: ownerId,
        depth: 0,
      })
      .catch((_error) => null)

    if (!owner) {
      return NextResponse.json({ message: 'Ticket owner not found' }, { status: 404 })
    }

    // Start transaction for data consistency
    const transactionID = await payload.db.beginTransaction()
    if (!transactionID) {
      return NextResponse.json({ message: 'Failed to start transaction' }, { status: 500 })
    }

    try {
      // Validate tickets for gifting
      const validation = await validateTicketsForGifting(ticketIds, ownerId, payload)
      if (!validation.valid) {
        throw new Error(validation.errors.join('; '))
      }

      // Create or find recipient user
      const userResult = await createOrFindRecipientUser(
        recipientEmail,
        recipientFirstName,
        recipientLastName,
        recipientPhone,
        payload,
        transactionID,
      )

      if (userResult.error) {
        throw new Error(userResult.error)
      }

      // Transfer tickets to recipient
      const transferResult = await transferTicketsToRecipient(
        ticketIds,
        userResult.userId,
        `${recipientFirstName || ''} ${recipientLastName || ''}`.trim(),
        payload,
        transactionID,
      )

      if (!transferResult.success) {
        throw new Error(transferResult.errors.join('; '))
      }

      // Commit the transaction
      await payload.db.commitTransaction(transactionID)

      let setupLink = ''

      if (!userResult.user?.salt) {
        const setupToken = await setUserResetPasswordToken({
          userId: userResult.userId,
          transactionID,
        })

        // Build user setup link
        setupLink = `${getServerSideURL()}/user/reset-password?token=${setupToken}`
      }

      const ticketData = validation.tickets.map((ticket: any) => {
        const event = ticket?.event
        const startTime = event?.startDatetime
          ? tzFormat(toZonedTime(new Date(event.startDatetime), 'Asia/Ho_Chi_Minh'), 'HH:mm')
          : ''
        const endTime = event?.endDatetime
          ? tzFormat(toZonedTime(new Date(event.endDatetime), 'Asia/Ho_Chi_Minh'), 'HH:mm')
          : ''
        const eventLocation = event?.eventLocation as string

        return {
          ticketId: ticket.id,
          ticketCode: ticket.ticketCode,
          seat: ticket.seat,
          eventName: event?.title,
          eventDate: `${startTime || 'N/A'} - ${endTime || 'N/A'}, ${ticket?.eventDate || 'N/A'} (Giờ Việt Nam | Vietnam Time, GMT+7)`,
          eventLocation,
        }
      })

      // Send email to recipient
      await sendGiftTicketAndAccountSetupMail({
        event: validation.tickets[0].event,
        user: userResult.user as User,
        ticketData,
        payload,
        giftedByName: `${owner.firstName || ''} ${owner.lastName || ''}(${owner.email})`.trim(),
        setupLink,
      })

      return NextResponse.json({
        success: true,
        message: 'Tickets gifted successfully',
        data: {
          recipientUserId: userResult.userId,
          isNewUser: userResult.isNewUser,
          transferredTickets: ticketIds.length,
        },
      })
    } catch (error) {
      // Rollback the transaction on error
      await payload.db.rollbackTransaction(transactionID)
      throw error
    }
  } catch (error) {
    console.error('Error creating gift ticket:', error)
    return NextResponse.json(
      { message: 'Failed to create gift ticket', error: (error as Error).message },
      { status: 500 },
    )
  }
}
