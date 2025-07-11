import { ScanPageClient } from './page.client'
import { checkAuthenticated } from '@/utilities/checkAuthenticated'
import { isAdminOrSuperAdminOrEventAdmin } from '@/access/isAdminOrSuperAdmin'
import { redirect } from 'next/navigation'

export default async function ScanPage() {
  const authData = await checkAuthenticated()
  if (!authData?.user || !isAdminOrSuperAdminOrEventAdmin({ req: { user: authData.user } })) {
    redirect('/admin')
  }
  return <ScanPageClient />
} 