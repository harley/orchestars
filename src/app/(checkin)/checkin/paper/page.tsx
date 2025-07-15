import { redirect } from 'next/navigation'
import PaperPageClient from './page.client'
import { getAdminUser } from '@/utilities/getAdminUser'

const PaperPage = async () => {
  // Confirm admin authentication
  const admin = await getAdminUser()

  if (!admin) {
    const redirectPath = '/checkin/paper'
    return redirect(`/admin/login?redirect=${encodeURIComponent(redirectPath)}`)
  }

  return <PaperPageClient />
}

export default PaperPage