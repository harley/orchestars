import { redirect } from 'next/navigation'
import ValidatePageClient from './page.client'
import { getAdminUser } from '@/utilities/getAdminUser'

const ValidatePage = async () => {
  // Confirm admin authentication
  const admin = await getAdminUser()

  if (!admin) {
    const redirectPath = '/checkin/validates'
    return redirect(`/admin/login?redirect=${encodeURIComponent(redirectPath)}`)
  }

  return <ValidatePageClient />
}

export default ValidatePage
