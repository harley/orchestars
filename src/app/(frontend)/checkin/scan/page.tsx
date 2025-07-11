import React from 'react'
import CheckinScanPageClient from './page.client'
import ProtectedComponent from '@/components/CheckIn/Protected/ProtectedComponent'

const CheckinScanPage = () => {
  return (
    <ProtectedComponent>
      <CheckinScanPageClient />
    </ProtectedComponent>
  )
}

export default CheckinScanPage
