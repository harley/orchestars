import { NextResponse } from 'next/server'
import { TICKET_STATUS } from '../constants'
import { USER_ROLE } from '@/collections/Users/constants'
import { TransactionID } from '@/types/TransactionID'
import { sendGiftTicketAndAccountSetupMail } from '../helper/sendGiftTicketAndAccountSetupMail'
import { Ticket, User } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { setUserResetPasswordToken } from '@/collections/Users/utils/setUserResetPasswordToken'
import { toZonedTime, format as tzFormat } from 'date-fns-tz'
import { formatCustomerInfo } from '@/utilities/formatCustomerInfo'
import { RECIPIENT_TICKET_STATUS } from '../constants/recipient-ticket-status'
import { encrypt } from '@/utilities/hashing'
import { getPayload } from '@/payload-config/getPayloadConfig'

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
        email: String(email).toLowerCase().trim(),
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
): Promise<{ valid: boolean; errors: string[]; tickets: Ticket[] }> {
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
          status: RECIPIENT_TICKET_STATUS.pending.value,
          recipientConfirmationExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // in 24 hours
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

export const createGiftTicket = async (data: CreateGiftTicketRequest): Promise<NextResponse> => {
  try {

    const {
      ownerId,
      ticketIds,
      recipientFirstName,
      recipientLastName,
      recipientEmail,
      recipientPhone,
    } = data

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

    const formattedRecipient = formatCustomerInfo({
      firstName: recipientFirstName,
      lastName: recipientLastName,
      email: recipientEmail,
      phoneNumber: recipientPhone,
    })

    const payload = await getPayload()

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
      const recipient = await createOrFindRecipientUser(
        formattedRecipient.email || '',
        formattedRecipient.firstName || '',
        formattedRecipient.lastName || '',
        formattedRecipient.phoneNumber || '',
        payload,
        transactionID,
      )

      if (recipient.error) {
        throw new Error(recipient.error)
      }

      // Transfer tickets to recipient
      const transferResult = await transferTicketsToRecipient(
        ticketIds,
        recipient.userId,
        `${recipientFirstName || ''} ${recipientLastName || ''}`.trim(),
        payload,
        transactionID,
      )

      if (!transferResult.success) {
        throw new Error(transferResult.errors.join('; '))
      }

      let confirmationLink = ''

      const ticketCodes = validation.tickets.map((tk) => tk.ticketCode)

      const encryptedData = {
        userId: recipient.userId,
        ticketCodes,
      }

      const confirmationGiftToken = encrypt(JSON.stringify(encryptedData))

      const redirectTo = `${getServerSideURL()}/user/my-tickets?t=gifted`

      // for the new user, it should send the receiving tickets link, the link will be expired in 24 hours
      if (!recipient.user?.salt) {
        const resetPwToken = await setUserResetPasswordToken({
          userId: recipient.userId,
          transactionID,
          expiresInHours: 24,
        })

        // Build user setup link
        confirmationLink = `${getServerSideURL()}/user/gift-ticket-verification/${confirmationGiftToken}?rpwToken=${resetPwToken}&redirectTo=${redirectTo}`
      } else {
        confirmationLink = `${getServerSideURL()}/user/gift-ticket-verification/${confirmationGiftToken}?redirectTo=${redirectTo}`
      }

      // Commit the transaction
      await payload.db.commitTransaction(transactionID)

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
          eventId: event?.id,
          eventName: event?.title,
          eventDate: `${startTime || 'N/A'} - ${endTime || 'N/A'}, ${ticket?.eventDate || 'N/A'} (Giờ Việt Nam | Vietnam Time, GMT+7)`,
          eventLocation,
        }
      })

      // Send email to recipient
      await sendGiftTicketAndAccountSetupMail({
        user: recipient.user as User,
        ticketData,
        payload,
        giftedByName: `${owner.firstName || ''} ${owner.lastName || ''}(${owner.email})`.trim(),
        confirmationLink,
      })

      return NextResponse.json({
        success: true,
        message: 'Tickets gifted successfully',
        data: {
          recipientUserId: recipient.userId,
          isNewUser: recipient.isNewUser,
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
      { status: 400 },
    )
  }
}
