import { redirect } from 'next/navigation'
import { getCheckinHistoryCached } from '../actions'
import HistoryClientPage from './page.client'
import { cookies } from 'next/headers'
import { checkAuthenticated } from '@/utilities/checkAuthenticated'

interface CheckinRecord {
  id: string
  ticketCode: string
  attendeeName: string
  eventTitle: string
  ticket: { seat?: string }
  checkInTime: string
  checkedInBy: { email: string }
}

const HistoryPage = async () => {
  const token = (await cookies()).get('token')?.value

  if (!token) {
    return redirect('/checkin')
  }

  const authData = await checkAuthenticated()

  if (!authData?.user) {
    return redirect('/checkin')
  }

  let initialHistory: CheckinRecord[] = []
  try {
    const response = await getCheckinHistoryCached({ token: token as string })()

    initialHistory = response as unknown as CheckinRecord[]
  } catch (error) {
    console.error('Error fetching initial check-in history:', error)
  }

  return <HistoryClientPage history={initialHistory} />
}

export default HistoryPage
