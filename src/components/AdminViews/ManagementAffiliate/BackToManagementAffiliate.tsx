import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const BackToManagementAffiliate = () => {
  return (
    <div style={{ paddingLeft: '55px', marginBottom: '8px' }}>
      <Link href="/admin/management-affiliate">
        <ArrowLeft />
        Back to Affiliate Management
      </Link>
    </div>
  )
}

export default BackToManagementAffiliate
