// This is a server component
import PageClient from './page.client' // Import the client component
import Link from 'next/link' // Import Link for navigation
import { getLocale, t } from '@/providers/I18n/server'
import PublicLayout from '@/components/User/PublicLayout'
import { decrypt } from '@/utilities/hashing'
import { getPayload } from '@/payload-config/getPayloadConfig'
import { RECIPIENT_TICKET_STATUS } from '@/collections/Tickets/constants/recipient-ticket-status'
import { isBefore, parseISO } from 'date-fns'
import { redirect } from 'next/navigation'
import { checkUserAuthenticated } from '../../actions/authenticated'
import CountdownToSetupPassword from './components/CountdownToSetupPassword'

type SearchParams = Promise<{ confirmationGiftToken: string; rpwToken: string; redirectTo: string }>
type Params = Promise<{ confirmationGiftToken: string }>

export default async function GiftTicketVerificationPage(props: {
  searchParams: SearchParams
  params: Params
}) {
  const locale = await getLocale()
  // Obtain the translate function for the server component
  const params = await props.params

  const confirmationGiftToken = decodeURIComponent(params.confirmationGiftToken)

  let decoded = ''

  const renderErrorPage = () => (
    <PublicLayout>
      <div className="w-full p-4 max-w-sm mx-auto text-center py-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {t('auth.invalidConfirmationLink', locale)}
        </h1>
        <p className="text-sm text-gray-600 mb-6">{t('auth.somethingWentWrong', locale)}</p>
        <Link href="/">
          <button className="w-full py-3 text-white rounded-lg font-semibold bg-gray-900 hover:bg-black transition">
            {t('common.goHome', locale)}
          </button>
        </Link>
      </div>
    </PublicLayout>
  )

  try {
    decoded = decrypt(confirmationGiftToken)
  } catch (_error) {
    console.log('_error', _error)

    return renderErrorPage()
  }

  let userData: {
    userId: number
    ticketCodes: string[]
  } = {
    userId: 0,
    ticketCodes: [],
  }

  try {
    userData = JSON.parse(decoded)
  } catch (_error) {
    console.error('_error', _error)
    return renderErrorPage()
  }

  const userId = userData.userId
  const ticketCodes = userData.ticketCodes

  if (!userId || !ticketCodes?.length) {
    return renderErrorPage()
  }

  const payload = await getPayload()

  // check user valid
  const user = await payload.findByID({
    collection: 'users',
    id: Number(userId),
  })

  if (!user) {
    return renderErrorPage()
  }

  // check ticket code valid
  const tickets = await payload.find({
    collection: 'tickets',
    where: {
      ticketCode: {
        in: ticketCodes,
      },
      'giftInfo.isGifted': {
        equals: true,
      },
      'giftInfo.giftRecipient': {
        equals: user.id,
      },
    },
  })

  if (tickets.docs.length !== ticketCodes.length) {
    return renderErrorPage()
  }

  // check ticket expiration
  const recipientConfirmationStatus = tickets.docs[0]?.giftInfo?.status
  const recipientConfirmationExpiresAt = tickets.docs[0]?.giftInfo?.recipientConfirmationExpiresAt

  if (recipientConfirmationStatus === RECIPIENT_TICKET_STATUS.confirmed.value) {
    const authData = await checkUserAuthenticated()

    if (authData) {
      return redirect('/user/my-tickets?t=gifted')
    }

    return (
      <PublicLayout>
        <PageClient />
      </PublicLayout>
    )
  }

  if (recipientConfirmationStatus !== RECIPIENT_TICKET_STATUS.pending.value) {
    return renderErrorPage()
  }

  if (
    recipientConfirmationExpiresAt &&
    isBefore(parseISO(recipientConfirmationExpiresAt), new Date())
  ) {
    return renderErrorPage()
  }

  // update to tickets to confirmed
  try {
    await payload.update({
      collection: 'tickets',
      where: {
        id: {
          in: tickets.docs.map((ticket) => ticket.id),
        },
      },
      data: {
        giftInfo: {
          status: RECIPIENT_TICKET_STATUS.confirmed.value,
          recipientConfirmationExpiresAt: null,
        },
      },
    })
  } catch (_error) {
    payload.logger.error(_error, 'Error updating tickets to confirmed')
    return renderErrorPage()
  }

  const searchParams = await props.searchParams

  if (searchParams.rpwToken) {
    let setupPwLink = `/user/reset-password?token=${searchParams.rpwToken}`

    if (searchParams.redirectTo) {
      setupPwLink += `&redirectTo=${searchParams.redirectTo}`
    }

    return (
      <PublicLayout>
        <CountdownToSetupPassword redirectTo={setupPwLink} />
      </PublicLayout>
    )
  }

  if (searchParams.redirectTo) {
    const authData = await checkUserAuthenticated()

    if (authData) {
      return redirect(searchParams.redirectTo)
    }

    return (
      <PublicLayout>
        <PageClient />
      </PublicLayout>
    )
  }

  // If valid, render the client component with the token
  return (
    <PublicLayout>
      <PageClient />
    </PublicLayout>
  )
}
